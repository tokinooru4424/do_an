import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic';
import { Button, Form, Col, Row, Spin } from 'antd';
import { LeftCircleFilled, SaveFilled, DeleteFilled } from '@ant-design/icons';
import to from 'await-to-js'
import moment from 'moment';
import useSWR from 'swr';

import auth from '@src/helpers/auth'
import { confirmDialog } from '@src/helpers/dialogs'

import useBaseHook from '@src/hooks/BaseHook'
import usePermissionHook from "@src/hooks/PermissionHook";

import ShowTimeForm from '@src/components/Admin/ShowTimes/ShowTimeForm';
import showTimeService from '@root/src/services/showTimeService';
import movieService from '@root/src/services/movieService';
import hallService from '@root/src/services/hallService';

const Layout = dynamic(() => import('@src/layouts/Admin'), { ssr: false })

const Edit = () => {
  const { t, notify, redirect, router } = useBaseHook();
  const [loading, setLoading] = useState(false);
  const [showTime, setShowTime]: any[] = useState();
  const [form] = Form.useForm();
  const { checkPermission } = usePermissionHook();
  const { query } = router;
  const deletePer = checkPermission({
    "showTimes": "D"
  });

  const { data: dataM } = useSWR('movieData', () =>
    movieService().withAuth().select2({ pageSize: -1 })
  );
  const movies = dataM?.data || [];
  const { data: dataH } = useSWR('hallData', () =>
    hallService().withAuth().select2({ pageSize: -1 })
  );
  const halls = dataH?.data || [];

  const fetchData = async () => {
    let idError: any = null;
    if (!query.id) {
      idError = {
        code: 9996,
        message: 'missing ID'
      }
    }

    if (idError) return notify(t(`errors:${idError.code}`), '', 'error')

    let [showTimeError, showTime]: [any, any] = await to(showTimeService().withAuth().detail({ id: query.id }));
    if (showTimeError) return notify(t(`errors:${showTimeError.code}`), '', 'error')

    setShowTime(showTime)
    form.setFieldsValue({
      ...showTime,
      startTime: showTime.startTime ? moment(showTime.startTime) : undefined,
      endTime: showTime.endTime ? moment(showTime.endTime) : undefined,
    });
  }

  useEffect(() => {
    fetchData()
  }, []);

  //submit form
  const onFinish = async (values: any): Promise<void> => {
    // Kiểm tra định dạng phim và phòng chiếu
    const movie = movies.find((m: any) => m.value == values.movieId);
    const hall = halls.find((h: any) => h.value == values.hallId);
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
    if (values.startTime) values.startTime = values.startTime.format('YYYY-MM-DD HH:mm');
    if (values.endTime) values.endTime = values.endTime.format('YYYY-MM-DD HH:mm');
    let [error, result]: any[] = await to(showTimeService().withAuth().edit({
      id: showTime.id,
      ...values
    }));
    setLoading(false)
    if (error) {
      if (error.code === 6302) {
        notify(t('errors:6302'), '', 'error');
        return;
      }
      return notify(t(`errors:${error.code}`), '', 'error')
    }
    notify(t("messages:message.recordShowTimeUpdated"))
    redirect("frontend.admin.showTimes.index")
    return result
  }

  const onDelete = async (): Promise<void> => {
    let [error, result]: any[] = await to(showTimeService().withAuth().destroy({ id: showTime.id }));
    if (error) return notify(t(`errors:${error.code}`), '', 'error')
    notify(t('messages:message.recordShowTimeDeleted'))
    redirect("frontend.admin.showTimes.index")
    return result
  }

  if (!showTime) return <div className="content"><Spin /></div>

  return <>
    <div className="content">
      <Form
        form={form}
        layout="vertical"
        name="editShowTime"
        onFinish={onFinish}
        scrollToFirstError
      >
        <Row>
          <Col md={{ span: 16, offset: 4 }}>
            <ShowTimeForm form={form} isEdit={true} />
            <Form.Item wrapperCol={{ span: 24 }} className="text-center">
              <Button onClick={() => router.back()} className="btn-margin-right">
                <LeftCircleFilled /> {t('buttons:back')}
              </Button>
              <Button type="primary" htmlType="submit" className="btn-margin-right" loading={loading}>
                <SaveFilled /> {t('buttons:submit')}
              </Button>
              <Button hidden={!deletePer} danger
                onClick={() => {
                  confirmDialog({
                    title: t('buttons:deleteItem'),
                    content: t('messages:message.deleteConfirm'),
                    onOk: () => onDelete()
                  })
                }}
              >
                <DeleteFilled /> {t('buttons:deleteItem')}
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </div>
  </>
}

Edit.Layout = (props) => {
  const { t } = useBaseHook();
  return <Layout
    title={t("pages:showTimes.edit.title")}
    description={t("pages:showTimes.edit.description")}
    {...props}
  />
}

Edit.permissions = {
  "showTimes": "U"
}

export default Edit
