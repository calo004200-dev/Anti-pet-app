import winston from 'winston';
import 'winston-daily-rotate-file';

// Define log format
const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
);

// Transport for daily rotated files (keeps last 14 days)
const fileRotateTransport = new winston.transports.DailyRotateFile({
    filename: 'logs/petconnect-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    maxFiles: '14d',
});

// Transport for errors specifically
const errorFileRotateTransport = new winston.transports.DailyRotateFile({
    level: 'error',
    filename: 'logs/error-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    maxFiles: '30d',
});

// Create the logger instance
export const logger = winston.createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: logFormat,
    transports: [
        fileRotateTransport,
        errorFileRotateTransport,
        ...(process.env.NODE_ENV !== 'production'
            ? [new winston.transports.Console({
                format: winston.format.combine(
                    winston.format.colorize(),
                    winston.format.simple()
                )
            })]
            : [])
    ],
});
