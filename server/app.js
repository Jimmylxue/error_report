const koa = require("koa");
const cors = require("koa2-cors");
const router = require("koa-router")();
const bodyparser = require("koa-bodyparser");
const errors = require("./route/error");

const app = new koa();
app.use(cors());
app.use(bodyparser());
router.use("/error", errors);

app.use(router.routes());

app.listen(666, () => {
  console.log("server is running on port 666!");
});
