import React, { useState, useRef } from "react";
import useBaseHook from "@src/hooks/BaseHook";
import usePermissionHook from "@src/hooks/PermissionHook";
import dynamic from "next/dynamic";
import moment from "moment";
import useSWR from "swr";

import { GridTable } from "@src/components/Table";
import { Button, ConfigProvider, Space, Tooltip } from "antd";
import { PlusCircleOutlined, DeleteOutlined, EditOutlined, CloudUploadOutlined, EyeOutlined } from "@ant-design/icons";
import { confirmDialog } from "@src/helpers/dialogs";
import { formatDate } from '@src/helpers/utils'


import FilterDatePicker from "@src/components/Table/SearchComponents/DatePicker";
import hallService from "@root/src/services/hallService";
import to from "await-to-js";
import auth from "@src/helpers/auth";
import _ from "lodash";
import constant from 'config/constant';
import FilterDropdown from "@src/components/Table/SearchComponents/Dropdown";
import cinemaService from "@root/src/services/cinemaService";

const Layout = dynamic(() => import("@src/layouts/Admin"), { ssr: false });

const Index = () => {
  const { t, notify, redirect, getData } = useBaseHook();
  const tableRef = useRef(null);

  const [selectedIds, setSelectedIds] = useState([]);
  const [hiddenDeleteBtn, setHiddenDeleteBtn] = useState(true);
  const [cacheFilter, setCacheFilter] = useState({})

  const { checkPermission } = usePermissionHook();
  const createPer = checkPermission({
    halls: "C",
  });
  const updatePer = checkPermission({
    halls: "U",
  });
  const deletePer = checkPermission({
    halls: "D",
  });
  const viewPer = checkPermission({
    halls: "R"
  });

  const columns = [
    {
      title: t("pages:halls.table.name"),
      dataIndex: "name",
      key: "halls.name",
      sorter: true,
      filterable: true,
    },
    {
      title: t("pages:halls.table.cinema"),
      dataIndex: "cinemaName",
      key: "cinema.name",
      sorter: true,
      filterable: true,
      renderFilter: ({ column, confirm, ref }: FilterParam) => {
        const { data: dataC } = useSWR("cinemaData", () =>
          cinemaService().withAuth().select2({ pageSize: -1 })
        );
        const cinemas = getData(dataC, "data", []);
        const cinemaOptions = cinemas?.map((cinema: { label: string; value: number }) => ({
          label: cinema.label,
          value: cinema.label,
        })) ?? [];
        return (
          <FilterDropdown
            column={column}
            confirm={confirm}
            ref={ref}
            mode="multiple"
            options={cinemaOptions}
            placeholder="Chọn rạp chiếu"
          />
        );
      },
    },
    {
      title: t("pages:halls.table.description"),
      dataIndex: "description",
      key: "halls.description",
      sorter: true,
      filterable: true,
    },
    {
      title: t("pages:halls.table.format"),
      dataIndex: "format",
      key: "halls.format",
      sorter: true,
      filterable: true,
      render: (text: number) => constant.hallFormat?.[text?.toString()] || text,
      renderFilter: ({ column, confirm, ref }: FilterParam) => {
        const formatOptions = Object.entries(constant.hallFormat).map(([key, value]) => ({
          label: value,
          value: Number(key),
        }));
        return (
          <FilterDropdown
            column={column}
            confirm={confirm}
            ref={ref}
            mode="multiple"
            options={formatOptions}
            placeholder="Chọn định dạng"
          />
        );
      },
    },
    {
      title: t("pages:halls.table.createdAt"),
      dataIndex: "createdAt",
      key: "halls.createdAt",
      sorter: true,
      filterable: true,
      render: (text: Date, record: any) => formatDate(text),
      renderFilter: ({ column, confirm, ref }: FilterParam) => (
        <FilterDatePicker column={column} confirm={confirm} ref={ref} style={{ width: '100%' }} format="DD/MM/YYYY" />
      ),
    },
    {
      title: t("pages:halls.table.actions"),
      key: "actions",
      fixed: "right",
      width: 120,
      render: (text: string, record: Hall) => (
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
                onClick={() => redirect("frontend.admin.halls.view", { id: record.id })}
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
                onClick={() => redirect("frontend.admin.halls.edit", { id: record.id })}
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
                        hallService().withAuth().destroy({ id: record.id })
                      );
                      if (error) return notify(t(`errors:${error.code}`), "", "error");
                      notify(t("messages:message.recordHallDeleted"));
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
      values.sorting = [{ field: "halls.id", direction: "desc" }];
    }
    setCacheFilter(values)

    let [error, halls]: [any, any[]] = await to(
      hallService().withAuth().index(values)
    );
    if (error) {
      const { code, message } = error;
      notify(t(`errors:${code}`), t(message), "error");
      return {};
    }

    return halls;
  };

  const onDelete = async () => {
    let [error, result]: any[] = await to(
      hallService().withAuth().delete({ ids: selectedIds })
    );

    if (error) return notify(t(`errors:${error.code}`), "", "error");
    notify(t("messages:message.recordHallDeleted"));

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
        onClick={() => redirect("frontend.admin.halls.create")}
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
      title={t("pages:halls.index.title")}
      description={t("pages:halls.index.description")}
      {...props}
    />
  );
};

Index.permissions = {
  "halls": "R",
};

export default Index;