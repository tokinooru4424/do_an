import React, { useState } from 'react'
import dynamic from 'next/dynamic';
import { Button, Form, Col, Row } from 'antd';
import { LeftCircleFilled, SaveFilled } from '@ant-design/icons';
import to from 'await-to-js'
import useSWR from 'swr';

import useBaseHook from '@src/hooks/BaseHook'

import ShowTimeForm from '@src/components/Admin/ShowTimes/ShowTimeForm';
import showTimeService from '@root/src/services/showTimeService';
import movieService from '@root/src/services/movieService';
import hallService from '@root/src/services/hallService';

const Layout = dynamic(() => import('@src/layouts/Admin'), { ssr: false })

const Create = () => {
  const { t, notify, redirect, router } = useBaseHook();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const { data: dataM } = useSWR('movieData', () =>
    movieService().withAuth().select2({ pageSize: -1 })
  );
  const movies = dataM?.data || [];
  const { data: dataH } = useSWR('hallData', () =>
    hallService().withAuth().select2({ pageSize: -1 })
  );
  const halls = dataH?.data || [];

  const onFinish = async (values: any): Promise<void> => {
    // Kiểm tra định dạng phim và phòng chiếu
    const movie = movies.find((m: any) => m.value === values.movieId);
    const hall = halls.find((h: any) => h.value === values.hallId);
    if (movie && hall && movie.format !== hall.format) {
      form.setFields([
        {
          name: 'format',
          errors: [t('pages:showTimes.form.formatNotMatch')],
        },
      ]);
      return;
    }
    // Kiểm tra thời lượng phim
    if (movie && values.startTime && values.endTime) {
      const start = values.startTime.clone ? values.startTime.clone() : values.startTime;
      const end = values.endTime.clone ? values.endTime.clone() : values.endTime;
      const duration = movie.duration || 0;
      const minEnd = start.clone().add(duration, 'minutes');
      if (end.isBefore(minEnd)) {
        form.setFields([
          {
            name: 'endTime',
            errors: [t('pages:showTimes.form.endTimeInvalid') || 'Thời gian kết thúc phải lớn hơn thời gian bắt đầu cộng thời lượng phim!'],
          },
        ]);
        return;
      }
    }
    setLoading(true)
    // Xử lý dữ liệu ngày giờ nếu cần
    if (values.startTime) values.startTime = values.startTime.format('YYYY-MM-DD HH:mm');
    if (values.endTime) values.endTime = values.endTime.format('YYYY-MM-DD HH:mm');
    let [error, result]: any[] = await to(showTimeService().withAuth().create(values));
    setLoading(false)
    if (error) {
      if (error.code === 6302) {
        notify(t('errors:6302'), '', 'error');
        return;
      }
      return notify(t(`errors:${error.code}`), '', 'error')
    }
    notify(t("messages:message.recordCreated"))
    redirect("frontend.admin.showTimes.index")
    return result
  }

  return <>
    <div className="content">
      <Form
        form={form}
        name="createShowTime"
        layout="vertical"
        onFinish={onFinish}
        scrollToFirstError
      >
        <Row>
          <Col md={{ span: 16, offset: 4 }}>
            <ShowTimeForm form={form} isEdit={false} />
            <Form.Item wrapperCol={{ span: 24 }} className="text-center">
              <Button onClick={() => router.back()} className="btn-margin-right">
                <LeftCircleFilled /> {t('buttons:back')}
              </Button>
              <Button type="primary" htmlType="submit" loading={loading} className="btn-margin-right">
                <SaveFilled /> {t('buttons:submit')}
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </div>
  </>
}

Create.Layout = (props) => {
  const { t } = useBaseHook();
  return <Layout
    title={t("pages:showTimes.create.title")}
    description={t("pages:showTimes.create.description")}
    {...props}
  />
}

Create.permissions = {
  "showTimes": "C"
}

export default Create
