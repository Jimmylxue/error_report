# 前端异常监控系统

前端异常监控是非常常用的功能，由于现在前端需要处理的代码量越来越大了，web页面的功能也越来越多复杂，比如：地图、线上PS、等等，它们的代码量都是十分巨大的，所以就需要监控代码是否发生了错误。

## 流程

- 发现错误手机错误
- 将错误上传至服务器
- 服务器收集下来至日志或服务器

## 前端监控错误的方式

### try-catch

try-catch是我第一眼能够想到的监听错误的方式，但是try-catch实际上是有缺陷的 ------ try-catch遇到异步就不好使了

```js
function fun(){
    error() // 手动触发错误
}

try{
    setTimeout(fun())
}catch(err){
    console.log(err.message)
}
```

注意：这里无法捕获到这个错误，这就是try-catch的机制，只能捕获同步的错误，异步的错误无法捕获

### onerror

onerror是写起来比较方便的写，并且也能够捕获异步的错误，但是无法捕获资源加载的错误，和Promise的错误

```html
<img src="./xxxxx.png"> 
<script>
	window.onerror = function(err){
        console.log(err.message()) // 无法捕获到图片资源加载错误
    }
</script>
```

### addEventLinstener('error',()=>{})

在绝大多数情况下，`onerror`和`addEventLinstener`的效果都是一样的，但是后者有一个更加强大的作用，它能够监听到资源加载的错误，但是它还是无法捕获到Promise的错误

```html
<img src="./xxxxx.png"> 
<script>
	window.onerror = function(err){
        console.log(err.message()) // 能够捕获到
    }
</script>
```

### addEventLinstener('unhandledrejection',()=>{})

监听这个错误能够精准的捕获到`promise`的错误，包括`async`和`await`的错误

```js
new Promise((resolve, reject) => {
  abcxxx() // promise错误
});

window.addEventListener("unhandledrejection", e => {
  console.log('unhandledrejection',e) // 能够捕获到
});
```

## 错误上报方式

前端错误上报最简单的方式就是动态创建Image标签，然后通过设置`img`的`src`属性来实现上报，这个是最简单的发起`GET`请求的方式，百度的上报也是使用这个进行上报的。当然也可以使用`ajax`进行上报。

### error对象

error对象过去我只会简单的使用`error.message` 来获取错误的主要信息，但是这个在开发环境下是用不了的，因为开发环境下我们使用的是压缩的打包js，所有的方法都被重命名为简单的名字，没有办法定位。

error对象的属性：

|  属性 | 含义 |类型  |
|  ----  | ----  | ----  |
| message | 错误信息 |string |
| filename | 异常的资源url |string |
| lineno | 行号 |number |
| colno | 列号 |number |
| error | 错误信息 |object |
| error.stack | 错误堆栈信息 |string |

```js
const uploadError = ({
  lineno, // 异常行号
  colno, // 异常列号
  error: { stack }, // 错误信息
  timeStamp, // 时间戳
  message, // 错误信息
  filename, // 触发异常的uri
}) => {
  // 过滤
  const info = {
    lineno,
    colno,
    stack,
    timeStamp,
    message,
    filename,
  };
  // const str = new Buffer(JSON.stringify(info)).toString("base64");
  /**
   * window.bota(str) 将 str 转换为 base64 编码的字符串
   *  可以通过 window.atob() 方法进行解码
   */
  const str = window.btoa(JSON.stringify(info));
  const host = "http://localhost:666/error/upload";
  new Image().src = `${host}?info=${str}`; // 通过 IMG 是最快的上报和发请求的方式 因为不需要引入第三方的库
};

// 上报的url:http://localhost:666/error/upload?info=eyJsaW5lbm8iOjg3LCJjb2xubyI6MTcsInN0YWNrIjoiVHlwZUVycm9yOiBlcnIgaXMgbm90IGEgZnVuY3Rpb25cbiAgICBhdCBodHRwOi8vbG9jYWxob3N0OjMwMDAvc3RhdGljL2pzL2J1bmRsZS5qczo4NzoxN1xuICAgIGF0IGludm9rZVBhc3NpdmVFZmZlY3RDcmVhdGUgKGh0dHA6Ly9sb2NhbGhvc3Q6MzAwMC9zdGF0aWMvanMvYnVuZGxlLmpzOjMxMDI3OjI0KVxuICAgIGF0IEhUTUxVbmtub3duRWxlbWVudC5jYWxsQ2FsbGJhY2sgKGh0dHA6Ly9sb2NhbGhvc3Q6MzAwMC9zdGF0aWMvanMvYnVuZGxlLmpzOjExNjQzOjE4KVxuICAgIGF0IE9iamVjdC5pbnZva2VHdWFyZGVkQ2FsbGJhY2tEZXYgKGh0dHA6Ly9sb2NhbGhvc3Q6MzAwMC9zdGF0aWMvanMvYnVuZGxlLmpzOjExNjkyOjIwKVxuICAgIGF0IGludm9rZUd1YXJkZWRDYWxsYmFjayAoaHR0cDovL2xvY2FsaG9zdDozMDAwL3N0YXRpYy9qcy9idW5kbGUuanM6MTE3NTI6MzUpXG4gICAgYXQgZmx1c2hQYXNzaXZlRWZmZWN0c0ltcGwgKGh0dHA6Ly9sb2NhbGhvc3Q6MzAwMC9zdGF0aWMvanMvYnVuZGxlLmpzOjMxMTA5OjEzKVxuICAgIGF0IHVuc3RhYmxlX3J1bldpdGhQcmlvcml0eSAoaHR0cDovL2xvY2FsaG9zdDozMDAwL3N0YXRpYy9qcy9idW5kbGUuanM6Mzg4NTc6MTYpXG4gICAgYXQgcnVuV2l0aFByaW9yaXR5JDEgKGh0dHA6Ly9sb2NhbGhvc3Q6MzAwMC9zdGF0aWMvanMvYnVuZGxlLmpzOjE5MDQ5OjE0KVxuICAgIGF0IGZsdXNoUGFzc2l2ZUVmZmVjdHMgKGh0dHA6Ly9sb2NhbGhvc3Q6MzAwMC9zdGF0aWMvanMvYnVuZGxlLmpzOjMwOTg2OjE4KVxuICAgIGF0IGh0dHA6Ly9sb2NhbGhvc3Q6MzAwMC9zdGF0aWMvanMvYnVuZGxlLmpzOjMwODY3OjE1IiwidGltZVN0YW1wIjozNDUuODk5OTk5OTkxMDU5MywibWVzc2FnZSI6IlVuY2F1Z2h0IFR5cGVFcnJvcjogZXJyIGlzIG5vdCBhIGZ1bmN0aW9uIiwiZmlsZW5hbWUiOiJodHRwOi8vbG9jYWxob3N0OjMwMDAvc3RhdGljL2pzL2J1bmRsZS5qcyJ9
```

