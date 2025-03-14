import { createLogger, format, transports } from "winston";
import { env } from "process";

const loggerConfig = {
  level: env.NODE_ENV === "production" ? "info" : "debug",
  format: format.combine(
    format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    format.errors({ stack: true }),
    format.splat(),
    format.json(),
  ),
  defaultMeta: { service: "star-infinity" },
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.printf((info) => {
          const { timestamp, level, message, ...args } = info;
          return `${timestamp} ${level}: ${message} ${Object.keys(args).length ? JSON.stringify(args, null, 2) : ""}`;
        }),
      ),
    }),
  ],
};

export const logger = createLogger(loggerConfig);

export const msToPrettyTime = (totalMilliseconds) => {
  const msInSecond = 1000;
  const secondInMinute = 60;
  const minuteInHour = 60;

  const ms = totalMilliseconds % msInSecond;
  const seconds = Math.floor(totalMilliseconds / msInSecond) % secondInMinute;
  const minutes = Math.floor(totalMilliseconds / (msInSecond * secondInMinute)) % minuteInHour;
  const hours = Math.floor(totalMilliseconds / (msInSecond * secondInMinute * minuteInHour));

  return (
    [hours && `${hours}h`, minutes && `${minutes}m`, seconds && `${seconds}s`, ms && `${ms}ms`]
      .filter((item) => !!item)
      .join(" ") || "0"
  );
};

export const stopwatchLoggerFactory = (operationName) => {
  const start = Date.now();
  return {
    stop: () => {
      const elapsed = Date.now() - start;
      logger.info(`Operation "${operationName}" completed in ${msToPrettyTime(elapsed)}`);
      return elapsed;
    },
    checkpoint: (checkpointName) => {
      const elapsed = Date.now() - start;
      logger.debug(
        `Checkpoint "${checkpointName}" for "${operationName}" reached in ${msToPrettyTime(elapsed)}`,
      );
      return elapsed;
    },
  };
};

export default logger;
