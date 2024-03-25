import * as React from "react";
import Editor from "./editor";

export default function App() {
  const [value, setValue] = React.useState("")
  const changeHandler = (value) => {
    setValue(value)
  }
  return <> <Editor onChangeHandler={changeHandler} /> 
  <p>
    {value}
  </p>
  </>;
}
