import * as React from "react";
import Editor from "./editor";

export default function App() {
  const changeHandler = (value) => {
    console.log(value)
  }
  return <Editor onChangeHandler={changeHandler} />;
}
