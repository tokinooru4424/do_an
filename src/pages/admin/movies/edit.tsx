import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic';
import { Button, Form, Col, Row, Spin } from 'antd';
import { LeftCircleFilled, SaveFilled, DeleteFilled } from '@ant-design/icons';
import to from 'await-to-js'
import dayjs from 'dayjs';

import { confirmDialog } from '@src/helpers/dialogs'

import useBaseHook from '@src/hooks/BaseHook'
import usePermissionHook from "@src/hooks/PermissionHook";

import MovieForm from '@src/components/Admin/Movies/MovieForm';
import movieService from '@root/src/services/movieService';

const Layout = dynamic(() => import('@src/layouts/Admin'), { ssr: false })

const Edit = () => {
  const { t, notify, redirect, router } = useBaseHook();
  const [loading, setLoading] = useState(false);
  const [movie, setMovie]: any[] = useState();
  const [form] = Form.useForm();
  const { checkPermission } = usePermissionHook();
  const { query } = router;
  const deletePer = checkPermission({
    "movies": "D"
  });

  const fetchData = async () => {
    let idError: any = null;
    if (!query.id) {
      idError = {
        code: 9996,
        message: 'missing ID'
      }
    }

    if (idError) return notify(t(`errors:${idError.code}`), '', 'error')

    let [movieError, movie]: [any, any] = await to(movieService().withAuth().detail({ id: query.id }));
    if (movieError) return notify(t(`errors:${movieError.code}`), '', 'error')

    setMovie(movie)
    // Chuẩn hóa giá trị image cho Upload.Dragger
    let imageFileList = [];
    if (movie.image) {
      imageFileList = [{
        uid: '-1',
        name: 'image',
        status: 'done',
        url: movie.image,
        response: { url: movie.image }
      }];
    }
    // Chuyển đổi ngày phát hành sang dayjs nếu có
    if (movie.realeaseDate) {
      movie.realeaseDate = dayjs(movie.realeaseDate);
    }
    form.setFieldsValue({
      ...movie,
      image: imageFileList
    });
  }

  useEffect(() => {
    fetchData()
  }, []);

  //submit form
  const onFinish = async (values: any): Promise<void> => {
    setLoading(true)

    if (Array.isArray(values.image) && values.image.length > 0) {
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
    values.duration = Number(values.duration);
    values.format = Number(values.format);
    if (values.status !== undefined) values.status = Number(values.status);
    if (values.realeaseDate) values.realeaseDate = values.realeaseDate.format('YYYY-MM-DD');
    let [error, result]: any[] = await to(movieService().withAuth().edit({
      id: movie.id,
      ...values
    }));
    setLoading(false)
    if (error) return notify(t(`errors:${error.code}`), '', 'error')
    notify(t("messages:message.recordMovieUpdated"))
    redirect("frontend.admin.movies.index")
    return result
  }

  const onDelete = async (): Promise<void> => {
    let [error, result]: any[] = await to(movieService().withAuth().destroy({ id: movie.id }));
    if (error) return notify(t(`errors:${error.code}`), '', 'error')
    notify(t('messages:message.recordMovieDeleted'))
    redirect("frontend.admin.movies.index")
    return result
  }

  if (!movie) return <div className="content"><Spin /></div>

  return <>
    <div className="content">
      <Form
        form={form}
        layout="vertical"
        name="editMovie"
        onFinish={onFinish}
        scrollToFirstError
      >
        <Row>
          <Col md={{ span: 16, offset: 4 }}>
            <MovieForm form={form} isEdit={true} />
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
    title={t("pages:movies.edit.title")}
    description={t("pages:movies.edit.description")}
    {...props}
  />
}

Edit.permissions = {
  "movies": "U"
}

export default Edit
