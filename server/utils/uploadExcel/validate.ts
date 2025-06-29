import _ from "lodash";
import util from "./util"

const { mapError, generateMessage, isEquals, buildExtenConditions, validateByAllowFieldsOfRow } = util

/**
 * Main Function to Validate Upload, ignore empty Row and return inputs is removed empty row
 * @param {Array[object]} inputs 
 * @param {*} options 
 * @returns 
 */
const validateUpload = (
  inputs: any = [],
  options: any = {
    // Validate for allowFields of each row
    allowFieldsOfEachRows: null, // <Array<object>> Don't declare when u don't use
    // Validate type of value
    allowFieldsOfRow: null, // <object> Don't declare when u don't use this.
    removeNotAllow: false,
    // Check duplicate row
    duplicate: true,
    // Check unique of a field or ( combine 2 or more fields )
    unique: [],
    // Custom validate for some field
    validationFields: {
      // "field":  [function_1, function_2, ...] - function_1(value) { return { error: true | false, errorMessageKey: string } }
      // example of function_1 is function example_greater_than_1
    }
  }
) => {
  // Init errros = { "0": [], "1": [], "2": [], ... }
  let errors = {};
  for (let idx = 0; idx < inputs.length; idx++) errors[idx] = [];

  // Check Row Empty
  let errorRowEmpty = validateEmptyRow(inputs);
  errors = mapError(errors, errorRowEmpty);

  // Check by allowFields of Row 
  let allowFieldsOfEachRows = options.allowFieldsOfEachRows;
  let allowFieldsOfRow = options.allowFieldsOfRow;

  if (allowFieldsOfEachRows) {
    let removeNotAllow = options.removeNotAllow || false;
    let resultCheckValidateByAllowFieldOfEachRows: any = validateByAllowFieldOfEachRows(inputs, allowFieldsOfEachRows, removeNotAllow);
    errors = mapError(errors, resultCheckValidateByAllowFieldOfEachRows.errors);
    inputs = resultCheckValidateByAllowFieldOfEachRows.new_inputs;
  }
  else if (allowFieldsOfRow) {
    let removeNotAllow = options.removeNotAllow || false;
    let resultCheckValidateByAllowFields = validateByAllowFields(inputs, allowFieldsOfRow, removeNotAllow);
    errors = mapError(errors, resultCheckValidateByAllowFields.errors);
    inputs = resultCheckValidateByAllowFields.new_inputs;
  }

  // Check duplicate
  if (options.duplicate) {
    let errorDuplicates = validateDuplicate(inputs, "DUPLICATE");
    errors = mapError(errors, errorDuplicates);
  }

  // Check unique
  if (_.get(options, "unique", []).length) {
    let errorUniques = validateUnique(inputs, _.get(options, "unique", []), "UNIQUE");
    errors = mapError(errors, errorUniques);
  }

  // Check validationFields
  const validationFields = options.validationFields || {};
  for (let field in validationFields) {
    let validateFunctions = validationFields[field];
    let errorCheckField = validate(inputs, field, validateFunctions);
    errors = mapError(errors, errorCheckField);
  }

  // Filter row hasn't errors
  for (let key in errors) if (!errors[key].length) delete errors[key];
  inputs = inputs.filter(input => !_.isEmpty(input));

  return {
    errors: errors, // Check exist any key in errors : always return an object
    inputs: inputs
  };
}

const validateEmptyRow = (inputs = []) => {
  let errors = {};
  const message = generateMessage("ROW_EMPTY", {});
  for (let idx = 0; idx < inputs.length; idx++) {
    if (_.isEmpty(inputs[idx])) errors[idx] = [message];
  }
  return errors;
}

/**
 * NOTE : ONLY QUERY IN A TABLE
 * Check data exist in DB by a Column
 * Throw error if value of field exist in DB
 * @param {*} param0 
 * @returns 
 */
