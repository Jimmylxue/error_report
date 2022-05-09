/**
 * log4js 是一款方便我们记录日志的文件  这里用来记录错误的日志
 */

const log4js = require("log4js");

log4js.configure({
  appenders: {
    fileout: { type: "file", filename: "error.log" },
    datafileout: {
      type: "dateFile",
      filename: "datafileout.log",
      pattern: ".yyyy-MM-dd-hh-mm-ss-SSS",
    },
    consoleout: { type: "console" },
  },
  categories: {
    default: { appenders: ["fileout", "consoleout"], level: "debug" },
    anything: { appenders: ["consoleout"], level: "debug" },
  },
});

let logger = log4js.getLogger();

module.exports = logger;
