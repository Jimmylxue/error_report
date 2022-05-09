import React from "react";
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidCatch(error, info) {
    // 发生异常时打印错误
    console.log("componentDidCatch", error);
  }

  render() {
    return this.props.children;
  }
}
