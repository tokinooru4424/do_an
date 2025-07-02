import React, { Component, Fragment } from "react";
import { FilterOutlined, SearchOutlined, ReloadOutlined } from "@ant-design/icons";
import { Table, Button, Typography } from "antd";
import { addQuery } from "@src/helpers/routes";
import { Base64 } from "js-base64";
import FilterInput from "./SearchComponents/Input";
import _ from "lodash";
import dayjs from "dayjs";

class GridTable extends Component {
  constructor(props) {
    super(props);
    this.initialProps = {
      bordered: true,
      size: "middle",
      showHeader: true,
      hasData: false,
    };

    this.state = {
      loading: false,
      reload: false,
      tableKey: 0,
    };

    this.pagination = {};
    this.total = this.props.total || 0;
    this.data = this.props.data || [];
    this.handleTableChange = this.handleTableChange.bind(this);
    this.addIndexCol = this.props.addIndexCol;
  }

  /**
   * Convert lại dữ liệu từ query đổi sang đúng format của column trong antd
   */
  defaultOptionToColumns = (defaultOptions) => {
    this.columns = this.columns.map((column) => {
      //set field
      if (!column.field) {
        column.field = column.key;
      }

      let sort = defaultOptions.sorting.find(
        (item) => item.field === column.field
      );
      if (sort) {
        let { direction } = sort;
        column.sortOrder = direction === "asc" ? "ascend" : "descend";
      } else {
        delete column.sortOrder;
      }

      let filters = [];
      for (let i of defaultOptions.filters) {
        if (
          i.field === column.field ||
          (i.operator == "raw" && this.arrEqual(i.field, column.field))
        )
          filters.push(i);
      }
      if (filters && filters.length) {
        column.filteredValue = [...filters];
      } else {
        column.filteredValue = [];
      }
      if (column.filterable) {
        //    delete column.filterable;
        column = { ...column, ...this.getColumnSearchProps(column) };
      }
      return column;
    });
  };

  currentColumnsString = "";
  componentDidMount() {
    this.init();
    //this.setState({ reload: !this.state.reload });
  }

  arrEqual(arr1, arr2) {
    if (!arr1?.length || !arr2?.length) return false;
    if (arr1?.length !== arr2?.length) return false;

    let sortedArr1 = arr1.slice().sort();
    let sortedArr2 = arr2.slice().sort();

    for (let i = 0; i < sortedArr1?.length; i++) {
      if (sortedArr1[i] !== sortedArr2[i]) return false;
    }

    return true;
  }

  componentDidUpdate(prevProps) {
    //update data trong trường hợp đổi từ props bên ngoài
    if (JSON.stringify(prevProps.data) !== JSON.stringify(this.props.data)) {
      this.data = this.props.data;
    }

    if (
      JSON.stringify(prevProps.columns) !== JSON.stringify(this.props.columns)
    ) {
      this.init();
    }
    if (
      JSON.stringify(this.props.router.query) !=
      JSON.stringify(prevProps.router.query)
    ) {
      this.setState({ reload: !this.state.reload }); //chỉ cần render lại view
    }
  }

  static makeQuery(options) {
    const { filters = [], sorting = [], pageSize, page } = options;
    let queryObj = {
      f: [],
      s: {},
      ps: pageSize,
      p: page,
    };

    for (let filter of filters) {
      queryObj.f.push([
        filter.field,
        filter.operator || "contains",
        filter.value,
      ]);
    }
    for (let sort of sorting) {
      queryObj.s[sort.field] = sort.direction;
    }
    return Base64.encode(JSON.stringify(queryObj));
  }

  /**
   * Khai báo các function cho dropdown search box
   */
  getColumnSearchProps = (column) => {
    let ref = React.createRef();
    let type = _.get(column, "filterType", "text");

    return {
      filterDropdown: ({ confirm, setSelectedKeys }) => {
        //gọi hàm confirm mỗi lần submit form search
        let confirmFnc = (values) => {
          setSelectedKeys(values);
          confirm();
          //this.reload();
        };
        if (column.renderFilter) {
          return column.renderFilter({ column, confirm: confirmFnc, ref });
        }
        return (
          <FilterInput
            column={column}
            ref={ref}
            type={type}
            confirm={confirmFnc}
          />
        );
      },
      filterIcon: (filtered) => {
        return (
          <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
        );
      },
      onFilterDropdownOpenChange: (visible) => {
        if (!visible && column.visibleSearch != visible) {
          column.visibleSearch = visible;
          if (ref.current) {
            ref.current.onSubmit();
          }
        }
        column.visibleSearch = visible;
      },
    };
  };

