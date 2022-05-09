/**
 * 错误上报，就是将触发错误时的error信息进行上报
 *  其中最核心的应该就是粗无栈，其实我们定位错误时最主要的也就是错误栈
 *  错误对战中包含了大多数调试有关的信息，其中就包括了异常的位置（行号，列号）信息，以及异常信息
 */
export const uploadError = ({
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
