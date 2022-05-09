const router = require("koa-router")();
const StackParser = require("../utils/stackparser");
const path = require("path");
const logger = require("../utils/log");

router.get("/", async (ctx) => {
  ctx.body = "AbnormalMonitoring";
});

// 错误上报接口
router.get("/upload", async (ctx) => {
  let json = JSON.parse(
    Buffer.from(ctx.query.info, "base64").toString("utf-8")
  );
  const stackParser = new StackParser(path.join(__dirname, "../source"));
  const stackFrame = stackParser.parseStackTrack(json.stack, json.message);
  const originStack = await stackParser.getOriginalErrorStack(stackFrame);
  logger.info(originStack);
  ctx.body = "";
});

module.exports = router.routes();
