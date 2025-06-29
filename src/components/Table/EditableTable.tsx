import React, { useState, useEffect } from "react";
import {
  Table,
  Input,
  Popconfirm,
  Form,
  Typography,
  Button,
  Tooltip,
} from "antd";
import { PlusCircleOutlined, DeleteOutlined, SaveOutlined, CloseSquareOutlined, EditOutlined } from "@ant-design/icons";
import FormHook from "@root/src/hooks/FormHook";
import useBaseHooks from '@src/hooks/BaseHook';
import _ from "lodash";

interface EditableCellProps extends React.HTMLAttributes<HTMLElement> {
  editing: boolean;
  dataIndex: string;
  title: any;
  inputType: "number" | "text";
  record: any;
  index: number;
  children: React.ReactNode;
  customerComponent?: React.FC;
}

interface EditableProductTableProps {
  defaultValue?: any;
  columns: any[];
  form: any;
  rowKey?: any;
  onFinish: any;
  pagination?: any
  disiable?: any[]
  expandable?: any;
}

const EditableTable: React.FC<EditableProductTableProps> = ({
  columns = [],
  form,
  onFinish,
  pagination,
  rowKey = "id",
  disiable = ['delete', 'add', 'edit', 'save'],
  expandable,
}) => {
  const getColumnByKey = (key) => {
    return columns.find((item) => item.dataIndex === key);
  };
  const { t, notify } = useBaseHooks()

  const customInput: React.FC<EditableCellProps> = ({
    editing,
    dataIndex,
    title,
    inputType,
    record,
    index,
    children,
    ...restProps
  }) => {
    let column = getColumnByKey(dataIndex);
    let customComponent = _.get(column, "customComponent");
    let editable = _.get(column, "editable");
    let rules = _.get(column, "rules", []);
    let fieldValue = _.get(record, dataIndex);
    if (!editable) {
      return <td {...restProps}>
        {children}
      </td>
    }

    let custom = customComponent ? customComponent({ editing, value: fieldValue, record }) : <Input />

    if (editing) {
      custom = (
        <Form.Item name={dataIndex} style={{ margin: 0 }} rules={rules}>
          {custom}
        </Form.Item>
      )
    }

    return (
      <td {...restProps}>
        {editing
          ? custom
          :
          customComponent ? custom : fieldValue}
      </td>
    );
  };

  //const [data, setData] = useState(defaultValue);
  const { dataForm } = FormHook();
  dataForm.setForm(form);
  const [editingKey, setEditingKey] = useState("");
  const [edittingNewKey, setEditingNewKey] = useState(false);

  const isEditing = (record: any) => {
    return record.key === editingKey;
  };

  const deleteRecord = async (key) => {
    let newData = dataForm.getData().filter((item) => item.key !== key);
    newData = newData.map((item, index) => ({ ...item, key: String(index) }));
    let data = await onFinish(newData)
    if (data) {
      notify(t('messages:message.recordQuestionDeteteMedia'));
      dataForm.setData(newData);
    }
    setEditingKey("");
    form.resetFields();
    dataForm.refresh();
    dataForm.setIsEditing(false);
    setEditingNewKey(false);
  };

  // add operation column
  const operationColumn = {
    title: "Hành động",
    dataIndex: "operation",
    fixed: 'right',
    render: (_: any, record: any) => {
      const editable = isEditing(record);
      const saveBtn = (
        <Tooltip placement="top" title={"Lưu"}>
          <Button type="primary" style={{ marginRight: 8 }} size="small" icon={<SaveOutlined />} onClick={() => save(record.key)} />
        </Tooltip>
      );
      const deleteBtn = (
        <Popconfirm
          title="Bạn có muốn xoá không?"
          onConfirm={() => deleteRecord(record.key)}
        >
          <Tooltip placement="top" title={"Xoá"}>
            <Button danger size="small" style={{ marginRight: 8 }} icon={<DeleteOutlined />} />
          </Tooltip>
        </Popconfirm>
      );
      const cancelBtn = (
        <Popconfirm title="Bạn có muốn huỷ không?" onConfirm={cancel}>
          <Tooltip placement="top" title={"Huỷ"}>
            <Button danger size="small" icon={<CloseSquareOutlined />} />
          </Tooltip>
        </Popconfirm>
      );
      const editBtn = (
        <Typography.Link
          disabled={editingKey !== ""}
          onClick={() => edit(record)}
          style={{ marginRight: 8 }}
        >
          <EditOutlined />
        </Typography.Link>
      );
      return editable ? (
        <span>
          {disiable.includes('save') ? saveBtn : ""}
          {disiable.includes('delete') ? deleteBtn : ""}
          {cancelBtn}
        </span>
      ) : (
        <span>
          {disiable.includes('edit') ? editBtn : ""}
          {/* {editingKey !== "" && disiable.includes('edit') && disiable.includes('delete')? "" : deleteBtn} */}
        </span>
      );
    },
  };

  columns = columns.filter((item) => item.dataIndex !== "operation");

  if (disiable && disiable.length > 0) {
    columns.push(operationColumn)
  }

  const edit = (record) => {
    setEditingKey(record.key);
    setEditingNewKey(false);
    form.setFieldsValue(record);
    dataForm.setIsEditing(true);
  };

  const cancel = async () => {
    if (!edittingNewKey) {
      form.resetFields();
      setEditingKey("");
      setEditingNewKey(false);
      dataForm.setIsEditing(false);
    } else {
      deleteRecord(editingKey);
    }
  };

  const save = async (key: React.Key) => {
    // const { t,notify } = useBaseHooks()
    try {
      const row = (await form.validateFields()) as any;
      const newData = dataForm.getData();
      const index = newData.findIndex((item) => key === item.key);

      if (index > -1) {
        const item = newData[index];
        newData.splice(index, 1, {
          ...item,
          ...row,
        });
      } else {
        newData.push(row);
      }

      let data = await onFinish(newData)
      if (data) {
        notify(t('messages:message.recordQuestionAddMedia'));
        dataForm.setData(newData);
      }

      setEditingKey("");
      setEditingNewKey(false);

      form.resetFields();
      dataForm.setIsEditing(false);

    } catch (errInfo) {
      console.log("Validate Failed:", errInfo);
    }
  };

  const add = () => {
    let data = dataForm.getData();
    const key = String(data.length);

    form.resetFields();
    data.unshift({ key });

    dataForm.setData([...data]);
    dataForm.setIsEditing(true);
    dataForm.refresh();

    setEditingKey(key);
    setEditingNewKey(true);
  };

  const mergedColumns = columns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record: any) => ({
        record,
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });

  useEffect(() => {
    //clear hết dữ liệu bảng trước khi hiển thị dữ liệu mới
    dataForm.clear();
  }, []);

  return (
    <div>
      {
        disiable.includes('add') &&
        <Button
          type="primary"
          disabled={dataForm.getData().length === 0 ? false : Boolean(editingKey)}
          onClick={add}
          style={{ marginTop: "8px" }}
        >
          <PlusCircleOutlined />
          {t("buttons:add")}
        </Button>
      }
      <Table
        components={{
          body: {
            cell: customInput,
          },
        }}
        rowKey={rowKey}
        bordered
        dataSource={[...dataForm.getData()]}
        columns={mergedColumns}
        pagination={pagination}
        scroll={{ x: 'max-content' }}
        expandable={expandable}
      />
    </div>
  );
};

export default EditableTable;
