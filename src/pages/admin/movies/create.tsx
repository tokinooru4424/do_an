import React, { useState } from 'react'
import dynamic from 'next/dynamic';
import { Button, Form, Col, Row } from 'antd';
import { LeftCircleFilled, SaveFilled } from '@ant-design/icons';
import to from 'await-to-js'

import useBaseHook from '@src/hooks/BaseHook'

import MovieForm from '@src/components/Admin/Movies/MovieForm';
import movieService from '@root/src/services/movieService';

const Layout = dynamic(() => import('@src/layouts/Admin'), { ssr: false })

const Create = () => {
  const { t, notify, redirect, router } = useBaseHook();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const onFinish = async (values: any): Promise<void> => {
    setLoading(true);
    // Lấy url ảnh từ fileList nếu có
    if (Array.isArray(values.image) && values.image.length > 0) {
      // Ưu tiên lấy từ response trả về khi upload thành công
      const fileObj = values.image[0];
      if (fileObj.response && fileObj.response.data && fileObj.response.data.url) {
        values.image = fileObj.response.data.url;
      } else if (fileObj.url) {
        values.image = fileObj.url;
      } else {
        values.image = '';
      }
    } else {
      values.image = '';
    }
    if (Array.isArray(values.banner) && values.banner.length > 0) {
      const fileObj = values.banner[0];
      if (fileObj.response && fileObj.response.data && fileObj.response.data.url) {
        values.banner = fileObj.response.data.url;
      } else if (fileObj.url) {
        values.banner = fileObj.url;
      } else {
        values.banner = '';
      }
    } else {
      values.banner = '';
    }
    // Đảm bảo đúng kiểu dữ liệu
    values.duration = Number(values.duration);
    values.format = Number(values.format);
    if (values.status !== undefined) values.status = Number(values.status);
    if (values.realeaseDate) values.realeaseDate = values.realeaseDate.format('YYYY-MM-DD');

    let [error, result]: any[] = await to(movieService().withAuth().create(values));
    setLoading(false);
    if (error) return notify(t(`errors:${error.code}`), '', 'error');
    notify(t("messages:message.recordCreated"));
    redirect("frontend.admin.movies.index");
    return result;
  }

  return <>
    <div className="content">
      <Form
        form={form}
        name="createMovie"
        layout="vertical"
        onFinish={onFinish}
        scrollToFirstError
      >
        <Row>
          <Col md={{ span: 16, offset: 4 }}>
            <MovieForm form={form} isEdit={false} />
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
  </>;
}

Create.Layout = (props) => {
  const { t } = useBaseHook();
  return <Layout
    title={t("pages:movies.create.title")}
    description={t("pages:movies.create.description")}
    {...props}
  />
}

Create.permissions = {
  "movies": "C"
}

export default Create
