import React, { useRef, useState } from "react";
import useBaseHook from "@src/hooks/BaseHook";

import { Button, Tooltip, Select, Form, Row, Col, Typography, InputNumber, Divider, Table } from "antd";
import { CloudDownloadOutlined, LeftCircleFilled, UploadOutlined } from "@ant-design/icons";

import UploadExcelField from "./UploadExcelField";
import File from './Xlsx';

import _ from 'lodash';

const { Option } = Select

interface ErrorUploadTable {
  data: any[];
  total: number;
  pageSize: number;
  countErrorRecord: number;
}

interface WarringUploadTable {
  data: any[];
  total: number;
  pageSize: number;
  countWarringRecord: number;
}

const BaseUploadExcel = ({ onSubmit, loading = false, disabled = false, normalizeData, defaultStartRow = 2, renderEditStartRow, customArrayColumn = [], defaultColumns = [], widthRow = 6, exampleFileUpload, parentPageLink, errorUploads, warringUploads }:
  { onSubmit: Function, loading: boolean, disabled?: boolean, normalizeData?: Function, defaultStartRow?: number, renderEditStartRow?: Function, customArrayColumn?: Array<any>, defaultColumns?: any, widthRow?: number, exampleFileUpload?: string, parentPageLink: string, errorUploads: ErrorUploadTable, warringUploads: WarringUploadTable }) => {
  const [form] = Form.useForm();
  const inputRef = useRef(null);

  const { t, redirect } = useBaseHook();

  const [startRow, setStartRow] = useState(defaultStartRow);
  const [countTotalRecords, setCountTotalRecord] = useState(0);
  const [defaultCol, setDefaultCol] = useState(defaultColumns);
  const [defaultArrayCol, setDefaultArrayCol] = useState(customArrayColumn);
  const [excelColumns, setExcelColumns] = useState([
    "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y",
    "Z", "AA", "AB", "AC", "AD", "AE", "AF", "AG", "AH", "AI", "AJ", "AK", "AL", "AM", "AN", "AO", "AP", "AQ", "AR", "AS",
  ]);

  const defaultRenderEditStartRow = () => {
    return (
      <Col xs={12} lg={12}>
        <Form.Item
          label={t("pages:excel.input.startRow")}
          name="startRow"
          labelCol={{ xs: { span: 24 }, sm: { span: 3 } }}
          wrapperCol={{ xs: { span: 24 }, sm: { span: 6 } }}
          initialValue={startRow}
          rules={[
            { required: true, message: t("messages:form.required", { name: t("pages:excel.input.startRow") }) },
          ]}
        >
          <InputNumber
            onChange={(value) => setStartRow(value)}
            defaultValue={startRow}
          />
        </Form.Item>
      </Col>
    )
  }

  const assignColumn = (item) => {
    let assignCol: any = [...defaultCol]
    assignCol.forEach((element: any, index: number) => {
      if (element.name === item.name) {
        assignCol[index] = item
      }
    })
    setDefaultCol(assignCol)
  }

  const assignCustomArrayColumn = (item) => {
    let assignArrayCol: any = [...defaultArrayCol]
    assignArrayCol.forEach((element: any, index: number) => {
      if (element.name === item.name) {
        assignArrayCol[index] = item
      }
    })
    setDefaultArrayCol(assignArrayCol)
  }

  const renderAssignColumn = () => {
    return defaultCol.map((column: any) => {
      return (
        <Col key={column.name} xs={24} lg={widthRow}>
          <Form.Item
            label={column.label}
            name={column.name}
            labelCol={{ xs: { span: 24 }, sm: { span: 6 } }}
            wrapperCol={{ xs: { span: 24 }, sm: { span: 12 } }}
            initialValue={column.index}
          >
            <Select
              onChange={(value) => assignColumn({ ...column, index: value })}
              showSearch
              filterOption={(input, option) => {
                return option?.props?.children?.toLowerCase().includes(input.toLowerCase())
              }}
              defaultValue={column.index}
            >
              {
                excelColumns.map((excelColumn, index) => {
                  return (
                    <Option key={index} value={index}>
                      {excelColumn}
                    </Option>
                  )
                })
              }
            </Select>
          </Form.Item>
        </Col>
      )
    })
  }

  const renderCustomColumn = () => {
    const renderArrayColumn = _.groupBy(defaultArrayCol, 'group')
    return Object.keys(renderArrayColumn).map((column: any) => {
      return (
        <Row key={column}>
          <Divider style={{ margin: '12px' }} />
          <Col xs={24}>
            <Typography style={{
              textTransform: 'uppercase',
              fontSize: '14px',
              fontWeight: '500',
              textAlign: 'left',
              marginBottom: '7px'
            }}>
              {column}
            </Typography>
          </Col>
          {
            renderArrayColumn[column].map((childCol: any, index: any) => (
              <Col key={childCol.name} xs={24} lg={widthRow}>
                <Form.Item
                  label={childCol.label}
                  name={`${childCol.name}`}
                  labelCol={{ xs: { span: 24 }, sm: { span: 6 } }}
                  wrapperCol={{ xs: { span: 24 }, sm: { span: 12 } }}
                  initialValue={childCol.index}
                >
                  <Select
                    onChange={(value) => assignCustomArrayColumn({ ...childCol, index: value })}
                    showSearch
                    filterOption={(input, option) => {
                      return option?.props?.children?.toLowerCase().includes(input.toLowerCase())
                    }}
                    defaultValue={childCol.index}
                  >
                    {
                      excelColumns.map((excelColumn, index) => {
                        return (
                          <Option key={index} value={index}>
                            {excelColumn}
                          </Option>
                        )
                      })
                    }
                  </Select>
                </Form.Item>
              </Col>
            ))
          }
        </Row>
      )
    })
  }

  const convertData = (data: any) => {
    if (!data) return

    data = data.slice(startRow - 1, data.length) //lấy từ dòng bao nhiêu
    data = data.filter(item => Array.isArray(item) && item.length > 0); // xóa các dòng trống
    data = assignDataWithColumn(data);    //gán column với data
    data = data.map(row => { return normalizeData ? normalizeData(row) : defaultNormalizeData(row) }) || [] //chuẩn hóa dữ liệu

    setCountTotalRecord(data.length)
    return data
  }

  const assignDataWithColumn = (data: any) => {
    const arrayCol = defaultArrayCol ? _.groupBy(defaultArrayCol, 'groupName') : null
    let dataWithColumn = data.map(row => {    //Gán tên cột và convert data thành object
      let object = {}
      defaultCol.forEach((column: any) => {
        object[column.name] = row[column.index]
      });
      if (arrayCol) {
        Object.keys(arrayCol).map((column: any) => {
          let from = _.minBy(arrayCol[column], 'index')
          let to = _.maxBy(arrayCol[column], 'index')
          let type = _.get(arrayCol[column], '[0].type', 'string')
          row.map((item, i) => {
            if (i >= from['index'] && i <= to['index']) {
              object[column] = object[column] ? object[column] : []
              if (type === 'string') item = String(item).trim()
              if (type === 'number') item = Number(item)
              if (item) object[column].push(item)
            }
          })
        })
      }
      return object
    })
    return dataWithColumn
  }

  const defaultNormalizeData = (row) => {
    return {
      ...row,
    }
  }

  const onSubmitExcel = async (value: any) => {
    let data = await File.readFileFromInput(value.file)
    value.file = convertData(data)
    onSubmit(value)
  }

  return (
    <div className='content'>
      <Form
        form={form}
        onFinish={onSubmitExcel}
        labelWrap
      >
        <Row>
          {renderEditStartRow ? renderEditStartRow() : defaultRenderEditStartRow()}
          {
            exampleFileUpload ?
              <Col xs={12} lg={12}>
                <a href={exampleFileUpload}>
                  <Tooltip title={t("buttons:downloadExampleFileXLSX")} key="downloadExcel">
                    <Button shape="round" icon={<CloudDownloadOutlined />} style={{ float: 'right', marginLeft: '0.5em' }} />
                  </Tooltip>
                </a>
              </Col> : ''
          }
        </Row>
        <Row>
          {renderAssignColumn()}
        </Row>
        {customArrayColumn ? renderCustomColumn() : ''}
        <Row>
          <Col style={{ height: '280px' }} xs={24}>
            <UploadExcelField
              disabled={disabled}
              form={form}
            />
          </Col>
          <Col style={{ textAlign: 'center', marginTop: '10px' }} xs={24} lg={24}>
            <Button
              color="default"
              style={{
                marginRight: '12px'
              }}
              onClick={() => redirect(parentPageLink)}
            >
              <LeftCircleFilled /> {t("buttons:back")}
            </Button>
            <Button
              style={{ width: '200px' }}
              type="primary"
              ref={inputRef}
              disabled={disabled}
              loading={loading}
              htmlType="submit"
            >
              <UploadOutlined />{t("buttons:upload")}
            </Button>
          </Col>
        </Row>
      </Form>

      <br />

      <Row>
        <Col xs={24} md={6}>
          <i><span key="1">{t("pages:upload.table.totalRecods")}: <b>{countTotalRecords || 0}</b></span></i>
        </Col>
        <Col xs={24} md={6}>
          <i><span key="2">{t("pages:upload.table.totalErrorRecods")}: <b>{errorUploads.countErrorRecord || 0}</b></span></i>
        </Col>
        <Col xs={24} md={6}>
          <i><span key="2">{t("pages:upload.table.totalWarringRecods")}: <b>{warringUploads.countWarringRecord || 0}</b></span></i>
        </Col>
      </Row>

      <br />

      {
        !!warringUploads.countWarringRecord ? (
          <>
            <br />
            <Table
              dataSource={warringUploads.data}
              columns={[
                {
                  title: t("pages:upload.table.header.index"),
                  width: 120,
                  render: (text, record, key) => {
                    return key + 1
                  }
                },
                {
                  key: 'row',
                  dataIndex: 'row',
                  title: t("pages:upload.table.header.row"),
                  width: 120,
                  render: (text, record, key) => {
                    return Number(startRow) + Number(text)
                  }
                },
                {
                  key: 'subjectCheckName',
                  title: t("pages:upload.table.header.subjectCheck"),
                  dataIndex: 'subjectCheckName',
                },
              ]}
            />
          </>
        ) :
          (
            <Table
              dataSource={errorUploads.data}
              columns={[
                {
                  key: 'id',
                  dataIndex: 'id',
                  title: t("pages:upload.table.header.index"),
                  width: 120
                },
                {
                  key: 'index',
                  dataIndex: 'index',
                  title: t("pages:upload.table.header.row"),
                  width: 120,
                  render: (text, record, key) => {
                    return Number(startRow) + Number(text)
                  }
                },
                {
                  key: 'content',
                  title: t("pages:upload.table.header.errorContent"),
                  dataIndex: 'content',
                },
              ]}
            />
          )
      }
    </div>
  )
}

export default BaseUploadExcel