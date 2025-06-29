import { useState } from "react";
import _ from "lodash";
import useBaseHooks from "./BaseHook";
import to from 'await-to-js';

const FormHook = () => {
  const [reload, setReload] = useState(false);
  const { notify, t } = useBaseHooks();

  const setData = (newData) => {
    FormHook.formData = JSON.parse(JSON.stringify([...newData].map((item, index) => ({ ...item, key: item.key || String(index) }))));
  };

  const getData = () => {
    return FormHook.formData;
  };

  const setForm = (form) => {
    FormHook.form = form;
  }
  const setRequiredFields = (requiredFields) => {
    FormHook.requiredFields = requiredFields;
  }

  const checkRequiredFields = () => {
    let requiredFields = FormHook.requiredFields || [];
    FormHook.formData.map(item => {
      requiredFields.map(field => {
        if (!item[field]) {
          notify(t('messages:message.ticketTable.' + field), "", "error")
          throw new Error("Lỗi thiếu trường trong bảng")
        }
      })
    })
  }

  const validate = async () => {
    checkRequiredFields();
    if (FormHook.isEditing) {
      notify("Vui lòng lưu bảng dữ liệu trước khi gửi", "", "error");
      throw new Error("Vui lòng lưu bảng dữ liệu trước khi gửi")
    }

    let [error, data] = await to(FormHook.form.validateFields());
    if (error) throw new Error("Vui lòng điền đẩy đủ thông tin");

    if (FormHook.formData.length === 0) {
      notify("Vui lòng nhập ít nhất một bản ghi vào bảng!", "", "error");
      throw new Error("Vui lòng nhập ít nhất một bản ghi vào bảng!")
    }

    checkRequiredFields();
  }

  const setIsEditing = (isEditing) => {
    FormHook.isEditing = isEditing;
  }

  const getRow = (index: number) => {
    return _.get(FormHook.formData, index, {});
  };

  const setRow = (index, data) => {
    _.set(FormHook.formData, index, { ...data });
  };

  const refresh = () => {
    setReload(!reload);
  };
  const clear = () => {
    setData([]);
    refresh();
    setRequiredFields([]);
  };

  const transform = ({
    field,
    formater,
  }: {
    field: string;
    formater: Function;
  }) => {
    FormHook.formData.map((item) => {
      _.set(item, field, formater(item));
    });
  };
  return {
    dataForm: {
      setData,
      getData,
      getRow,
      setRow,
      refresh,
      clear,
      transform,
      setForm,
      validate,
      setIsEditing,
      setRequiredFields
    },
  };
};

FormHook.formData = [];
FormHook.form = null;
FormHook.isEditing = false;
FormHook.requiredFields = [];

export default FormHook;
