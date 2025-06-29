import errorMessages from "./message";
import moment from "moment";
import _ from "lodash";

/**
 * generate Message for errorMessages
 * @param {string} code : key of errorMessages = "TEMPLATE" | "DUPLICATE" | "USERNAME_EXIST"
 * @param {string | Array} values 
 */
const generateMessage = (code: string, values = {}, lang = 'errorMessages_vi') => {
  let template = errorMessages[lang][code] || code;
  if (template[template.length - 1] == "!") return template.replace(/\!$/, "");

  for (let key in values) {
    template = template.replace(`{{${key}}}`, values[key]);
    if (errorMessages[lang][values[key]]) template = template.replace(values[key], errorMessages[lang][values[key]]);
  }

  return template;
}

/**
 * Convert errors to data for GridTable front-end
 * @param {*} errors = { "0": [], "1": [], ...}
 * @returns {*} = {data = [], total = number, pageSize = number}
 */
const mapErrorsToGridTable = (errors: object) => {
  let data = [];
  let total = 0;
  let pageSize = 50;

  let count = 0;
  let countErrorRow = 0;
  for (let index_row in errors) {

    countErrorRow++;
    let errs = errors[index_row] || [];
    for (let err of errs) {

      data.push({
        id: count + 1,
        index: parseInt(index_row),
        content: generateMessage(err)
      });
      count++;
    }
  }

  return {
    data: data,
    total: data.length,
    countErrorRecord: countErrorRow,
    pageSize: pageSize,
  }
}

/**
 * Map two or more errors after validate
 * @param  {...any} errors : arg = { "field_1": ["string"], "field_2": ["string"]}
 * @returns 
 */
const mapError = (...errors) => {
  let result = {};
  for (let error of errors) {

    if (typeof error != 'object' || _.isEmpty(errors)) continue;
    let keySources = Object.keys(result);
    let keyDestinationErrors = Object.keys(error);
    let finalKeys = [...new Set([...keySources, ...keyDestinationErrors])]; // remove duplicate key

    let sub_errors = {};
    for (let key of finalKeys) {
      let val_first = result[key] || [];
      let val_second = error[key] || [];
      sub_errors[key] = [].concat(val_first, val_second);
    }
    result = sub_errors;
  }

  // Filter row hasn't error.
  for (let key in result) {

    if (Array.isArray(result[key])) {
      if (!result[key].length) delete result[key];
    } else {
      if (!result[key]) delete result[key];
    }
  }

  return result;
}

/**
 * Compare 2 element with type of [ string, number, boolean, date, object] 
 * @param {*} o1 
 * @param {*} o2 
 * @returns 
 */
const isEquals = (o1: any, o2: any) => {
  /**
   *  Case o1 and o2 have diffirent type
   */
  if (typeof o1 != typeof o2) return false;
  /**
   * Case the same type
   */
  // normal type
  if (['string', 'number', 'boolean'].includes(typeof o1)) {
    return o1 == o2;
  }
  // date type
  if (o1 instanceof Date && o2 instanceof Date) {
    return o1.getTime() == o2.getTime();
  }
  // normal object
  for (let p in o1) {
    if (o1.hasOwnProperty(p)) {
      if (o1[p] !== o2[p]) {
        return false;
      }
    }
  }
  for (let p in o2) {
    if (o2.hasOwnProperty(p)) {
      if (o1[p] !== o2[p]) {
        return false;
      }
    }
  }
  return true;
}

/**
 * Reuse validate() of BaseController 
 * validate a row of inputs data
 * @param {*} data 
 * @param {*} allowFields 
 * @param {*} removeNotAllow 
 * @param {*} path 
 * @param {*} newData 
 * @returns {*} : return {data: ...} or {error: true, code: "string",content: "string"} 
 */