  clearAll = async () => {
    let { pageSize, page } = this.pagination;
    await this.handleTableChange({ pageSize, current: page + 1 }, {}, {});
  };

  /**
   * Khởi tạo các options từ query trên url
   */
  init() {
    const query = this.props.router.query;
    //fix bug luu lai query truoc do
    let defaultOptions = GridTable.getDataFromQuery({}, this.props);
    if (this.props.firstOptions) defaultOptions = this.props.firstOptions;
    this.pagination = {
      pageSize: defaultOptions.pageSize || 50,
      page: defaultOptions.page || 0,
    };
    this.columns = (this.props.columns || []).map((column) => ({ ...column })); //deepClone
    if (this.addIndexCol) {
      this.columns.unshift({
        title: "STT",
        align: "center",
        dataIndex: "base_index",
        key: "base_index",
        width: 50,
        responsive: ["lg"],
      });
    }
    this.defaultOptionToColumns(defaultOptions);
    this.reload();
  }

  /**
   * Reload Table
   */
  async reload() {
    if (this.state.loading) return;
    this.setState({ loading: true });
    if (typeof this.props.fetchData === "function") {
      const params = this.buildFetchData();
      const queryOptions = GridTable.makeQuery(params);
      // if (queryOptions != "eyJmIjpbXSwicyI6e30sInAiOjB9") { //empty filter,sorter,page...
      addQuery({ filters: queryOptions });
      // }

      let result = (await this.props.fetchData(params)) || {};
      if (result.total != undefined) this.total = result.total;
      this.data = _.get(result, "data", []);
    }
    this.setState({ loading: false });
  }

  /**
   * Set filter từ table vào biến this.columns để controlled
   */
  setFiltersToColumns = (filters = {}) => {
    this.columns = this.columns.map((column) => {
      let filter = filters[column.key];
      if (filter) {
        column.filteredValue = filter;
      } else {
        delete column.filteredValue;
      }
      return column;
    });
  };

  setSorterToColumns = (sorter = {}) => {
    this.columns = this.columns.map((column) => {
      if (column.key == sorter.columnKey) {
        column.sortOrder = sorter.order;
      } else {
        //delete column.sortOrder;
        column.sortOrder = null;
      }
      return column;
    });
  };

  setPagination = (pagination) => {
    this.pagination = {
      pageSize: pagination.pageSize,
      page: pagination.current - 1,
    };
  };

  handleTableChange = async (pagination, filters, sorter) => {
    this.setFiltersToColumns(filters);
    this.setSorterToColumns(sorter);
    this.setPagination(pagination);
    this.reload();
  };

  static getDataFromQuery(query = {}, defaultOptions = {}) {
    let queryObj = query.filters || {};
    if (typeof query.filters == "string") {
      try {
        queryObj = JSON.parse(Base64.decode(query.filters));
      } catch (e) {
        throw new Error(`filters params invalid format.`);
      }
    }
    if (!queryObj) return {};
    let filters = queryObj.f || [];
    let sorting = queryObj.s || {};
    let queryOut = {
      filters: defaultOptions.filters || [],
      sorting: defaultOptions.sorting || [],
      pageSize: queryObj.ps || defaultOptions.pageSize,
      page: queryObj.p || defaultOptions.page,
    };

    for (let filter of filters) {
      queryOut.filters.push({
        field: filter[0],
        operator: filter[1],
        value: filter[2],
      });
    }
    for (let field in sorting) {
      queryOut.sorting.push({
        field: field,
        direction: sorting[field],
      });
    }

    return queryOut;
  }

  static getOptions(query, defaultOptions) {
    if (query && Object.keys(query).length > 0)
      return this.getDataFromQuery(query, defaultOptions);
    return defaultOptions;
  }

  isISOString = (value) => {
    const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/;
    return isoRegex.test(value);
  };

  /**
   * Build data từ this.columns để khớp với format trên server
   */
  buildFetchData = () => {
    let params = {
      filters: [],
      sorting: [],
      pageSize: this.pagination.pageSize,
      page: this.pagination.page,
    };

    this.columns.map((column) => {
      if (column.filteredValue) {
        column.filteredValue = column.filteredValue.map((filter) => {
          if (
            filter.value &&
            Array.isArray(filter.value) &&
            filter.value.length
          ) {
            filter.value = filter.value.map((v) =>
              String(v).replaceAll(`%`, "%25")
            );
            return {
              ...filter,
              value: filter.value || "",
            };
          } else {
            return {
              ...filter,
              value: String(filter.value || "").replaceAll(`%`, "%25"),
            };
          }
        });
        params.filters = [...params.filters, ...column.filteredValue];
      }
      if (column.sortOrder) {
        params.sorting.push({
          field: column.field,
          direction: column.sortOrder == "ascend" ? "asc" : "desc",
        });
      }
    });
    return params;
  };

