/**
 * YOU SHOULD READ THE MANUAL BELOW :
 * 
 * Main functions and important values: 
 * 
 * errorMessages <variable> : store errors' code and content errors
 * 
 * validateUpload <function> : Main function for validate data upload
 * validateDataExistInDBByColumn <async function> throw error if input isn't exist in DB
 * validateNotAllowDataExistInDBByColumn <async function> throw error if input is already exist in DB
 * 
 * mapError <function> : Map 2 or more validation's error, args is an object with format { "0": [], "1": [], "2": []}
 * mapErrorsToGridTable <function> : convert errors to data for GridTable
 * 
 * validateFunctions < object<Function> > : contain function to check validate value and return error with error's code
 * 
 * Note: when u declare a function of validateFunctions, u should defind error's code in variable errorMessages
 */

import util from './util'
import validate from './validate'
import errorMessages from './message'
import validateFunctions from './function'

const { mapErrorsToGridTable, mapError, generateMessage, isEquals } = util
const { validateUpload, validateNotAllowDataExistInDBByColumn, validateDataExistInDBByColumn } = validate
const { errorMessages_en, errorMessages_vi } = errorMessages
const { isEmail, isPositiveNumber, numberInRange } = validateFunctions

export default {
    errorMessages_en,
    errorMessages_vi,
    isEmail, isPositiveNumber, numberInRange,
    validateUpload, validateNotAllowDataExistInDBByColumn, validateDataExistInDBByColumn,
    mapErrorsToGridTable, mapError, generateMessage, isEquals
}