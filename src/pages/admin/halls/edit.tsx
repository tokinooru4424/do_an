import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic';
import { Button, Form, Col, Row, Spin } from 'antd';
import { LeftCircleFilled, SaveFilled, DeleteFilled } from '@ant-design/icons';
import to from 'await-to-js'

import { confirmDialog } from '@src/helpers/dialogs'

import useBaseHook from '@src/hooks/BaseHook'
import usePermissionHook from "@src/hooks/PermissionHook";

import HallForm from '@src/components/Admin/Halls/HallForm';
import hallService from '@root/src/services/hallService';

const Layout = dynamic(() => import('@src/layouts/Admin'), { ssr: false })

const Edit = () => {
  const { t, notify, redirect, router } = useBaseHook();
  const [loading, setLoading] = useState(false);
  const [hall, setHall]: any[] = useState<Hall>();
  const [form] = Form.useForm();
  const { checkPermission } = usePermissionHook();
  const { query } = router;
  const deletePer = checkPermission({
    "halls": "D"
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

    let [hallError, hall]: [any, any] = await to(hallService().withAuth().detail({ id: query.id }));
    if (hallError) return notify(t(`errors:${hallError.code}`), '', 'error')

    setHall(hall)
    form.setFieldsValue({
      name: hall.name,
      cinemaId: hall.cinemaId,
      description: hall.description,
      format: hall.format,
      totalSeat: hall.totalSeat,
      seatInRow: hall.seatInRow,
      seatInColumn: hall.seatInColumn
    });
  }

  useEffect(() => {
    fetchData()
  }, []);

  //submit form
  const onFinish = async (values: any): Promise<void> => {
    setLoading(true)
    let [error, result]: any[] = await to(hallService().withAuth().edit({
      id: hall.id,
      ...values
    }));
    setLoading(false)
    if (error) return notify(t(`errors:${error.code}`), '', 'error')
    notify(t("messages:message.recordHallUpdated"))
    redirect("frontend.admin.halls.index")
    return result
  }

  const onDelete = async (): Promise<void> => {
    let [error, result]: any[] = await to(hallService().withAuth().destroy({ id: hall.id }));
    if (error) return notify(t(`errors:${error.code}`), '', 'error')
    notify(t('messages:message.recordHallDeleted'))
    redirect("frontend.admin.halls.index")
    return result
  }

  if (!hall) return <div className="content"><Spin /></div>

  return <>
    <div className="content">
      <Form
        form={form}
        layout="vertical"
        name="editHall"
        onFinish={onFinish}
        scrollToFirstError
      >
        <Row>
          <Col md={{ span: 16, offset: 4 }}>
            <HallForm form={form} isEdit={true} />
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
    title={t("pages:halls.edit.title")}
    description={t("pages:halls.edit.description")}
    {...props}
  />
}

Edit.permissions = {
  "halls": "U"
}

export default Edit