const validateByAllowFieldsOfRow = (data: any, allowFields: any, removeNotAllow = false, path = "", newData = null) => {
  let result: any = {
    error: false,
    message: "OK",
  };

  let root = false;
  if (newData == null) {
    root = true;
    newData = removeNotAllow ? {} : data
  }

  if (typeof allowFields == "string") {
    // debug("type is string...");
    let typeOfField = allowFields;
    let isRequired = typeOfField.indexOf("!") !== -1; //kiểm tra dấu ! ở cuối là bắt buộc
    typeOfField = typeOfField.replace(/\!/, ""); //tách lấy kiểu dữ liệu mong muốn
    let isExists = (data != null);
    let isEmpty = (data === "");

    if (path[path.length - 1] == ".") path = path.substring(0, path.length - 1);

    if (isRequired && (!isExists || isEmpty)) { //nếu field là bắt buộc như lại không tồn tại trong data.
      // let error = this.validateError("required", {
      //   path
      // });
      // debug(error.message);
      let error = generateMessage("REQUIRE", { path });
      return {
        error: true,
        code: "REQUIRE",
        content: error
      }
    } else if (isExists) {
      let realType = typeof data;
      let typeAllowed = realType == typeOfField;

      //nếu không đúng kiểu dữ liệu mong muốn, thì cố gắng convert về đúng kiểu.
      if (!typeAllowed) {
        if (typeOfField == "any") {
          typeAllowed = true;
        } else if (typeOfField == "number") {
          typeAllowed = !isNaN(data);
          if (typeAllowed) _.set(newData, path, Number(data))
        } else if (typeOfField == "boolean") {
          if (typeof data == "string") data = data.toLowerCase();
          typeAllowed = ["true", "false", "1", "0", 1, 0, true, false].includes(data);
          if (typeAllowed) _.set(newData, path, ["true", "1", 1, true].includes(data))
        } else if (typeOfField == "date" || typeOfField == "moment") {
          if (!moment.isDate(data)) _.set(newData, path, new Date(data))
        }
        else if (typeOfField == "string") {
          _.set(newData, path, String(data).trim())
        }
      } else {
        if (typeOfField == "string") data = String(data).trim()
        _.set(newData, path, data)
      }
      // debug({ typeOfField, realType, typeAllowed });

      if (!typeAllowed) {
        // return this.validateError("Invalid Type", {
        //   path,
        //   typeOfField,
        //   realType
        // });
        let error = generateMessage('INVALID_TYPE', {
          path,
          expectType: typeOfField,
          realType
        });
        return {
          error: true,
          code: "INVALID_TYPE",
          content: error,
        };
      }
    }
    else {
      _.unset(newData, path)
    }
  } else {
    if (typeof data != 'object') {
      let error = generateMessage('INVALID_TYPE', {
        path,
        expectType: 'object',
        realType: typeof data,
      });
      return {
        error: true,
        code: "INVALID_TYPE",
        content: error,
      }
    }
    //---------------------------------------------
    //duyệt các key của object.
    for (let fieldName in allowFields) {
      let typeOfField = allowFields[fieldName];
      let fieldValue = data ? data[fieldName] : undefined;

      //kiểm tra nếu là array thì đệ quy tiếp vào các element để check
      if (Array.isArray(typeOfField)) {
        if (Array.isArray(fieldValue)) {
          // debug("case 1: check array:");
          if (fieldValue.length === 0) {
            if (typeof typeOfField[0] === "object") {
              fieldValue.push({})
            }
            else if (typeOfField[0].indexOf("!") !== -1) {
              // debug("element is required but array empty")
              // return this.validateError('required', {
              //   path: `${path}${fieldName}`
              // })
              let error = generateMessage("REQUIRE", { path });
              return {
                error: true,
                code: "REQUIRE",
                content: error
              }
            }
          }

          for (let i in fieldValue) {
            result = validateByAllowFieldsOfRow(fieldValue[i], typeOfField[0], removeNotAllow, `${path}${fieldName}.${i}.`, newData);
            if (result.error) return result
          }
        } else {
          // debug("case 2: check array but data is not array");
          if (fieldValue == undefined) {
            //return this.validateError("required",{path: `${path}${fieldName}`})
            result = validateByAllowFieldsOfRow(fieldValue, typeOfField[0], removeNotAllow, `${path}${fieldName}[0].`)
          } else {
            // return this.validateError("Invalid Type", {
            //   path: `${path}${fieldName}`,
            //   typeOfField: "array",
            //   realType: typeof fieldValue
            // })
            let error = generateMessage('INVALID_TYPE', {
              path: `${path}${fieldName}`,
              expectType: "array",
              realType: typeof fieldValue,
            });
            return {
              error: true,
              code: "INVALID_TYPE",
              content: error,
            }
          }
          //result = validateByAllowFieldsOfRow(fieldValue, typeOfField[0], `${path}${fieldName}[0].`)
        }
      } else if (typeof typeOfField == "object") {
        //nếu là là object thì đệ quy vào trong để check tiếp
        // debug("case 3: check object:");
        result = validateByAllowFieldsOfRow(fieldValue, typeOfField, removeNotAllow, `${path}${fieldName}.`, newData)
      } else {
        //nếu là string thì đệ quy để nhảy vào check các phần tử lá
        // debug("case 4: check type is string:");
        result = validateByAllowFieldsOfRow(fieldValue, typeOfField, removeNotAllow, `${path}${fieldName}`, newData)
      }
      if (result.error) {
        return result
      } else {
        result = {
          ...result,
          data: {
            ...result.data,
          }
          // data: result
        }
      }
    }
  }

  if (root) {
    return {
      ...result,
      data: newData
    }
  }

  return result;
}