const validateNotAllowDataExistInDBByColumn = async ({
  inputs, // <Array>
  property, // <string> property of a row in inputs
  ignoreUndefined, // <string> ignore validate, don't validate property if value of this == undefined.
  Model, // <instance of a Model> get name model = this.tableName;
  column, // <string> column of Moel, No contain table's name
  extend_conditions = {
    // relations: { "table_name": ["col_1", "col_2"]},
    // conditions: [ {"columnName": <string>, "operator": <string>, "value": <any>} ]
  },
  error_code = "DATA_EXIST_IN_DB",
  comment = "", // other comment to explain for this error
}: any) => {
  // console.log("error", error_code);
  let errors = {};
  for (let idx in inputs) errors[idx] = [];

  let valueOfpropertyInputs = [];
  for (let element of inputs) if (element[property] != undefined && !valueOfpropertyInputs.includes(element[property]))
    valueOfpropertyInputs.push(element[property]);
  if (!valueOfpropertyInputs.length) return {}; // errors

  // Lấy 2 trường id và column 
  let query = Model.query().whereIn(`${Model.tableName}.${column}`, valueOfpropertyInputs)
    .select([`${Model.tableName}.id as id`, `${Model.tableName}.${column} as ${column}`]);
  query = buildExtenConditions(query, extend_conditions);

  let exists = await query;
  let valueExists = exists.map((e: any) => e[column]);

  for (let idx in inputs) {
    if (inputs[idx][property] == undefined && ignoreUndefined) continue; // IGNORE IF (ignoreUndefined)
    if (valueExists.includes(inputs[idx][property])) errors[idx] = generateMessage(error_code, {
      property: property,
      value: inputs[idx][property],
      comment: comment
    });
  }
  return errors;
}

/**
 * NOTE : ONLY QUERY IN A TABLE
 * Check data exist in DB by a Column
 * Throw error if value of field don't exist in DB
 * @param {*} param0 
 * @return {errors, inputs}
 */
const validateDataExistInDBByColumn = async ({
  inputs, // <Array>
  property, // <string> property of a row in inputs
  ignoreUndefined, // <string> ignore, don't validate property if value of this == undefined.
  Model, // <instance of a Model>
  column, // <string> column of Model, NO contain model's name
  extend_conditions = {
    // relations: { "table_name": ["col_1", "col_2"]},
    // conditions: [ {"columnName": <string>, "operator": <string>, "value": <any>} ]
  },
  error_code = "DATA_NOT_EXIST",
  comment = "", // other comment to explain for this error

  deleteProperties = [], // delete properties of inputs
  setColumnsToProperties = [
    // { columnName: "string", newProperty: "string", custom_value_function: "function" },
  ]
}) => {
  let errors = {};
  for (let idx in inputs) errors[idx] = [];

  let valueOfpropertyInputs = [];
  for (let element of inputs) if (element[property] != undefined && !valueOfpropertyInputs.includes(element[property])) {
    let elementProperty
    if (typeof element[property] === "string") {
      elementProperty = String(element[property]).trim();
    }
    else if (Array.isArray(element[property])) {
      element[property] = element[property].map(item => {
        if (typeof item == "string") {
          return item.trim()
        }
        return item
      })
      element[property] = element[property].filter(item => item)
    }
    else {
      elementProperty = element[property]
    }
    if (elementProperty) {
      valueOfpropertyInputs.push(element[property]);
    }
  }
  if (valueOfpropertyInputs.length) {
    // Lấy 2 trường id và column 
    let query = Model.query().whereIn(`${Model.tableName}.${column}`, valueOfpropertyInputs);
    query = buildExtenConditions(query, extend_conditions);
    // Get select
    let select = [`${Model.tableName}.${column} as ${column}`];
    for (let option of setColumnsToProperties) if (option.columnName) select.push(`${Model.tableName}.${option.columnName} as ${option.columnName}`);
    query.select(select);

    let exists = await query;
    let valueExists = exists.map((e: any) => e[column]);

    for (let idx in inputs) {
      if (inputs[idx][property] == undefined && ignoreUndefined) continue; // IGNORE IF (ignoreUndefined)
      if (!valueExists.includes(inputs[idx][property])) errors[idx] = generateMessage(error_code, {
        property: property,
        value: inputs[idx][property],
        comment: comment
      });
      else {
        // Case input chắc chắn map với exist
        inputs[idx] = setColumnsToPropertiesOfInputs(inputs[idx], property, exists, column, setColumnsToProperties);
      }
    }
  };
  // Delete Properties
  for (let input of inputs) {
    for (let prop of deleteProperties) delete input[prop];
  }

  return {
    errors,
    inputs
  };
}