#### 其他知识点

- 浏览器特有的编码解码的方法

  window.bota(str) 将 str 转换为 base64 编码的字符串，可以通过 window.atob() 方法进行解码

## 后端接收上报

后端这边需要处理的是接收到这个请求，再将这个错误进行解析，结合对应的`sourcemap`文件逆解析获取原来错误的位置，最后将这个信息存储到对应的日志文件或者数据库中。

### router路由文件

```js
const router = require("koa-router")();
const StackParser = require("../utils/stackparser");
const path = require("path");
const logger = require("../utils/log");

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
```

### log日志文件

这里使用的是一个非常稳定的js库`log4js`，我也是第一次使用，非常棒能够帮我们存储成单独的`.log`日志文件

```js
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

// 调用方法使用 logger.info(message)
```

### stackparser逆向解析错误

这个就是使用sourcemap来定位原来的错误，在这之前我们需要手动的上传一下`.map`文件至`source`目录下

这里使用到了第三方数据模块：`error-stack-parser`，`source-map`

```js
const ErrorStackParser = require("error-stack-parser");
const { SourceMapConsumer } = require("source-map"); // 根据压缩过的错误信息 找回原来的错误信息
const path = require("path");
const fs = require("fs");
module.exports = class StackParser {
  constructor(sourceMapDir) {
    this.sourceMapDir = sourceMapDir;
    this.consumers = {};
  }

  parseStackTrack(stack, message) {
    // 生成新的错误信息
    const error = new Error(message);
    error.stack = stack;
    const stackFrame = ErrorStackParser.parse(error);
    return stackFrame;
  }

  async getOriginalErrorStack(stackFrame) {
    const origin = [];
    for (let v of stackFrame) {
      origin.push(await this.getOriginPosition(v));
    }

    return origin;
  }

  async getOriginPosition(stackFrame) {
    // 将新的错误信息定位到 sourcemap 中
    let { columnNumber, lineNumber, fileName } = stackFrame;
    console.log(columnNumber, lineNumber, fileName);
    /**
     * path.basename(fileName) 返回 一个 uri 的最后指向的文件
     *  如 fileName = http://127.0.0.1:5500/react-sample/build/static/js/main.js
     *  结果会返回：main.js
     */
    fileName = path.basename(fileName);
    // 判断consumer是否存在
    let consumer = this.consumers[fileName];
    if (consumer === undefined) {
      // 读取sourcemap
      const sourceMapPath = path.resolve(this.sourceMapDir, fileName + ".map");
      // 判断文件是否存在
      if (!fs.existsSync(sourceMapPath)) {
        return stackFrame;
      }
      const content = fs.readFileSync(sourceMapPath, "utf-8"); // 读取sourcemap源文件
      consumer = await new SourceMapConsumer(content, null);
      this.consumers[fileName] = consumer;
    }
    const parseData = consumer.originalPositionFor({
      line: lineNumber, // 找到对应的行
      column: columnNumber, // 找到对应的列
    });
    return parseData;
  }
};
```

#### 其他知识点

- path.basename() 定位文件名称

  如 fileName = http://127.0.0.1:5500/react-sample/build/static/js/main.js，结果会返回main.js

## 最终的log日志文件

```
[2021-12-21T16:49:14.612] [INFO] default - [
  { source: 'index.js', line: 36, column: 11, name: 'stack' },
  { source: 'index.js', line: 21, column: 16, name: 'args' }
]
[2021-12-21T16:49:15.545] [INFO] default - [
  { source: 'index.js', line: 36, column: 11, name: 'stack' },
  { source: 'index.js', line: 21, column: 16, name: 'args' }
]
```

这里就可以获取到经过sourcemap转换过的具体错误信息。

# 总结

到这里基本已经完成了错误上报系统的实现。通过这个学习到了很多以前没有接触的知识点。收获颇丰。
