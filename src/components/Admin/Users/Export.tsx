import React from 'react';
import useBaseHook from "@src/hooks/BaseHook";
// Util
import _ from "lodash";
import moment from 'moment';
// Component
import BaseExportExcel from '@root/src/components/Excel/BaseExportExcel';

const Export = ({ fetcher }: { fetcher: Function }) => {
  const { t } = useBaseHook();

  const formatter = (row: any) => {
    return {
      ...row,
      createdAt: moment(row.createdAt).format("DD/MM/YYYY HH:mm:ss"),
      style: {
        "border": {
          "left": {
            "style": "thin",
            "color": {
              "indexed": 64
            }
          },
          "right": {
            "style": "thin",
            "color": {
              "indexed": 64
            }
          },
          "top": {
            "style": "thin",
            "color": {
              "indexed": 64
            }
          },
          "bottom": {
            "style": "thin",
            "color": {
              "indexed": 64
            }
          }
        },
      }
    }
  }

  return <BaseExportExcel
    autoIndex={true}
    fetcher={fetcher} // API dùng để lấy dữ liệu và set vào body của file excel
    customCells={ // Custom lại giá trị, style của ô dựa theo vị trí tương đối của ô đó với header, body, footer
      null
    }
    columns={{ // Thứ tự các ô khi ren giá trị vào body của bảng.
      '0': 'index',
      '1': 'username',
      '2': 'lastName',
      '3': 'firstName',
      '4': 'email',
      '5': 'roleName',
      '6': 'createdAt',
    }}
    sampleFile={'users.json'} // File mẫu gồm : template của header, footer, các style mặc định của file: style các cột, ...
    outputFile={`${t("pages:users.index.title")}.xlsx`}
    formatter={formatter} // Function hỗ trợ format lại dòng dữ liệu : Ex date => string
  />
}

export default Export;
