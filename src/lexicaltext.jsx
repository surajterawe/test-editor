import { Box } from "@mui/material";
import { withStyles } from "@mui/styles";
import arrowCounterclockwise from "./icons/arrow-counterclockwise.svg"
import clockwise from './icons/arrow-clockwise.svg';
import bold from './icons/type-bold.svg';
import italic  from './icons/type-italic.svg';
import underline from './icons/type-underline.svg';
import strikethrough from './icons/type-strikethrough.svg';
import textLeft from './icons/text-left.svg';
import textCenter from './icons/text-center.svg';
import textRight from './icons/text-right.svg';
import justify from './icons/justify.svg';

export const LecialMainWrapper = withStyles({
  root: {
    margin: "20px auto 20px auto",
    borderRadius: "2px",
    width: "fit-content",
    minWidth: "100%",
    color: "#000",
    position: "relative",
    lineHeight: "20px",
    fontWeight: "400",
    textAlign: "left",
    borderTopLeftRadius: "10px",
    borderTopRightRadius: "10px",
    "& .editor-input": {
      minHeight: "150px",
      resize: "none",
      fontSize: "15px",
      caretColor: "rgb(5, 5, 5)",
      position: "relative",
      tabSize: 1,
      outline: 0,
      padding: "15px 10px",
    },
    "& .editor-placeholder": {
      color: "#999",
      overflow: "hidden",
      position: "absolute",
      textOverflow: "ellipsis",
      top: "15px",
      left: "10px",
      fontSize: "15px",
      userSelect: "none",
      display: "inline-block",
      pointerEvents: "none",
    },
    "& .ltr": {
      textAlign: "left",
    },
    "& .rtl": {
      textAlign: "right",
    },
    "& .editor-text-bold": {
      fontWeight: "bold",
    },
    "& .editor-text-italic": {
      fontStyle: "italic",
    },
    "& .editor-text-underline": {
      textDecoration: "underline",
    },
    "& .editor-text-strikethrough": {
      textDecoration: "line-through",
    },
    "& .editor-text-underlineStrikethrough": {
      textDecoration: "underline line-through",
    },
    "& .editor-text-code": {
      backgroundColor: "rgb(240, 242, 245)",
      padding: "1px 0.25rem",
      fontFamily: "Menlo, Consolas, Monaco, monospace",
      fontSize: "94%",
    },
    "& .editor-link": {
      color: "rgb(33, 111, 219)",
      textDecoration: "none",
    },
    "& .tree-view-output": {
      display: "block",
      background: "#222",
      color: "#fff",
      padding: "5px",
      fontSize: "12px",
      whiteSpace: "pre-wrap",
      margin: "1px auto 10px auto",
      maxHeight: "250px",
      position: "relative",
      borderBottomLeftRadius: "10px",
      borderBottomRightRadius: "10px",
      overflow: "auto",
      lineHeight: "14px",
    },
    "& .editor-code": {
      backgroundColor: "rgb(240, 242, 245)",
      fontFamily: "Menlo, Consolas, Monaco, monospace",
      display: "block",
      padding: "8px 8px 8px 52px",
      lineHeight: "1.53px",
      fontSize: "13px",
      margin: "0",
      marginTop: "8px",
      marginBottom: "8px",
      tabSize: "2",
      /* white-space: pre; */
      overflowX: "auto",
      position: "relative",
    },
    "& .editor-code:before": {
      content: "attr(data-gutter)",
      position: "absolute",
      backgroundColor: "#eee",
      left: 0,
      top: 0,
      borderRight: "1px solid #ccc",
      padding: "8px",
      color: "#777",
      whiteSpace: "pre-wrap",
      textAlign: "right",
      minWidth: "25px",
    },
    "& .editor-code:after": {
      content: "attr(data-highlight-language)",
      top: 0,
      right: "3px",
      padding: "3px",
      fontSize: "10px",
      textTransform: "uppercase",
      position: "absolute",
      color: "rgba(0, 0, 0, 0.5)",
    },
    "& .editor-tokenComment": {
      color: "slategray",
    },
    "& .editor-tokenPunctuation": {
      color: "#999",
    },
    "& .editor-tokenProperty": {
      color: "#905",
    },
    "& .editor-tokenSelector": {
      color: "#690",
    },
    "& .editor-tokenOperator": {
      color: "#9a6e3a",
    },
    "& .editor-tokenAttr": {
      color: "#07a",
    },
    "& .editor-tokenVariable": {
      color: "#e90",
    },
    "& .editor-tokenFunction": {
      color: "#dd4a68",
    },
    "& .editor-paragraph": {
      margin: "0px",
      marginBottom: "8px",
      position: "relative",
    },
    "& .editor-paragraph:last-child": {
      marginBottom: "0",
    },
    "& .editor-heading-h1": {
      fontSize: 24,
      color: "rgb(5, 5, 5)",
      fontWeight: 400,
      margin: 0,
      marginBottom: 12,
      padding: 0,
    },
    "& .editor-heading-h2": {
      fontSize: 15,
      color: "rgb(101, 103, 107)",
      fontWeight: 700,
      margin: 0,
      marginTop: 10,
      padding: 0,
      textTransform: "uppercase",
    },
    "& .editor-quote": {
      margin: 0,
      marginLeft: 20,
      fontSize: 15,
      color: "rgb(101, 103, 107)",
      borderLeftColor: "rgb(206, 208, 212)",
      borderLeftWidth: 4,
      borderLeftStyle: "solid",
      paddingLeft: 16,
    },
    "& .editor-list-ol": {
      padding: 0,
      margin: 0,
      marginLeft: 16,
    },
    "& .editor-list-ul": {
      padding: 0,
      margin: 0,
      marginLeft: 16,
    },
    "& .editor-listitem": {
      margin: "8px 32px 8px 32px",
    },
    "& .editor-nested-listitem": {
      listStyleType: "none",
    },
    "& pre::-webkit-scrollbar": {
      background: "transparent",
      width: 10,
    },
    "& pre::-webkit-scrollbar-thumb": {
      background: "#999",
    },
    "& .debug-timetravel-panel": {
      overflow: "hidden",
      padding: "0 0 10px 0",
      margin: "auto",
      display: "flex",
    },
    "& .debug-timetravel-panel-slider": {
      padding: 0,
      flex: 8,
    },
    "& .debug-timetravel-panel-button": {
      padding: 0,
      border: 0,
      background: "none",
      flex: 1,
      color: "#fff",
      fontSize: 12,
    },
    "& .debug-timetravel-panel-button:hover": {
      textDecoration: "underline",
    },
    "& .debug-timetravel-button": {
      border: 0,
      padding: 0,
      fontSize: 12,
      top: 10,
      right: 15,
      position: "absolute",
      background: "none",
      color: "#fff",
    },
    "& .debug-timetravel-button:hover": {
      textDecoration: "underline",
    },
    "& .toolbar": {
      display: "flex",
      marginBottom: 1,
      background: "#fff",
      padding: 4,
      borderTopLeftRadius: 10,
      borderTopRightRadius: 10,
      verticalAlign: "middle",
    },
    "& .toolbar button.toolbar-item": {
      border: 0,
      display: "flex",
      background: "none",
      borderRadius: 10,
      padding: 8,
      cursor: "pointer",
      verticalAlign: "middle",
    },
    "& .toolbar button.toolbar-item:disabled": {
      cursor: "not-allowed",
    },
    "& .toolbar button.toolbar-item.spaced": {
      marginRight: 2,
    },
    "& .toolbar button.toolbar-item i.format": {
      backgroundSize: "contain",
      display: "inline-block",
      height: 18,
      width: 18,
      marginTop: 2,
      verticalAlign: "-0.25em",
      opacity: 0.6,
    },
    "& .toolbar button.toolbar-item:disabled i.format": {
      opacity: 0.2,
    },
    "& .toolbar button.toolbar-item.active": {
      backgroundColor: "rgba(223, 232, 250, 0.3)",
    },
    "& .toolbar button.toolbar-item.active i": {
      opacity: 1,
    },
    "& .toolbar .toolbar-item:hover:not([disabled])": {
      backgroundColor: "#eee",
    },
    "& .toolbar .toolbar-item.active-tab": {
        backgroundColor: "#eee",
    },
    "& .toolbar .divider": {
      width: 1,
      backgroundColor: "#eee",
      margin: "0 4px",
    },
    "& .toolbar .toolbar-item .text": {
      display: "flex",
      lineHeight: 20,
      width: 200,
      verticalAlign: "middle",
      fontSize: 14,
      color: "#777",
      textOverflow: "ellipsis",
      overflow: "hidden",
      height: 20,
      textAlign: "left",
    },
    "& .toolbar .toolbar-item .icon": {
      display: "flex",
      width: 20,
      height: 20,
      userSelect: "none",
      marginRight: 8,
      lineHeight: 16,
      backgroundSize: "contain",
    },
    "& i.undo": {
      backgroundImage: `url(${arrowCounterclockwise})`,
    },
    "& i.redo": {
      backgroundImage:`url(${clockwise})`,
    },
    "& i.bold": {
      backgroundImage: `url(${bold})`,
    },
    "& i.italic": {
      backgroundImage: `url(${italic})`,
    },
    "& i.underline": {
      backgroundImage: `url(${underline})`,
    },
    "& i.strikethrough": {
      backgroundImage: `url(${strikethrough})`,
    },
    "& i.left-align": {
      backgroundImage: `url(${textLeft})`,
    },
    "& i.center-align": {
      backgroundImage: `url(${textCenter})`,
    },
    "& i.right-align": {
      backgroundImage: `url(${textRight})`,
    },
    "& i.justify-align": {
      backgroundImage: `url(${justify})`,
    },
  },
})(({ classes, children }) => {
  return <Box className={classes.root}>{children}</Box>;
});

export const LecialInnerWrapper = withStyles({
  root: {
    background: "#fff",
    position: "relative",
  },
})(({ classes, children }) => {
  return <Box className={classes.root}>{children}</Box>;
});