  formatTimeFilter = (data) => {
    data.value[0] = dayjs(data.value[0], "DD/MM/YYYY")
      .startOf("days")
      .toISOString();
    data.value[1] = dayjs(data.value[1], "DD/MM/YYYY")
      .endOf("days")
      .toISOString();
    return data;
  };

  getPagination = (pagination) => {
    if (pagination === false) return false;
    if (!pagination) pagination = {};
    const { pageSize, page } = this.pagination;
    return {
      ...pagination,
      total: this.total,
      position: "bottom",
      pageSize: pageSize || 50,
      current: page ? page + 1 : 1,
      showSizeChanger: true,
      showTotal: () => `Tổng ${this.total} bản ghi`,
      pageSizeOptions: ["2", "10", "50", "100", "200", "500"],
    };
  };

  renderButtonClearTable() {
    return (
      <Fragment>
        <Button
          title="Xóa tất cả bộ lọc"
          icon={<FilterOutlined />}
          shape="round"
          style={{ marginRight: "5px" }}
          onClick={async (e) => {
            e.preventDefault();
            if (typeof this.props?.clearStoreFilter === "function") {
              await this.props.clearStoreFilter();
              this.init();
            }
            this.props.router.query = {};
            this.setState({ tableKey: this.state.tableKey + 1 }); // Đổi table key để re-render lại clear value trong filter
            this.init();
            // this.props.clearFilter();
            if (typeof this.props?.clearFilter === "function") {
              this.props.clearFilter();
            }
            // this.setState({ clearfilter: "0" })
          }}
        ></Button>
      </Fragment>
    );
  }

  renderButtonRefreshTable() {
    return (
      <Fragment>
        <Button
          title="Làm mới dữ liệu"
          icon={<ReloadOutlined />}
          shape="round"
          onClick={async (e) => {
            e.preventDefault();
            this.pagination.page = 0;
            this.reload();
            // this.props.clearFilter();
            if (typeof this.props?.clearFilter === "function") {
              this.props.clearFilter();
            }
          }}
        ></Button>
      </Fragment>
    );
  }

  renderDescription() {
    if (!this.props.description) return null;
    if (React.isValidElement(this.props.description)) {
      return this.props.description;
    }
    if (typeof this.props.description === "string") {
      return (
        <Typography.Text
          type="danger"
          ellipsis={{
            rows: 1,
          }}
        >
          {this.props.description}
        </Typography.Text>
      );
    }
    return null;
  }

  render() {
    const {
      hasData = true,
      data = [],
      ellipsis,
      fetchData,
      columns,
      pagination,
      hiddenButtonClearFilterButton = false,
      hiddenButtonRefreshButton = false,
      hiddenPagination = false,
      description,
      ...otherProps
    } = this.props;

    const { page = 0, pageSize = 50 } = this.pagination || {};

    const showButtons = !hiddenButtonClearFilterButton || !hiddenButtonRefreshButton;

    return (
      <div>
        {showButtons && (
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '99%',
            gap: '20px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: "5px" }}>
              {!hiddenButtonClearFilterButton && this.renderButtonClearTable()}
              {!hiddenButtonRefreshButton && this.renderButtonRefreshTable()}
            </div>
            {this.renderDescription()}
          </div>
        )}
        <Table
          {...this.initialProps}
          // tableLayout="fixed"
          key={this.state.tableKey}
          scroll={{
            x: 900,
            y: 500,
            scrollToFirstRowOnChange: true,
          }}
          {...otherProps}
          columns={this.columns}
          dataSource={
            hasData
              ? this.data.map((row, index) => ({
                ...row,
                key: row.id,
                base_index: page * pageSize + index + 1,
              }))
              : null
          }
          onChange={this.handleTableChange}
          loading={this.state.loading}
          pagination={
            hiddenPagination
              ? { position: ["none", "none"] }
              : this.getPagination(pagination)
          }
          rowClassName={(record, index) => {
            if (this?.props?.customRowClassName && this?.props?.customRowClassName(record)) {
              return `rowClassName ${this.props.customRowClassName(record)}`;
            } else {
              return index % 2 === 0
                ? "rowClassName table-row-light"
                : "rowClassName table-row-dark";
            }
          }}
        />
      </div>
    );
  }
}

export default GridTable;
