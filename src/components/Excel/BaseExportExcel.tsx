import { Button } from "antd";
import { CloudDownloadOutlined } from '@ant-design/icons';
import React, { useState, forwardRef } from "react";
import ExcelJS from 'exceljs';
import FileSaver from 'file-saver';
import useBaseHook from '@src/hooks/BaseHook'
import _ from 'lodash'

type Props = {
  autoIndex?: Boolean,
  sampleFile: string,
  outputFile: string,
  columns: {},
  customButtonStyle?: any,
  fetcher?: Function,
  formatter?: Function,
  customCells?: {
    row: number,
    column: number,
    value: any,
    relativePosition?: 'header' | 'footer' | 'body',
    isColumnTableData?: boolean
    formatter?: Function,
    style?: any
    columnMerged?: number[][],
  }[],
}
export type ExportExcelHandle = {
  setData: Function,
}

// Phải đặt workbook và worksheet ở ngoài component hoặc viết ra 1 component khác.
const workbook = new ExcelJS.Workbook();
let worksheet: any;

const BaseExportExcel = forwardRef<ExportExcelHandle, Props>(({
  sampleFile, outputFile, columns, fetcher, formatter, customCells, autoIndex,
  customButtonStyle = { float: 'right', background: '#06bf2b', marginRight: '10px', borderColor: '#06bf2b' }
}, ref) => {

  const { notify, t } = useBaseHook();
  let [step, setStep] = useState(0);
  let [loading, setLoading] = useState(false);
  let [hidden, setHidden] = useState(true);
  let [data, setData] = useState([]); // Body of export file. 2 ways : ref.setData or fetcher.

  React.useImperativeHandle(ref, () => ({
    setData: setData
  }));

  let totalColumnAdd = []

  const onMakeData = async () => {
    let startRow = 1;

    setLoading(true);
    if (worksheet) workbook.removeWorksheet(worksheet.id);
    worksheet = workbook.addWorksheet("Sheet 0");

    //################################################
    //### Reading header and footer from template ####
    //################################################
    let sample = require(`@src/components/Excel/template/${sampleFile}`);
    if (!sample) {
      console.log("Path to sample excel not found!");
      notify("Thiếu template mẫu cho chức năng xuất excel", '', 'error');
    }

    // custom template 
    if (customCells) {
      let totalColumnHeader = getLengthColumnsByHeader(sample)
      totalColumnAdd = [...new Set(customCells.filter((cell) => cell.isColumnTableData).map((cell) => cell.column))]
      totalColumnAdd = totalColumnAdd?.filter((column) => column > totalColumnHeader) || [];
      //footer
      sample.formattedFooter.cells[sample?.formattedFooter?.cells?.length - 1].column = sample?.formattedFooter?.cells[sample?.formattedFooter?.cells?.length - 1].column + totalColumnAdd.length
      sample.formattedFooter.merged[1] = [14, 4, 14, 12 + totalColumnAdd.length]
      sample.formattedFooter.merged[2] = [14, 13 + totalColumnAdd.length, 14, 14 + totalColumnAdd.length]

      // header
      sample.formattedHeader.cells[1].column = sample.formattedHeader.cells[1].column + totalColumnAdd.length
      sample.formattedHeader.cells[3].column = sample.formattedHeader.cells[3].column + totalColumnAdd.length
      sample.formattedHeader.cells[4].column = sample.formattedHeader.cells[4].column + totalColumnAdd.length
      sample.formattedHeader.merged[1] = [1, 11 + totalColumnAdd.length, 1, 14 + totalColumnAdd.length]
      sample.formattedHeader.merged[3] = [2, 11 + totalColumnAdd.length, 2, 14 + totalColumnAdd.length]
      sample.formattedHeader.merged[4] = [3, 11 + totalColumnAdd.length, 3, 14 + totalColumnAdd.length]
      sample.formattedHeader.merged[5] = [4, 1, 4, 14 + totalColumnAdd.length]
      sample.formattedHeader.merged[6] = [5, 1, 5, 14 + totalColumnAdd.length]
      sample.formattedHeader.merged[7] = [6, 1, 6, 14 + totalColumnAdd.length]
    }

    let {
      formattedHeader, // Header mẫu đã cắt theo tool của Luân
      formattedFooter, // Footer mẫu đã cắt theo tool của Luân
      dataCellStyle, // chứa style data của các cell
      columnWidths, // any[] chứa style của các cột
      height, // Lưu thông tin độ dài của Header, Footer của file mẫu.
    } = sample;
    if (columnWidths) worksheet.columns = columnWidths;

    // Get body of file
    let dataFetcher: any[] = [];
    if (typeof fetcher == 'function') {
      dataFetcher = await fetcher();
    } else {
      dataFetcher = data;
    }
    if (typeof formatter == 'function') dataFetcher = dataFetcher.map((row, index) => formatter(row, index)); // Format data again
    setData(dataFetcher);

    //#####################################################
    //############## Set Data to workbook #################
    //#####################################################

    if (formattedHeader) worksheet = renderSample(worksheet, formattedHeader, startRow);

    // ưu tiên defaultValue
    if (customCells) {
      for (let record of customCells) {
        let row: any;
        let column: any;
        switch (record.relativePosition) {
          case 'body': {
            row = startRow + height.header + record.row;
            column = record.column;
            break;
          }
          case 'footer': {
            row = startRow + height.header + dataFetcher.length + record.row;
            column = record.column;
            break;
          }
          default: {
            row = startRow + record.row - 1;
            column = record.column;
          }
        }

        if (record.columnMerged) {
          record?.columnMerged?.map((merge) => {
            worksheet.mergeCells(
              row,
              column,
              merge[0],
              merge[1]
            );
            if (record.style) {
              worksheet.getRow(merge[0]).getCell(merge[1]).style = record.style;
            }
          });
        }

        if (record.value) worksheet.getRow(row).getCell(column).value = (typeof record.formatter == 'function') ? record.formatter(record.value) : record.value;
        if (record.style) worksheet.getRow(row).getCell(column).style = record.style;
      }
    }

    dataFetcher.map((row, idx) => {
      let rowValue = [];

      for (let key in columns) {
        rowValue[key] = row[columns[key]] || "";
        if (columns[key] == 'index' && autoIndex) rowValue[key] = idx + 1;
      }

      let insertedRow = worksheet.insertRow(height.header + startRow + 1 + idx, rowValue);
      // Cập nhật style cho row
      // let totalColumn = insertedRow._cells.length;
      let totalColumn = getLengthColumnsByHeader(sample);

      if (row.style) {
        for (let i = 1; i <= totalColumn + totalColumnAdd?.length || 0; i++) {
          for (let key in row.style) {
            insertedRow.getCell(i)[key] = row.style[key];
          }
        }
      }
    });

    if (formattedFooter) worksheet = renderSample(
      worksheet,
      formattedFooter,
      dataFetcher.length + startRow,
    );

    setLoading(false);
    setStep(step + 1);
  }

  const getLengthColumnsByHeader = (dataSample: any) => {
    let {
      formattedHeader, // Header mẫu đã cắt theo tool của Luân
      formattedFooter, // Footer mẫu đã cắt theo tool của Luân
      dataCellStyle, // chứa style data của các cell
      columnWidths, // any[] chứa style của các cột
      height, // Lưu thông tin độ dài của Header, Footer của file mẫu.
    } = dataSample;

    let rowLastHeader = height.header;
    let cells = formattedHeader.cells;
    let maxLen = 0;

    for (let cell of cells) {
      if (cell.row == rowLastHeader && cell.value) if (maxLen < cell.column) maxLen = cell.column;
    }

    return maxLen;
  }

  const renderSample = (worksheet: any, formattedData: any, startRow = 0) => {
    const {
      merged,
      cells
    } = formattedData;

    merged.map((merge: any) => {
      worksheet.mergeCells(
        startRow + merge[0],
        merge[1],
        startRow + merge[2],
        merge[3]
      );
    });

    cells.map((cell: any) => {
      worksheet.getRow(startRow + cell.row).getCell(cell.column).style = cell.style;
      worksheet.getRow(startRow + cell.row).getCell(cell.column).value = cell.value;
    });

    return worksheet;
  }

  const onDownload = () => {
    workbook.xlsx.writeBuffer()
      .then(buffer => FileSaver.saveAs(new Blob([buffer]), outputFile))
      .catch(e => console.log('Error writing excel export', e));
    setHidden(!hidden);
  }

  return <>
    {/* <Modal
      title={"Xuất file excel"}
      visible={!hidden}
      onOk={() => setHidden(!hidden)}
      onCancel={() => setHidden(!hidden)}
    >
      <Steps current={step}>
        <Step title={<Button disabled={step!=0} onClick={onMakeData} loading={loading}>Tạo File</Button>} />
        <Step title={<Button disabled={step!=1} onClick={onDownload}>Tải về</Button>} />
      </Steps>
    </Modal>
    <Button onClick={() => { setHidden(!hidden); setStep(0) }}>
      <CloudDownloadOutlined /> Xuất file excel
    </Button> */}

    <Button type="primary" style={customButtonStyle} onClick={async () => { await onMakeData(); onDownload() }}>
      <CloudDownloadOutlined /> {t("buttons:exportExcel")}
    </Button>
  </>
});

export default BaseExportExcel;
