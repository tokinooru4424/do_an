const winston = require('winston');
require('winston-daily-rotate-file');

const { combine, timestamp, printf, prettyPrint, splat, simple } = winston.format;
const logConfig = require("@config/logger").default;
const myFormat = printf(info => {
  return `${info.timestamp} ${info.level}: ${JSON.stringify(info.message, null)}`;
});

const Logger = (folderName, options = {}) => {
  let path = logConfig.DIRNAME
  if (folderName) path += `${folderName}/`

  let transportOptions = {
    dirname: path,
    datePattern: logConfig.DATE_PATTERN,
    zippedArchive: false,
    maxSize: logConfig.MAXSIZE,
    maxFiles: logConfig.MAXFILES
  }

  const logger = winston.createLogger({
    level: 'info',
    format: combine(
      timestamp(),
      splat(),
      myFormat
    ),
    transports: [
      new (winston.transports.DailyRotateFile)({ filename: `%DATE%-error.log`, level: 'error', ...transportOptions }),
      new (winston.transports.DailyRotateFile)({ filename: `%DATE%-info.log`, level: 'info', ...transportOptions }),
    ],
    ...options
  });

  return logger
}

export default Logger
