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
import FilterDropdown from "@src/components/Table/SearchComponents/Dropdown";
import cinemaService from "@root/src/services/cinemaService";
import showTimeService from "@root/src/services/showTimeService";
import constant from 'config/constant';
import movieService from '@root/src/services/movieService';

const Layout = dynamic(() => import("@src/layouts/Admin"), { ssr: false });

const Index = () => {
  const { t, notify, redirect, getData } = useBaseHook();
  const tableRef = useRef(null);

  const [selectedIds, setSelectedIds] = useState([]);
  const [hiddenDeleteBtn, setHiddenDeleteBtn] = useState(true);
  const [cacheFilter, setCacheFilter] = useState({})

  const { checkPermission } = usePermissionHook();
  const createPer = checkPermission({
    showTimess: "C",
  });
  const updatePer = checkPermission({
    showTimess: "U",
  });
  const deletePer = checkPermission({
    showTimess: "D",
  });
  const viewPer = checkPermission({
    showTimess: "R"
  });

  const { data: dataM } = useSWR('movieData', () =>
    movieService().select2({ pageSize: -1 })
  );
  const movies = dataM?.data || [];
  const { data: dataH } = useSWR('hallData', () =>
    hallService().withAuth().select2({ pageSize: -1 })
  );
  const halls = dataH?.data || [];

  const columns = [
    {
      title: t("pages:showTimes.table.movie"),
      dataIndex: "movieName",
      key: "movie.title",
      sorter: true,
      filterable: true,
      render: (movieId: number) => movies.find((m: any) => m.value === movieId)?.label || movieId,
    },
    {
      title: t("pages:showTimes.table.hall"),
      dataIndex: "hallName",
      key: "hall.name",
      sorter: true,
      filterable: true,
      render: (hallId: number) => halls.find((h: any) => h.value === hallId)?.label || hallId,
    },
    {
      title: t("pages:showTimes.table.startTime"),
      dataIndex: "startTime",
      key: "showTimes.startTime",
      sorter: true,
      filterable: true,
      render: (text: Date) => text ? moment(text).format("DD/MM/YYYY HH:mm") : "",
      renderFilter: ({ column, confirm, ref }: FilterParam) => (
        <FilterDatePicker column={column} confirm={confirm} ref={ref} style={{ width: '100%' }} format="DD/MM/YYYY" />
      ),
    },
    {
      title: t("pages:showTimes.table.endTime"),
      dataIndex: "endTime",
      key: "showTimes.endTime",
      sorter: true,
      filterable: true,
      render: (text: Date) => text ? moment(text).format("DD/MM/YYYY HH:mm") : "",
      renderFilter: ({ column, confirm, ref }: FilterParam) => (
        <FilterDatePicker column={column} confirm={confirm} ref={ref} style={{ width: '100%' }} format="DD/MM/YYYY" />
      ),
    },
    {
      title: t("pages:showTimes.table.format"),
      dataIndex: "format",
      key: "showTimes.format",
      sorter: true,
      filterable: true,
      render: (format: number) => constant.hallFormat?.[format?.toString()] || format,
    },
    {
      title: t("pages:showTimes.table.language"),
      dataIndex: "language",
      key: "showTimes.language",
      sorter: true,
      filterable: true,
    },
    {
      title: t("pages:showTimes.table.subtitle"),
      dataIndex: "subtitle",
      key: "showTimes.subtitle",
      sorter: true,
      filterable: true,
    },
    {
      title: t("pages:showTimes.table.createdAt"),
      dataIndex: "createdAt",
      key: "showTimes.createdAt",
      sorter: true,
      filterable: true,
      render: (text: Date) => text ? moment(text).format("DD/MM/YYYY HH:mm") : "",
      renderFilter: ({ column, confirm, ref }: FilterParam) => (
        <FilterDatePicker column={column} confirm={confirm} ref={ref} style={{ width: '100%' }} format="DD/MM/YYYY" />
      ),
    },
    {
      title: t("pages:showTimes.table.actions"),
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
                onClick={() => redirect("frontend.admin.showTimes.view", { id: record.id })}
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
                onClick={() => redirect("frontend.admin.showTimes.edit", { id: record.id })}
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
                        showTimeService().withAuth().destroy({ id: record.id })
                      );
                      if (error) return notify(t(`errors:${error.code}`), "", "error");
                      notify(t("messages:message.recordShowTimeDeleted"));
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
      values.sorting = [{ field: "showTimes.movieId", direction: "desc" }];
    }
    setCacheFilter(values)

    let [error, showTimes]: [any, any[]] = await to(
      showTimeService().withAuth().index(values)
    );
    if (error) {
      const { code, message } = error;
      notify(t(`errors:${code}`), t(message), "error");
      return {};
    }

    return showTimes;
  };

  const onDelete = async () => {
    let [error, result]: any[] = await to(
      showTimeService().withAuth().delete({ ids: selectedIds })
    );

    if (error) return notify(t(`errors:${error.code}`), "", "error");
    notify(t("messages:message.recordShowTimeDeleted"));

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
        onClick={() => redirect("frontend.admin.showTimes.create")}
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
      title={t("pages:showTimes.index.title")}
      description={t("pages:showTimes.index.description")}
      {...props}
    />
  );
};

Index.permissions = {
  "showTImes": "R",
};

export default Index;