/**
 * Case input chắc chắn map với records thông qua property của input và column của records
 * @param {object} input 
 * @param {string} property // of input
 * @param {Array<object>} records // value after query in DB
 * @param {string} column // of Main Table
 * @param {Array<object>} options // { columnName: "string", newProperty: "string", custom_value_function: "function" },
 * @returns 
 */
const setColumnsToPropertiesOfInputs = (input: object, property: string, records: any, column: string, options: any) => {
  if (!options.length) return input;

  let match;
  for (let record of records) {
    if (record[column] == input[property]) { match = record; break; }
  }

  if (match) {
    for (let option of options) {
      let columnName = option.columnName;
      let newProperty = option.newProperty;
      let custom_value_function = option.custom_value_function;

      let current_value = match[columnName];
      if (typeof custom_value_function == 'function') current_value = custom_value_function(current_value);
      input[newProperty] = current_value;
    }
  }

  return input;
}

/**
 * 
 * @param {Array<object>} inputs 
 * @param {Array<object>} allowFieldsOfEachRows  
 * @param {boolean} removeNotAllow
 * 
 * Note inputs.length = allowFieldsOfEachRows.length 
 */
const validateByAllowFieldOfEachRows = (inputs: any, allowFieldsOfEachRows: any, removeNotAllow: boolean) => {
  let errors = {};
  for (let idx = 0; idx < inputs.length; idx++) errors[idx] = [];

  let isTheSameLength = (inputs.length == allowFieldsOfEachRows.length);
  for (let idx = 0; idx < inputs.length; idx++) {
    if (!isTheSameLength) errors[idx] = "The length of allowFieldsOfEachRows don't match to the length of inputs.";
  };
  if (!isTheSameLength) return errors;

  let new_inputs = [];
  for (let idx in inputs) {
    // Ignore empty records ------------
    if (_.isEmpty(inputs[idx])) {
      new_inputs.push({});
      continue;
    };

    let copy_input = { ...inputs[idx] };
    let resultValidation = validateByAllowFieldsOfRow(copy_input, allowFieldsOfEachRows[idx], removeNotAllow) || [];

    if (resultValidation.error) {
      errors[idx].push(resultValidation.content);
      new_inputs.push(copy_input);
    }
    else {
      new_inputs.push(resultValidation.data);
    }
  }

  return {
    errors,
    new_inputs
  };
}

const validateByAllowFields = (inputs, allowFields, removeNotAllow) => {
  let errors = {};
  let new_inputs = [];

  for (let idx = 0; idx < inputs.length; idx++) errors[idx] = [];

  for (let idx in inputs) {
    // Ignore empty records ------------
    if (_.isEmpty(inputs[idx])) {
      new_inputs.push({});
      continue;
    };

    let copy_input = { ...inputs[idx] };
    let resultValidation = validateByAllowFieldsOfRow(copy_input, allowFields, removeNotAllow) || [];

    if (resultValidation.error) {
      errors[idx].push(resultValidation.content);
      new_inputs.push(copy_input);
    }
    else {
      new_inputs.push(resultValidation.data);
    }
  }
  return {
    errors,
    new_inputs
  };
}

/**
 * Check field by validateFunctions
 * @param {*} inputs 
 * @param {*} field 
 * @param {*} validateFunctions 
 * @returns 
 */
const validate = (inputs, field, validateFunctions = []) => {
  let errors = {};

  for (let idx = 0; idx < inputs.length; idx++) errors[idx] = [];

  for (let idx = 0; idx < inputs.length; idx++) {
    // Ignore empty records ------------
    if (_.isEmpty(inputs[idx]) || !inputs[idx][field]) continue;
    for (let func of validateFunctions) {
      if (typeof func != "function") continue
      let resultCheck = func(inputs[idx][field]);
      if (resultCheck.error) {
        errors[idx].push(generateMessage(resultCheck.code, resultCheck.values));
      }
    }
  }

  return errors;
}

