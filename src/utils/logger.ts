// Define your severity levels.
// With them, You can create log files,

import winston from 'winston';
//
// Replaces the previous transports with those in the
// new configuration wholesale.
//
const DailyRotateFile = require('winston-daily-rotate-file');

// see or hide levels based on the running ENV.
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// This method set the current severity based on
// the current NODE_ENV: show all the log levels
// if the server was run in development mode; otherwise,
// if it was run in production, show only warn and error messages.
const level = () => {
  const env = process.env.NODE_ENV || 'development';
  const isDevelopment = env === 'development';
  return isDevelopment ? 'debug' : 'warn';
};

// Define different colors for each level.
// Colors make the log message more visible,
// adding the ability to focus or ignore messages.
const colors: { [key: string]: string } = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Tell winston that you want to link the colors
// defined above to the severity levels.
winston.addColors(colors);

// Chose the aspect of your log customizing the log format.
const format = winston.format.combine(
  winston.format.errors({ stack: true }),

  // Add the message timestamp with the preferred format
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  // Tell Wiston to align the output
  winston.format.align(),

  winston.format((info) => {
    info.level = info.level.toUpperCase();
    return info;
  })(),

  // Tell Winston that the logs must be colored
  winston.format.colorize({ all: true }),
  // Define the format of the message showing the timestamp, the level and the message
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// Define which transports the logger must use to print out messages.
// In this example, we are using three different transports
const transports = [
  // Allow the use the console to print the messages
  new winston.transports.Console({ level: 'debug' }),

  // Allow to print all the error message inside the combined.log file
  // (also the error log that are also printed inside the error.log(

  new winston.transports.File({
    filename: 'logs/combined.log',
  }),
  // Allow to print all the error level messages inside the error.log file
  new winston.transports.File({
    filename: 'logs/app-error.log',
    level: 'error',
  }),
  new winston.transports.File({
    filename: 'logs/app-info.log',
    level: 'info',
  }),

  new DailyRotateFile({
    filename: 'logs/combined-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    maxFiles: '14d',
  }),
];

// Create the logger instance that has to be exported
// and used to log messages.
export const logger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports,
});
