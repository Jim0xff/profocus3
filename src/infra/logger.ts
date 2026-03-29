import { createLogger, format, transports } from "winston";
import rTracer from "cls-rtracer";

const { combine, timestamp, printf, errors } = format;

const logFormat = printf(({ level, message, timestamp: ts }) => {
  return `${ts} ${level} ${rTracer.id() ?? ""} ${message}`;
});

export const logger = createLogger({
  level: process.env.LOG_LEVEL ?? "info",
  format: combine(errors({ stack: true }), timestamp(), logFormat),
  transports: [new transports.Console()]
});
