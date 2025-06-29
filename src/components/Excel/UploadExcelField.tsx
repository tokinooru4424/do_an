import React, { useState } from 'react';
import useBaseHook from "@src/hooks/BaseHook";

import { Typography, Form } from 'antd';

const imageReadyUploadFile = '/images/upload_grey.png';
const imageAfterChooseFile = '/images/upload_pink.png';

const UploadExcelField = ({ form, disabled, inputProps }: { form: any, disabled: boolean, inputProps?: any }) => {
  const { t } = useBaseHook();

  const [ready, setReady] = useState(false);
  const [error, setErr] = useState(null);
  const [image, setImage] = useState(imageReadyUploadFile);
  const [description, setDescrtipion] = useState(t("pages:excel.form.descriptionReadyUploadFile"));

  const fileTypeXLSX = (message: string, value: any) => {
    let validType = /\.(xlsx)$/.test(value);
    let messageError = validType ? null : message;
    return messageError;
  }

  const changeFile = async (e: any) => {
    const files = e.target.files[0]

    form.setFieldValue('file', files)

    let name = files.name
    let checkFileType = fileTypeXLSX(t('messages:form.extensionFileExcelNotValid', { extensionFile: '.xlsx' }), name)
    if (checkFileType) {
      setErr(checkFileType)
    } else {
      setErr(null)
    }

    setImage(imageAfterChooseFile)
    setDescrtipion(name)
    setReady(true)
  }

  const onClickFile = (e: any) => {
    e.target.value = null;
  }

  return (
    <Form.Item
      name={'file'}
      rules={[
        {
          validator: (rule: any, value: any) => {
            if (!value || !value.name) {
              setErr(t("messages:form.required", { name: t("pages:excel.form.excelFile") }))
              return Promise.reject();
            }
            let invalidType = fileTypeXLSX(t('messages:form.extensionFileExcelNotValid', { extensionFile: '.xlsx' }), value.name)
            if (invalidType) {
              return Promise.reject()
            }
            return Promise.resolve();
          }
        }
      ]}
    >
      <input
        disabled={disabled}
        accept=".xlsx"
        style={{ display: 'none' }}
        id={'file'}
        multiple={false}
        onChange={e => changeFile(e)}
        onClick={e => onClickFile(e)}
        name="id"
        type="file"
        {...inputProps}
      />
      <label htmlFor={'file'}>
        <div className={`${error ? 'uploadExcelError' : ready ? 'uploadExcelSuccess' : ''} uploadExcelCard`}>
          <div className='uploadExcelCardWrap'>
            <div className='uploadExcelCardEmpty'>
              <img className='uploadExcelHolderImg' alt="Ready to upload" src={image} />
              <Typography
                className={`${error ? 'uploadExcelError' : ready ? 'uploadExcelSuccess' : ''}`}
                style={{ textTransform: 'uppercase', fontSize: '18px' }}
              >
                {description}
              </Typography>
            </div>
          </div>
        </div>
      </label>
      <p
        className={`${error ? 'uploadExcelError' : ''}`}
        style={{
          textAlign: 'center',
          margin: '10px 0'
        }}
      >
        {error ? error : ''}
      </p>
    </Form.Item>
  )
}

export default UploadExcelField