
/**
 * TEMPLATE_FUNCTION
 * @param {*} value 
 * @return { error: boolean, code: string}
 */
const template_function = (value) => {
  // processing
  return {
    error: true, // boolean true | false
    code: "TEMPLATE_CODE", // TEMPLATE_CODE in file ./message.js
    values: {} // values for generateMessage(code, values = {})
  }
}

/**
 * TEMPLATE_CUSTOM_FUNCTION 
 * @param  {...any} somethings 
 * @returns 
 */
const template_custom_function = (...somethings) => {
  return (value) => {
    // ... process by using args somethings
    return {
      error: true, // boolean true | false
      code: "TEMPLATE_CODE", // TEMPLATE_CODE in file ./message.js
      values: {} // values for generateMessage(code, values)
    }
  }
}

/**
 * Check string is email
 * @param {string} email 
 * @returns {boolean}
 */
const isEmail = (email: string) => {
  const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  if (re.test(email)) return {
    error: false,
    code: "EMAIL_INVALID",
    values: { email: email }
  };

  return {
    error: true,
    code: "EMAIL_INVALID",
    values: { email: email }
  }
}

/**
 * Check value is a positive number
 * @param {*} value 
 * @returns 
 */
const isPositiveNumber = (value) => {
  let ok = false;
  if ((typeof value == 'number' && !isNaN(value)) || !isNaN(parseFloat(value))) {
    ok = parseFloat(value) > 0 ? true : false
  }

  if (ok) return {
    error: false,
    code: "NOT_POSITIVE_NUMBER",
    values: { value }
  };

  return {
    error: true,
    code: "NOT_POSITIVE_NUMBER",
    values: { value }
  }
}

/**
 * Check value in range
 * @param {string} fieldName 
 * @param {number} start 
 * @param {number} end 
 * @returns 
 */
const numberInRange = (fieldName: string, start: number, end: number) => {
  if (start > end) {
    let tmp = start;
    start = end;
    end = tmp;
  }
  return (value: number) => {
    if (value < start || value > end) {
      return {
        error: true,
        code: "MUST_IN_RANGE",
        values: {
          fieldName,
          start,
          end,
        }
      }
    } else {
      return { error: false }
    }
  }
}

/**
 * Check string percent in range
 * @param {string} fieldName 
 * @param {number} numStart 
 * @param {number} numEnd 
 */
const percentInRange = (fieldName: string, numStart: number, numEnd: number) => {
  return (value: string) => {
    value = value.replace(/%/g, "").trim();
    let numValue = Number(value);
    if (!isNaN(numValue) && numValue >= numStart && numValue <= numEnd) return { error: false };

    return {
      error: true,
      code: "PERCENT_MUST_IN_RANGE",
      values: {
        fieldName,
        percentStart: numStart,
        percentEnd: numEnd,
      }
    }
  }
}

export default {
  template_function, template_custom_function, // Example function 
  isEmail, isPositiveNumber, numberInRange, percentInRange
}