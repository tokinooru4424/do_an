import React, { useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Button } from 'antd';
import { PlusCircleOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import to from 'await-to-js'

import { GridTable } from '@src/components/Table';
import { confirmDialog } from '@src/helpers/dialogs'
import { formatDate } from '@src/helpers/utils'

import FilterDatePicker from '@src/components/Table/SearchComponents/DatePicker'

import useBaseHook from '@src/hooks/BaseHook'

import roleService from '@src/services/roleService';
import usePermissionHook from "@src/hooks/PermissionHook";

const Layout = dynamic(() => import('@src/layouts/Admin'), { ssr: false })

const Index = () => {
  const { t, notify, redirect } = useBaseHook();
  const tableRef = useRef(null)
  const [hiddenDeleteBtn, setHiddenDeleteBtn] = useState(true)
  const [selectedIds, setSelectedIds] = useState([])
  const { checkPermission } = usePermissionHook();

  const createPer = checkPermission({
    "roles": "C"
  })
  const updatePer = checkPermission({
    "roles": "U"
  })
  const deletePer = checkPermission({
    "roles": "D"
  })

  const columns = [
    {
      title: t('pages:roles.table.name'),
      dataIndex: 'name',
      key: 'roles.name',
      sorter: true,
      filterable: true,
      render: (text: string, record: any) => {
        return updatePer ? (
          <a onClick={() => redirect('frontend.admin.roles.edit', { id: record.id })}>
            <span className="show-on-hover">
              {record.name}
              <EditOutlined className="show-on-hover-item" />
            </span>
          </a>
        ) : record.name
      }
    },
    {
      title: t("pages:roles.table.description"),
      dataIndex: 'description',
      key: 'roles.description',
      sorter: true,
      filterable: true,
    },
    {
      title: t("pages:roles.table.parent"),
      dataIndex: 'parentName',
      key: 'roles.parentId',
      sorter: true,
      filterable: true
    },
    {
      title: t("pages:roles.table.createdAt"),
      dataIndex: 'createdAt',
      key: 'roles.createdAt',
      sorter: true,
      filterable: true,
      render: (text: Date, record: any) => formatDate(text),
      renderFilter: ({ column, confirm, ref }: FilterParam) =>
        <FilterDatePicker column={column} confirm={confirm} ref={ref} />
    },
    {
      title: t("pages:roles.table.decentralization"),
      dataIndex: 'decentralization',
      key: "decentralization",
      render: (text: string, record: any) => {
        return (<>
          {(createPer || updatePer) ? (
            <Button onClick={() => redirect("frontend.admin.roles.decentralization", { id: record.id })} type="primary">
              <PlusCircleOutlined />
              {t('buttons:decentralization')}
            </Button>
          ) : null}
        </>
        )
      }
    }
  ]

  const onChangeSelection = (data: any) => {
    if (data.length) setHiddenDeleteBtn(false)
    else setHiddenDeleteBtn(true)
    setSelectedIds(data)
  }

  const fetchData = async (values: any) => {
    if (!values.sorting.length) {
      values.sorting = [
        { field: "roles.id", direction: "desc" },
      ]
    }

    let [error, roles]: [any, Role[]] = await to(roleService().withAuth().index(values))
    if (error) {
      const { code, message } = error
      notify(t(`errors:${code}`), '', 'error')
      return {}
    }

    return roles
  }

  const onDelete = async () => {
    let [error, result]: any[] = await to(roleService().withAuth().delete({ ids: selectedIds }));
    if (error) return notify(t(`errors:${error.code}`), '', 'error')

    notify(t("messages:message.recordRoleGroupDeleted"));

    if (tableRef.current !== null) {
      tableRef.current.reload()
    }

    setSelectedIds([])
    setHiddenDeleteBtn(true)
  }

  return (
    <div className="content">
      <Button hidden={!createPer}
        onClick={() => redirect("frontend.admin.roles.create")}
        type="primary"
        className='btn-top'
      >
        <PlusCircleOutlined />
        {t('buttons:create')}
      </Button>

      <Button
        danger
        className='btn-top'
        hidden={hiddenDeleteBtn || !deletePer}
        onClick={() => {
          confirmDialog({
            title: t('buttons:deleteItem'),
            content: t('messages:message.deleteConfirm'),
            onOk: () => onDelete()
          })
        }}
      >
        <DeleteOutlined />
        {t('buttons:delete')}
      </Button>

      <GridTable
        ref={tableRef}
        columns={columns}
        fetchData={fetchData}
        rowSelection={{
          selectedRowKeys: selectedIds,
          onChange: (data: any[]) => onChangeSelection(data)
        }}
        addIndexCol={false}
      />
    </div>
  )
}

Index.Layout = (props) => {
  const { t } = useBaseHook();

  return <Layout
    title={t("pages:roles.index.title")}
    description={t("pages:roles.index.description")}
    {...props}
  />
}

Index.permissions = {
  "roles": "R"
};

export default Index