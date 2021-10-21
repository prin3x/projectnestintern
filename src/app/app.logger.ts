import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

export const appLoggerProduction = WinstonModule.createLogger({
  transports: [
    new winston.transports.Console({
      level: 'info',
      format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
    }),
  ],
});

export const appLoggerDevelopment = WinstonModule.createLogger({
  transports: [
    new winston.transports.Console({
      level: 'debug',
      format: winston.format.combine(
        winston.format.colorize({}),
        winston.format.timestamp({
          format: 'DD-MM-YYYY HH:mm:ss',
        }),
        winston.format.printf(({ level, message, context, timestamp }) => {
          if (typeof message === 'object') {
            return `${timestamp} ${level} :  [${context}] ${JSON.stringify(message)}`;
          } else {
            return `${timestamp} ${level} :  [${context}] ${message}`;
          }
        })
      ),
    }),
  ],
});
