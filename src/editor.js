import React from "react";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import ExampleTheme from "./ExampleTheme";
import { $generateHtmlFromNodes } from "@lexical/html";
import { $getRoot, $getSelection } from "lexical";
import ToolbarPlugin from "./plugins/ToolbarPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { LecialInnerWrapper, LecialMainWrapper } from "./lexicaltext";

const editorConfig = {
  namespace: "React.js Demo",
  nodes: [],
  // Handling of errors during update
  onError(error) {
    throw error;
  },
  // The editor theme
  theme: ExampleTheme,
};

function Placeholder() {
  return <div className="editor-placeholder">Enter some rich text...</div>;
}

const Editor = ({ onChangeHandler }) => {
  return (
    <LexicalComposer initialConfig={editorConfig}>
      <LecialMainWrapper>
        <ToolbarPlugin />
        <LecialInnerWrapper>
          <RichTextPlugin
            contentEditable={<ContentEditable className="editor-input" />}
            placeholder={<Placeholder />}
            ErrorBoundary={LexicalErrorBoundary}
          />
          <OnChangePlugin
            onChange={(editorState, editor) => {
              editorState.read(() => {
                const html = $generateHtmlFromNodes(editor);
                onChangeHandler(html)
              });
            }}
          />
          <HistoryPlugin />
          <AutoFocusPlugin />
        </LecialInnerWrapper>
      </LecialMainWrapper>
      <div className="editor-container"></div>
    </LexicalComposer>
  );
};

export default Editor;
