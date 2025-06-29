import React, { useState } from 'react';
import useBaseHook from '@src/hooks/BaseHook';
import dynamic from 'next/dynamic';
import to from 'await-to-js';
import _ from 'lodash';

import BaseUploadExcel from '@root/src/components/Excel/BaseUploadExcel';
import userService from '@src/services/userService';

const Layout = dynamic(() => import('@src/layouts/Admin'), { ssr: false });

const UploadExcel = () => {
  const { t, notify } = useBaseHook();
  const [errorUploads, setError] = useState({ data: [], total: 0, pageSize: 10, countErrorRecord: 0 })
  const [warringUploads, setWarring] = useState({ data: [], total: 0, pageSize: 5, countWarringRecord: 0 })
  const [loading, setLoading] = useState(false)

  const defaultStartRow = 2

  const defaultColumns = [
    {
      index: 0,
      name: "username",
      label: t("pages:users.form.username")
    },
    {
      index: 1,
      name: "lastName",
      label: t("pages:users.form.lastName")
    },
    {
      index: 2,
      name: "firstName",
      label: t("pages:users.form.firstName")
    },
    {
      index: 3,
      name: "email",
      label: t("pages:users.form.email")
    },
    {
      index: 4,
      name: "roleName",
      label: t("pages:users.form.role")
    },
  ];

  const customArrayColumn = []

  const onSubmit = async (values: any) => {
    setLoading(true)

    let { file } = values
    let [userError, user]: [any, any] = await to(
      userService().withAuth().importExcel({ users: file })
    );
    setLoading(false)
    setError(_.get(userError, 'data.error', { data: [], total: 0, pageSize: 10, countErrorRecord: 0 }))
    setWarring({ data: user?.warring || [], total: user?.warring?.length || 0, pageSize: 5, countWarringRecord: user?.warring?.length || 0 })
    if (userError) {
      return notify(t(`errors:${userError.code}`), '', 'error');
    }
    return notify(t('messages:message.uploadExcelSuccess'));
  }

  return (
    <BaseUploadExcel
      defaultColumns={defaultColumns}
      customArrayColumn={customArrayColumn}
      defaultStartRow={defaultStartRow}
      onSubmit={onSubmit}
      loading={loading}
      warringUploads={warringUploads}
      errorUploads={errorUploads}
      parentPageLink={'frontend.admin.users.index'}
    />
  )
}

UploadExcel.Layout = (props) => {
  const { t } = useBaseHook();
  return (
    <Layout
      title={t('pages:users.upload.title')}
      description={t('pages:users.upload.description')}
      {...props}
    />
  );
};

UploadExcel.permissions = {
  "users": 'C',
};

export default UploadExcel