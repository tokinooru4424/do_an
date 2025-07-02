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


import FilterDatePicker from "@src/components/Table/SearchComponents/DatePicker";
import cinemaService from "@root/src/services/cinemaService";

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
    cinemas: "C",
  });
  const updatePer = checkPermission({
    cinemas: "U",
  });
  const deletePer = checkPermission({
    cinemas: "D",
  });
  const viewPer = checkPermission({
    cinemas: "R"
  });

  const columns = [
    {
      title: t("pages:cinemas.table.name"),
      dataIndex: "name",
      key: "cinemas.name",
      sorter: true,
      filterable: true,
    },
    {
      title: t("pages:cinemas.table.email"),
      dataIndex: "email",
      key: "cinemas.email",
      sorter: true,
      filterable: true,
    },
    {
      title: t("pages:cinemas.table.phoneNumber"),
      dataIndex: "phoneNumber",
      key: "cinemas.phoneNumber",
      sorter: true,
      filterable: true,
    },
    {
      title: t("pages:cinemas.table.address"),
      dataIndex: "address",
      key: "cinemas.address",
      sorter: true,
      filterable: true,
    },
    {
      title: t("pages:cinemas.table.description"),
      dataIndex: "description",
      key: "cinemas.description",
      sorter: true,
      filterable: true,
    },
    {
      title: t("pages:cinemas.table.createdAt"),
      dataIndex: "createdAt",
      key: "cinemas.createdAt",
      sorter: true,
      filterable: true,
      render: (text: Date, record: any) => formatDate(text),
      renderFilter: ({ column, confirm, ref }: FilterParam) => (
        <FilterDatePicker column={column} confirm={confirm} ref={ref} />
      ),
    },
    {
      title: t("pages:cinemas.table.actions"),
      key: "actions",
      fixed: "right",
      width: 120,
      render: (text: string, record: Cinema) => (
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
                onClick={() => redirect("frontend.admin.cinemas.view", { id: record.id })}
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
                onClick={() => redirect("frontend.admin.cinemas.edit", { id: record.id })}
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
                        cinemaService().withAuth().destroy({ id: record.id })
                      );
                      if (error) return notify(t(`errors:${error.code}`), "", "error");
                      notify(t("messages:message.recordCinemaDeleted"));
                      if (tableRef.current !== null) {
                        tableRef.current.reload();
                      }
                      return result;
                    },
                  });
                }}
                hidden={!deletePer}
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
      values.sorting = [{ field: "cinemas.id", direction: "desc" }];
    }
    setCacheFilter(values)

    let [error, cinemas]: [any, any[]] = await to(
      cinemaService().withAuth().index(values)
    );
    if (error) {
      const { code, message } = error;
      notify(t(`errors:${code}`), t(message), "error");
      return {};
    }

    return cinemas;
  };

  const onDelete = async () => {
    let [error, result]: any[] = await to(
      cinemaService().withAuth().delete({ ids: selectedIds })
    );

    if (error) return notify(t(`errors:${error.code}`), "", "error");
    notify(t("messages:message.recordCinemaDeleted"));

    if (tableRef.current !== null) {
      tableRef.current.reload();
    }

    setSelectedIds([]);
    setHiddenDeleteBtn(true);

    return result;
  };

  const rowSelection = {
    getCheckboxProps: (record) => ({
      id: record.id,
    }),
  };

  return (
    <div className="content">
      <Button
        hidden={!createPer}
        onClick={() => redirect("frontend.admin.cinemas.create")}
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
      title={t("pages:cinemas.index.title")}
      description={t("pages:cinemas.index.description")}
      {...props}
    />
  );
};

Index.permissions = {
  "cinemas": "R",
};

export default Index;