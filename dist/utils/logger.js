"use strict";
// Define your severity levels.
// With them, You can create log files,
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const winston_1 = __importDefault(require("winston"));
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
const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'white',
};
// Tell winston that you want to link the colors
// defined above to the severity levels.
winston_1.default.addColors(colors);
// Chose the aspect of your log customizing the log format.
const format = winston_1.default.format.combine(winston_1.default.format.errors({ stack: true }), 
// Add the message timestamp with the preferred format
winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }), 
// Tell Wiston to align the output
winston_1.default.format.align(), winston_1.default.format((info) => {
    info.level = info.level.toUpperCase();
    return info;
})(), 
// Tell Winston that the logs must be colored
winston_1.default.format.colorize({ all: true }), 
// Define the format of the message showing the timestamp, the level and the message
winston_1.default.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`));
// Define which transports the logger must use to print out messages.
// In this example, we are using three different transports
const transports = [
    // Allow the use the console to print the messages
    new winston_1.default.transports.Console({ level: 'debug' }),
    // Allow to print all the error message inside the combined.log file
    // (also the error log that are also printed inside the error.log(
    new winston_1.default.transports.File({
        filename: 'logs/combined.log',
    }),
    // Allow to print all the error level messages inside the error.log file
    new winston_1.default.transports.File({
        filename: 'logs/app-error.log',
        level: 'error',
    }),
    new winston_1.default.transports.File({
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
exports.logger = winston_1.default.createLogger({
    level: level(),
    levels,
    format,
    transports,
});
//# sourceMappingURL=logger.js.map