const buildExtenConditions = (query: any, extend_conditions: any) => {
  if (!query) return query;

  if (JSON.stringify(extend_conditions) != "{}" && extend_conditions && typeof extend_conditions == "object") {
    let relations = _.get(extend_conditions, "relations", null);
    if (relations) {
      for (let table in relations) query.join(table, relations[table][0], "=", relations[table][1]);
    }

    let conditions = _.get(extend_conditions, "conditions", null);
    if (conditions) {
      for (let condition of conditions) {
        let columnName = _.get(condition, "columnName", null);
        let operator = _.get(condition, "operator", "=");
        let value = _.get(condition, "value", null);

        if (!columnName) continue;

        switch (operator) {
          case "isNULL":
            query.whereNull(columnName);
            break;
          case "in":
            query.whereIn(columnName, value);
            break;
          case "contains":
            query.where(columnName, 'like', `%${value}%`)
            break;
          case "equal":
            query.where(columnName, value)
            break;
          case "notContains":
            query.whereNot(columnName, 'like', `%${value}%`)
            break;
          case "startsWith":
            query.where(columnName, 'like', `${value}%`)
            break;
          case "endsWith":
            query.where(columnName, 'like', `%${value}`)
            break;
          case "equal":
            query.where(columnName, value)
            break;
          case "notEqual":
            query.whereNot(columnName, value)
            break;
          //number
          case "greaterThan":
            query.where(columnName, '>', value)
            break;
          case "greaterThanOrEqual":
            query.where(columnName, '>=', value)
            break;
          case "lessThan":
            query.where(columnName, '<', value)
            break;
          case "lessThanOrEqual":
            query.where(columnName, '<=', value)
            break;
          //date
          case "daterange":
            query.where(columnName, '>=', moment(value.startDate).format("YYYY-MM-DD 00:00:00"))
              .andWhere(columnName, '<=', moment(value.endDate).format("YYYY-MM-DD 23:59:59"))
            break;
          default:
            query.where(columnName, value);
            break;
        }
      }
    }
  }
  return query;
}

export default {
  mapErrorsToGridTable, mapError, generateMessage, isEquals,
  buildExtenConditions, validateByAllowFieldsOfRow
}