/**
 * 
 * @param {Array[object]} inputs 
 * @returns 
 */
const validateDuplicate = (inputs, errorMessagesKey = "DUPLICATE") => {
  const message = generateMessage(errorMessagesKey);
  let errors = {};

  let duplicateIndexs = [];
  for (let i = 0; i < inputs.length - 1; i++) {

    // Ignore empty records ------------
    if (_.isEmpty(inputs[i])) continue;

    if (duplicateIndexs.includes(i)) continue;
    for (let j = i + 1; j < inputs.length; j++) {

      // Ignore empty records ------------
      if (_.isEmpty(inputs[j])) continue;

      if (duplicateIndexs.includes(j)) continue;
      if (isEquals(inputs[i], inputs[j])) {
        if (!duplicateIndexs.includes(i)) duplicateIndexs.push(i);
        if (!duplicateIndexs.includes(j)) duplicateIndexs.push(j);
      }
    }
  }

  for (let idx of duplicateIndexs) errors[idx] = message;

  return errors;
}

/**
 * Check unique fields
 * @param {Array[object]} inputs 
 * @param {Array[ string | Array[string] ]} fields 
 */
const validateUnique = (inputs, fields = [], errorMessagesKey = "UNIQUE") => {
  if (!fields.length) return {};

  let errorUniqueIndex = [];
  let fieldUnique = []

  for (let field of fields) {
    // Convert string prop to array [prop]
    if (typeof field == 'string') {
      field = [field];
    }

    if (typeof field == 'object' && !Array.isArray(field)) {
      field = Object.keys(field)
    }

    if (Array.isArray(field)) {
      if (!field.length) continue;
      // Filter prop for check unique
      let new_inputs = inputs.map(record => {
        let obj = {};
        for (let prop of field) {
          obj[prop] = record[prop];
        }
        return obj;
      });

      for (let i = 0; i < new_inputs.length - 1; i++) {
        // Ignore empty records ------------
        if (_.isEmpty(inputs[i]) || !new_inputs[i][field[0]]) continue;
        if (errorUniqueIndex.includes(i)) continue;

        if (Array.isArray(new_inputs[i][field[0]])) {
          let findDuplicates = new_inputs[i][field[0]].filter((item, index) => new_inputs[i][field[0]].indexOf(item) != index)
          if (Array.isArray(findDuplicates) && findDuplicates.length) {
            fieldUnique.push(field[0])
            errorUniqueIndex.push(i)
          }
        }

        for (let j = i + 1; j < new_inputs.length; j++) {

          // Ignore empty records ------------
          if (_.isEmpty(inputs[j]) || !new_inputs[j]) continue;
          if (errorUniqueIndex.includes(j)) continue;

          if (isEquals(new_inputs[i], new_inputs[j])) {
            fieldUnique.push(field[0])
            if (!errorUniqueIndex.includes(i)) errorUniqueIndex.push(i);
            if (!errorUniqueIndex.includes(j)) errorUniqueIndex.push(j);
          }
        }
      }
    }
  }

  // Get label when display in front
  // let fieldNames = [];
  // for (let field of fields) {
  //   if (typeof field == 'string') fieldNames.push(field);
  //   else if (Array.isArray(field)) {
  //     let arrayField = [];
  //     for (let fi of field) {
  //       if (typeof field == 'string') arrayField.push(fi);
  //       else { arrayField.push(...Object.values(field)) }
  //     }
  //     fieldNames.push(...arrayField);
  //   }
  //   else fieldNames.push(...Object.values(field));
  // }

  const message = generateMessage(errorMessagesKey, { fieldName: fieldUnique[0] });

  let errors = {};
  for (let idx of errorUniqueIndex) errors[idx] = message;

  return errors;
}

export default {
  validateUpload, validateNotAllowDataExistInDBByColumn, validateDataExistInDBByColumn
}