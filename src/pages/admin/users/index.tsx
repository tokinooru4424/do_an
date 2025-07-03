import React, { useState, useRef } from "react";
import useBaseHook from "@src/hooks/BaseHook";
import usePermissionHook from "@src/hooks/PermissionHook";
import dynamic from "next/dynamic";
import moment from "moment";

import { GridTable } from "@src/components/Table";
import { Button, ConfigProvider, Space, Tooltip } from "antd";
import { PlusCircleOutlined, DeleteOutlined, EditOutlined, CloudUploadOutlined, EyeOutlined } from "@ant-design/icons";
import { confirmDialog } from "@src/helpers/dialogs";
import { formatDate } from '@src/helpers/utils'
import ExportExcel from '@root/src/components/Admin/Users/Export';

import FilterDatePicker from "@src/components/Table/SearchComponents/DatePicker";
import userService from "@root/src/services/userService";

import to from "await-to-js";
import auth from "@src/helpers/auth";
import _ from "lodash";

const Layout = dynamic(() => import("@src/layouts/Admin"), { ssr: false });

const Index = () => {
  const { t, notify, redirect, getData } = useBaseHook();
  const tableRef = useRef(null);

  const [selectedIds, setSelectedIds] = useState([]);
  const [hiddenDeleteBtn, setHiddenDeleteBtn] = useState(true);
  const [cacheFilter, setCacheFilter] = useState({})

  const { checkPermission } = usePermissionHook();
  const createPer = checkPermission({
    users: "C",
  });
  const updatePer = checkPermission({
    users: "U",
  });
  const deletePer = checkPermission({
    users: "D",
  });
  const viewPer = checkPermission({
    users: "R"
  });

  const columns = [
    {
      title: t("pages:users.table.username"),
      dataIndex: "username",
      key: "users.username",
      sorter: true,
      filterable: true,
    },
    {
      title: t("pages:users.table.name"),
      dataIndex: "name",
      key: "users.name",
      sorter: true,
      filterable: true,
    },
    {
      title: t("pages:users.table.email"),
      dataIndex: "email",
      key: "users.email",
      sorter: true,
      filterable: true,
    },
    {
      title: t("pages:users.table.phoneNumber"),
      dataIndex: "phoneNumber",
      key: "users.phoneNumber",
      sorter: true,
      filterable: true,
    },
    {
      title: t("pages:users.table.birthday"),
      dataIndex: "birthday",
      key: "users.birthday",
      sorter: true,
      filterable: true,
      render: (text: string) => text ? moment(text).format("DD/MM/YYYY") : "",
    },
    {
      title: t("pages:users.table.role"),
      dataIndex: "role",
      key: "roles.name",
      sorter: true,
      filterable: true,
    },
    {
      title: t("pages:users.table.createdAt"),
      dataIndex: "createdAt",
      key: "users.createdAt",
      sorter: true,
      filterable: true,
      render: (text: Date, record: any) => formatDate(text),
      renderFilter: ({ column, confirm, ref }: FilterParam) => (
        <FilterDatePicker column={column} confirm={confirm} ref={ref} style={{ width: '100%' }} format="DD/MM/YYYY" />
      ),
    },
    {
      title: t("pages:users.table.actions"),
      key: "actions",
      fixed: "right",
      width: 100,
      render: (text: string, record: User) => (
        <ConfigProvider
          theme={{
            components: {
              Button: {
                colorBgContainer: "transparent",
                colorText: "#595959",
                colorBorder: "transparent",
                borderRadius: 4,
                boxShadow: "none",
              },
            },
          }}
        >
          <Space size="small">
            <Tooltip title={t("buttons:view")}>
              <Button
                type="default"
                shape="circle"
                icon={<EyeOutlined />}
                size="small"
                style={{
                  color: '#1890ff',
                  borderColor: '#1890ff'
                }}
                onClick={() => redirect("frontend.admin.users.view", { id: record.id })}
                hidden={!viewPer}
              />
            </Tooltip>
            <Tooltip title={t("buttons:edit")}>
              <Button
                type="default"
                shape="circle"
                icon={<EditOutlined />}
                size="small"
                style={{
                  color: '#52c41a',
                  borderColor: '#52c41a'
                }}
                onClick={() => redirect("frontend.admin.users.edit", { id: record.id })}
                hidden={!updatePer}
              />
            </Tooltip>
            <Tooltip title={t("buttons:delete")}>
              <Button
                type="default"
                shape="circle"
                icon={<DeleteOutlined />}
                size="small"
                danger
                onClick={() => {
                  confirmDialog({
                    title: t("buttons:deleteItem"),
                    content: t("messages:message.deleteConfirm"),
                    onOk: async () => {
                      let [error, result]: any[] = await to(
                        userService().withAuth().destroy({ id: record.id })
                      );
                      if (error) return notify(t(`errors:${error.code}`), "", "error");
                      notify(t("messages:message.recordUserDeleted"));
                      if (tableRef.current !== null) {
                        tableRef.current.reload();
                      }
                      return result;
                    },
                  });
                }}
                hidden={!deletePer || record.id == auth().user.id}
              />
            </Tooltip>
          </Space>
        </ConfigProvider>
      ),
    },
  ];

  const onChangeSelection = (data: any[]) => {
    if (data.length) setHiddenDeleteBtn(false);
    else setHiddenDeleteBtn(true);
    setSelectedIds(data);
  };

  const fetchData = async (values: any) => {
    if (!values.sorting.length) {
      values.sorting = [{ field: "users.id", direction: "desc" }];
    }
    setCacheFilter(values)

    let [error, users]: [any, User[]] = await to(
      userService().withAuth().index(values)
    );
    if (error) {
      const { code, message } = error;
      notify(t(`errors:${code}`), t(message), "error");
      return {};
    }

    return users;
  };

  const onExportExcel = async () => {
    let [error, users]: [any, User[]] = await to(
      userService().withAuth().index(cacheFilter)
    );
    if (error) {
      const { code, message } = error;
      notify(t(`errors:${code}`), t(message), "error");
      return {};
    }

    return getData(users, 'data', []);
  }

  const onDelete = async () => {
    let [error, result]: any[] = await to(
      userService().withAuth().delete({ ids: selectedIds })
    );

    if (error) return notify(t(`errors:${error.code}`), "", "error");
    notify(t("messages:message.recordUserDeleted"));

    if (tableRef.current !== null) {
      tableRef.current.reload();
    }

    setSelectedIds([]);
    setHiddenDeleteBtn(true);

    return result;
  };

  const rowSelection = {
    getCheckboxProps: (record) => ({
      disabled: record.id == auth().user.id,
      id: record.id,
    }),
  };

  return (
    <div className="content">
      <Button
        hidden={!createPer}
        onClick={() => redirect("frontend.admin.users.create")}
        type="primary"
        className="btn-top"
      >
        <PlusCircleOutlined />
        {t("buttons:create")}
      </Button>

      <Button
        danger
        className="btn-top"
        hidden={hiddenDeleteBtn || !deletePer}
        onClick={() => {
          confirmDialog({
            title: t("buttons:deleteItem"),
            content: t("messages:message.deleteConfirm"),
            onOk: () => onDelete(),
          });
        }}
      >
        <DeleteOutlined />
        {t("buttons:delete")}
      </Button>

      <Button
        hidden={!createPer}
        onClick={() => redirect('frontend.admin.users.upload')}
        type="primary"
        style={{
          backgroundColor: '#fc5603',
          border: 'none'
        }}
        className="btn-right"
      >
        <CloudUploadOutlined />
        {t('buttons:uploadExcel')}
      </Button>

      <ExportExcel
        fetcher={onExportExcel} // API dùng để lấy dữ liệu và set vào body của file excel
      />

      <GridTable
        ref={tableRef}
        columns={columns}
        fetchData={fetchData}
        rowSelection={{
          selectedRowKeys: selectedIds,
          onChange: (data: any[]) => onChangeSelection(data),
          ...rowSelection
        }}
        addIndexCol={false}
      />
    </div>
  );
};

Index.Layout = (props) => {
  const { t } = useBaseHook();

  return (
    <Layout
      title={t("pages:users.index.title")}
      description={t("pages:users.index.description")}
      {...props}
    />
  );
};

Index.permissions = {
  "users": "R",
};

export default Index;