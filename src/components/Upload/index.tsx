import React, { useState, useEffect, useRef } from "react";
import { Upload, Modal } from "antd";
import { UploadFile } from "antd/lib/upload/interface";
import useBaseHook from '@src/hooks/BaseHook';
import _ from 'lodash';

const { Dragger } = Upload;

const IMAGE_EXTEND_TYPE_STRING = {
  image: ["png", "gif", "jpg", "jpeg", "jfif", "pjpeg", "pjp"].join(", "),
  audio: ["mp3", "wma", "wav", "amr", "midi"]
}
const IMAGE_EXTEND_TYPE = {
  image: ["image/png", "image/jpeg", "image/gif"],
  audio: ["audio/mpeg"]
}
const IMAGE_MAX_SIZE_UNIT_MB = 30;
const IMAGE_MAX_SIZE = 30931520; // 20M

function getBase64(file: any) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
}

const UploadMultilField = ({
  onChange,
  listFile = [],
  children,
  beforeUpload,
  listType,
  multiple,
  isChangeType = true,
  isDragger = false,
  limit,
  isImg,
  accept,
  type,
  ...otherProps
}: {
  onChange?: Function;
  listFile?: UploadFile[];
  children: JSX.Element;
  isImg: boolean;
  beforeUpload?: Function;
  listType?: "text" | "picture" | "picture-card";
  multiple?: boolean;
  isDragger?: boolean;
  isChangeType?: boolean;
  limit?: number;
  accept?: string;
  type?: string;
  [x: string]: any;
}) => {
  const { t, notify } = useBaseHook();
  const [fileList, setFileList] = useState<UploadFile[]>([...listFile]);
  const [previewImg, setPreview] = useState("");
  const [previewVisible, setPreviewVisible] = useState(false);
  const isInitialMount = useRef(true);

  let _limit = multiple ? limit : 1;

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
    } else {
      if (onChange) onChange(fileList);
    }
  }, [fileList.length]);

  useEffect(() => {
    setFileList(listFile);
  }, [listFile.length]);

  useEffect(() => {
    if (isChangeType) {
      setFileList([])
    }
  }, [type])

  const addFile = async (file: UploadFile) => {
    if (isImg) file.url = (await getBase64(file)) as string;
    if (!multiple) {
      setFileList((prevFileList) => []);
      setFileList((prevFileList) => [file]);
    } else {
      setFileList((prevFileList) => [...prevFileList, file]);
    }
  };

  const _beforeUpload = (file: UploadFile) => {
    if (!IMAGE_EXTEND_TYPE[type].includes(file.type)) {
      return notify(t(`messages:form.extensionFile${_.upperFirst(type)}NotValid`, { extensionFile: IMAGE_EXTEND_TYPE_STRING[type] }), '', 'error')
    }

    if (file.size > IMAGE_MAX_SIZE) {
      return notify(t('messages:form.fileUploadNotValid', { max: IMAGE_MAX_SIZE_UNIT_MB }), '', 'error')
    }

    if (beforeUpload) file = beforeUpload(file);
    addFile(file);
    return false;
  };

  const onRemove = (file: UploadFile) => {
    const newList = [...fileList.filter((f) => f !== file)];
    setFileList(newList);
    if (onChange) onChange(newList);
  };

  const handleCancel = () => {
    setPreviewVisible(false);
  };

  const handlePreview = async (file: UploadFile) => {
    if (!isImg) return;
    file.url ? file.url : (file.url = (await getBase64(file)) as string);
    setPreview(file.url);
    setPreviewVisible(true);
  };

  const Component = isDragger ? Dragger : Upload

  return (
    <div>
      <Component
        listType={listType}
        {...otherProps}
        multiple
        accept={accept}
        beforeUpload={_beforeUpload}
        onRemove={onRemove}
        fileList={fileList}
        onPreview={handlePreview}
      >
        {!_limit || fileList.length < _limit ? children : ""}
      </Component>
      <Modal open={previewVisible} footer={null} onCancel={handleCancel}>
        <img alt="example" style={{ width: "100%" }} src={previewImg} />
      </Modal>
    </div>
  );
};

export default UploadMultilField;