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
import to from "await-to-js";
import auth from "@src/helpers/auth";
import _ from "lodash";
import FilterDropdown from "@src/components/Table/SearchComponents/Dropdown";
import cinemaService from "@root/src/services/cinemaService";
import movieService from "@root/src/services/movieService";
import constant from 'config/constant';

const Layout = dynamic(() => import("@src/layouts/Admin"), { ssr: false });

const Index = () => {
  const { t, notify, redirect, getData } = useBaseHook();
  const tableRef = useRef(null);

  const [selectedIds, setSelectedIds] = useState([]);
  const [hiddenDeleteBtn, setHiddenDeleteBtn] = useState(true);
  const [cacheFilter, setCacheFilter] = useState({})

  const { checkPermission } = usePermissionHook();
  const createPer = checkPermission({
    movies: "C",
  });
  const updatePer = checkPermission({
    movies: "U",
  });
  const deletePer = checkPermission({
    movies: "D",
  });
  const viewPer = checkPermission({
    movies: "R"
  });

  const columns = [
    {
      title: t("pages:movies.table.genre"),
      dataIndex: "genre",
      key: "movies.genre",
      sorter: true,
      filterable: true,
    },
    {
      title: t("pages:movies.table.image"),
      dataIndex: "image",
      key: "movies.image",
      render: (url: string) =>
        url ? <img src={url} alt="movie" style={{ width: 60, height: 90, objectFit: 'cover' }} /> : null,
    },
    {
      title: t("pages:movies.table.title"),
      dataIndex: "title",
      key: "movies.title",
      sorter: true,
      filterable: true,
    },
    {
      title: t("pages:movies.table.duration"),
      dataIndex: "duration",
      key: "movies.duration",
      sorter: true,
      filterable: true,
      render: (value: number) => value ? `${value} phút` : '',
    },
    {
      title: t("pages:movies.table.format"),
      dataIndex: "format",
      key: "movies.format",
      sorter: true,
      filterable: true,
      render: (value: number) => constant.hallFormat?.[value?.toString()] || value,
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
      title: t("pages:movies.table.realeaseDate"),
      dataIndex: "realeaseDate",
      key: "movies.realeaseDate",
      sorter: true,
      filterable: true,
      render: (text: Date) => text ? moment(text).format("DD/MM/YYYY") : "",
      renderFilter: ({ column, confirm, ref }: FilterParam) => (
        <FilterDatePicker column={column} confirm={confirm} ref={ref} />
      ),
    },
    {
      title: t("pages:movies.table.status"),
      dataIndex: "status",
      key: "movies.status",
      sorter: true,
      filterable: true,
      render: (value: number) => constant.movieStatus?.[value?.toString()] || value,
      renderFilter: ({ column, confirm, ref }: FilterParam) => {
        const statusOptions = Object.entries(constant.movieStatus).map(([key, value]) => ({
          label: value,
          value: Number(key),
        }));
        return (
          <FilterDropdown
            column={column}
            confirm={confirm}
            ref={ref}
            mode="multiple"
            options={statusOptions}
            placeholder="Chọn trạng thái"
          />
        );
      },
    },
    {
      title: t("pages:movies.table.createdAt"),
      dataIndex: "createdAt",
      key: "movies.createdAt",
      sorter: true,
      filterable: true,
      render: (text: Date) => text ? moment(text).format("DD/MM/YYYY HH:mm") : "",
      renderFilter: ({ column, confirm, ref }: FilterParam) => (
        <FilterDatePicker column={column} confirm={confirm} ref={ref} />
      ),
    },
    {
      title: t("pages:movies.table.actions"),
      key: "actions",
      fixed: "right",
      width: 120,
      render: (text: string, record: any) => (
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
                onClick={() => redirect("frontend.admin.movies.view", { id: record.id })}
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
                onClick={() => redirect("frontend.admin.movies.edit", { id: record.id })}
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
                        movieService().withAuth().destroy({ id: record.id })
                      );
                      if (error) return notify(t(`errors:${error.code}`), "", "error");
                      notify(t("messages:message.recordMovieDeleted"));
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
      values.sorting = [{ field: "movies.id", direction: "desc" }];
    }
    setCacheFilter(values)

    let [error, movies]: [any, any[]] = await to(
      movieService().withAuth().index(values)
    );
    if (error) {
      const { code, message } = error;
      notify(t(`errors:${code}`), t(message), "error");
      return {};
    }

    return movies;
  };

  const onDelete = async () => {
    let [error, result]: any[] = await to(
      movieService().withAuth().delete({ ids: selectedIds })
    );

    if (error) return notify(t(`errors:${error.code}`), "", "error");
    notify(t("messages:message.recordMovieDeleted"));

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
        onClick={() => redirect("frontend.admin.movies.create")}
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
      title={t("pages:movies.index.title")}
      description={t("pages:movies.index.description")}
      {...props}
    />
  );
};

Index.permissions = {
  "movies": "R",
};

export default Index;