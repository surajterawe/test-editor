import React, { useCallback, useEffect, useRef, useState } from "react";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import ExampleTheme from "./ExampleTheme";
import { TRANSFORMERS } from "@lexical/markdown";
import {
  $createHorizontalRuleNode,
  $isHorizontalRuleNode,
} from "@lexical/react/LexicalHorizontalRuleNode";
import { $convertToMarkdownString } from "@lexical/markdown";
import { useCollaborationContext } from "@lexical/react/LexicalCollaborationContext";
import { $createCodeNode, $isCodeNode } from "@lexical/code";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { mergeRegister } from "@lexical/utils";
import { CONNECTED_COMMAND, TOGGLE_CONNECT_COMMAND } from "@lexical/yjs";
import {
  $createTextNode,
  $getRoot,
  $getSelection,
  $insertNodes,
  $isLineBreakNode,
  $isRangeSelection,
  CLICK_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
  COMMAND_PRIORITY_EDITOR,
  COMMAND_PRIORITY_HIGH,
  COMMAND_PRIORITY_LOW,
  KEY_ESCAPE_COMMAND,
  SELECTION_CHANGE_COMMAND,
} from "lexical";
import { CodeNode } from "@lexical/code";
import {
  $createLinkNode,
  $isAutoLinkNode,
  $isLinkNode,
  LinkNode,
  TOGGLE_LINK_COMMAND,
} from "@lexical/link";
import { $generateNodesFromDOM } from "@lexical/html";
import { ListNode, ListItemNode } from "@lexical/list";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { HorizontalRuleNode } from "@lexical/react/LexicalHorizontalRuleNode";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { $generateHtmlFromNodes } from "@lexical/html";
import ToolbarPlugin from "./plugins/ToolbarPlugin";
import { getSelectedNode } from "./utils/getSelectedNode";
import { exportFile, importFile } from "@lexical/file";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { LecialInnerWrapper, LecialMainWrapper } from "./lexicaltext";
import { $convertFromMarkdownString } from "@lexical/markdown";
import { useSettings } from "./context/SettingsContext";
import { sanitizeUrl } from "./utils/url";
import { $findMatchingParent } from "@lexical/utils";
import { createPortal } from "react-dom";
import { setFloatingElemPositionForLinkEditor } from "./utils/setFloatingElemPositionForLinkEditor";
import { marked } from "marked";

const editorConfig = {
  namespace: "React.js Demo",
  nodes: [
    HorizontalRuleNode,
    CodeNode,
    LinkNode,
    ListNode,
    ListItemNode,
    HeadingNode,
    QuoteNode,
  ],
  onError(error) {
    throw error;
  },
  // The editor theme
  theme: ExampleTheme,
};

function Placeholder() {
  return <div className="editor-placeholder">Enter some rich text...</div>;
}

async function validateEditorState(editor) {
  const stringifiedEditorState = JSON.stringify(editor.getEditorState());
  let response = null;
  try {
    response = await fetch("http://localhost:1235/validateEditorState", {
      body: stringifiedEditorState,
      headers: {
        Accept: "application/json",
        "Content-type": "application/json",
      },
      method: "POST",
    });
  } catch {
    // NO-OP
  }
  if (response !== null && response.status === 403) {
    throw new Error(
      "Editor state validation failed! Server did not accept changes."
    );
  }
}

const HR = {
  dependencies: [HorizontalRuleNode],
  export: (node) => {
    return $isHorizontalRuleNode(node) ? "***" : null;
  },
  regExp: /^(---|\*\*\*|___)\s?$/,
  replace: (parentNode, _1, _2, isImport) => {
    const line = $createHorizontalRuleNode();

    // TODO: Get rid of isImport flag
    if (isImport || parentNode.getNextSibling() != null) {
      parentNode.replace(line);
    } else {
      parentNode.insertBefore(line);
    }

    line.selectNext();
  },
  type: "element",
};
export const DEFAULT_TRANSFORMERS = [HR, ...TRANSFORMERS];

function ActionsPlugin({ isRichText }) {
  const [editor] = useLexicalComposerContext();
  const [isEditable, setIsEditable] = useState(() => editor.isEditable());
  const [connected, setConnected] = useState(false);

  const { isCollabActive } = useCollaborationContext();

  useEffect(() => {
    return mergeRegister(
      editor.registerEditableListener((editable) => {
        setIsEditable(editable);
      }),
      editor.registerCommand(
        CONNECTED_COMMAND,
        (payload) => {
          const isConnected = payload;
          setConnected(isConnected);
          return false;
        },
        COMMAND_PRIORITY_EDITOR
      )
    );
  }, [editor]);

  useEffect(() => {
    return editor.registerUpdateListener(
      ({ dirtyElements, prevEditorState, tags }) => {
        // If we are in read only mode, send the editor state
        // to server and ask for validation if possible.
        if (
          !isEditable &&
          dirtyElements.size > 0 &&
          !tags.has("historic") &&
          !tags.has("collaboration")
        ) {
          validateEditorState(editor);
        }
      }
    );
  }, [editor, isEditable]);

  const handleMarkdownToggle = useCallback(() => {
    editor.update(() => {
      const root = $getRoot();
      const firstChild = root.getFirstChild();
      if ($isCodeNode(firstChild) && firstChild.getLanguage() === "markdown") {
        $convertFromMarkdownString(
          firstChild.getTextContent(),
          DEFAULT_TRANSFORMERS
        );
      } else {
        const markdown = $convertToMarkdownString(DEFAULT_TRANSFORMERS);
        root
          .clear()
          .append(
            $createCodeNode("markdown").append($createTextNode(markdown))
          );
      }
      root.selectEnd();
    });
  }, [editor]);

  // const handleFileUpload = (event) => {
  //   const file = event.target.files[0];
  //   if (file) {
  //     const reader = new FileReader();
  //     reader.onload = () => {
  //       const htmlContent = reader.result;
  //       const parser = new DOMParser();
  //       const htmlDoc = parser.parseFromString(htmlContent, 'text/html');
  //       // You need to wrap the following operations inside the editor.update() callback
  //       editor.update(() => {
  //         const nodes = $generateNodesFromDOM(editor, htmlDoc);
  //         $getRoot().select();
  //         $insertNodes(nodes);
  //       });
  //     };
  //     reader.readAsText(file);
  //   }
  // };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const fileContent = reader.result;
        const fileExtension = file.name.split(".").pop().toLowerCase();
        editor.update(async () => {
          switch (fileExtension) {
            case "html":
              const parser = new DOMParser();
              const htmlDoc = parser.parseFromString(fileContent, "text/html");
              editor.update(() => {
                const nodes = $generateNodesFromDOM(editor, htmlDoc);
                $getRoot().select();
                $insertNodes(nodes);
              });
              break;
            case "docx":
              const reader = new FileReader();
              reader.onload = async () => {
                // Check the documentation or log the object to find the correct method
                // const htmlContent = await docxPreview.getHtmlContent(); // Replace with the correct method
                // console.log(htmlContent)
              };
              reader.readAsArrayBuffer(file);
              break;
            case "md":
              const mdreader = new FileReader();
              mdreader.onload = (e) => {
                const parser = new DOMParser();
                const markdownText = e.target.result;
                const convertedHtmlString = marked.parse(markdownText);
                const htmlDoc = parser.parseFromString(convertedHtmlString, "text/html");
                editor.update(() => {
                  const nodes = $generateNodesFromDOM(editor, htmlDoc);
                  $getRoot().select();
                  $insertNodes(nodes);
                });
              };
              mdreader.readAsText(file);
              break;
            default:
              console.warn("Unsupported file type:", fileExtension);
              break;
          }
        });
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="actions">
      <input
        id="fileImport"
        type="file"
        accept=".doc,.docx,.pdf,.html,.md"
        onChange={(e) => handleFileUpload(e)}
        className="action-button import-input"
      />
      <button
        className="action-button import"
        title="Import"
        aria-label="Import editor state from JSON"
      >
        <label htmlFor="fileImport">
          <i className="import" />
        </label>
      </button>
      <button
        className="action-button export"
        onClick={() =>
          exportFile(editor, {
            fileName: `Playground ${new Date().toISOString()}`,
            source: "Playground",
          })
        }
        title="Export"
        aria-label="Export editor state to JSON"
      >
        <i className="export" />
      </button>
      <button
        className="action-button"
        onClick={handleMarkdownToggle}
        title="Convert From Markdown"
        aria-label="Convert from markdown"
      >
        <i className="markdown" />
      </button>
      {isCollabActive && (
        <button
          className="action-button connect"
          onClick={() => {
            editor.dispatchCommand(TOGGLE_CONNECT_COMMAND, !connected);
          }}
          title={`${
            connected ? "Disconnect" : "Connect"
          } Collaborative Editing`}
          aria-label={`${
            connected ? "Disconnect from" : "Connect to"
          } a collaborative editing server`}
        >
          <i className={connected ? "disconnect" : "connect"} />
        </button>
      )}
    </div>
  );
}

function FloatingLinkEditor({
  editor,
  isLink,
  setIsLink,
  anchorElem,
  isLinkEditMode,
  setIsLinkEditMode,
}) {
  const editorRef = useRef(null);
  const inputRef = useRef(null);
  const [linkUrl, setLinkUrl] = useState("");
  const [editedLinkUrl, setEditedLinkUrl] = useState("https://");
  const [lastSelection, setLastSelection] = useState(null);

  const updateLinkEditor = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const node = getSelectedNode(selection);
      const linkParent = $findMatchingParent(node, $isLinkNode);

      if (linkParent) {
        setLinkUrl(linkParent.getURL());
      } else if ($isLinkNode(node)) {
        setLinkUrl(node.getURL());
      } else {
        setLinkUrl("");
      }
      if (isLinkEditMode) {
        setEditedLinkUrl(linkUrl);
      }
    }
    const editorElem = editorRef.current;
    const nativeSelection = window.getSelection();
    const activeElement = document.activeElement;

    if (editorElem === null) {
      return;
    }

    const rootElement = editor.getRootElement();
    if (
      selection !== null &&
      nativeSelection !== null &&
      rootElement !== null &&
      editor.isEditable()
    ) {
      const domRect =
        nativeSelection.focusNode?.parentElement?.getBoundingClientRect();
      if (domRect) {
        domRect.y += 40;
        setFloatingElemPositionForLinkEditor(domRect, editorElem, anchorElem);
      }
      setLastSelection(selection);
    } else if (!activeElement || activeElement.className !== "link-input") {
      if (rootElement !== null) {
        setFloatingElemPositionForLinkEditor(null, editorElem, anchorElem);
      }
      setLastSelection(null);
      setIsLinkEditMode(false);
      setLinkUrl("");
    }

    return true;
  }, [anchorElem, editor, setIsLinkEditMode, isLinkEditMode, linkUrl]);

  useEffect(() => {
    const scrollerElem = anchorElem.parentElement;

    const update = () => {
      editor.getEditorState().read(() => {
        updateLinkEditor();
      });
    };

    window.addEventListener("resize", update);

    if (scrollerElem) {
      scrollerElem.addEventListener("scroll", update);
    }

    return () => {
      window.removeEventListener("resize", update);

      if (scrollerElem) {
        scrollerElem.removeEventListener("scroll", update);
      }
    };
  }, [anchorElem.parentElement, editor, updateLinkEditor]);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateLinkEditor();
        });
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          updateLinkEditor();
          return true;
        },
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand(
        KEY_ESCAPE_COMMAND,
        () => {
          if (isLink) {
            setIsLink(false);
            return true;
          }
          return false;
        },
        COMMAND_PRIORITY_HIGH
      )
    );
  }, [editor, updateLinkEditor, setIsLink, isLink]);

  useEffect(() => {
    editor.getEditorState().read(() => {
      updateLinkEditor();
    });
  }, [editor, updateLinkEditor]);

  useEffect(() => {
    if (isLinkEditMode && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isLinkEditMode, isLink]);

  const monitorInputInteraction = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleLinkSubmission();
    } else if (event.key === "Escape") {
      event.preventDefault();
      console.log("2");
      setIsLinkEditMode(false);
    }
  };

  const handleLinkSubmission = () => {
    if (lastSelection !== null) {
      if (linkUrl !== "") {
        editor.dispatchCommand(TOGGLE_LINK_COMMAND, sanitizeUrl(editedLinkUrl));
        editor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            const parent = getSelectedNode(selection).getParent();
            if ($isAutoLinkNode(parent)) {
              const linkNode = $createLinkNode(parent.getURL(), {
                rel: parent.__rel,
                target: parent.__target,
                title: parent.__title,
              });
              parent.replace(linkNode, true);
            }
          }
        });
      }
      setEditedLinkUrl("https://");
      console.log("3");
      setIsLinkEditMode(false);
    }
  };

  return (
    <div ref={editorRef} className="link-editor">
      {!isLink ? null : isLinkEditMode ? (
        <>
          <input
            ref={inputRef}
            className="link-input"
            value={editedLinkUrl}
            onChange={(event) => {
              setEditedLinkUrl(event.target.value);
            }}
            onKeyDown={(event) => {
              monitorInputInteraction(event);
            }}
          />
          <div>
            <div
              className="link-cancel"
              role="button"
              tabIndex={0}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                console.log("4");
                setIsLinkEditMode(false);
              }}
            />

            <div
              className="link-confirm"
              role="button"
              tabIndex={0}
              onMouseDown={(event) => event.preventDefault()}
              onClick={handleLinkSubmission}
            />
          </div>
        </>
      ) : (
        <div className="link-view">
          <a
            href={sanitizeUrl(linkUrl)}
            target="_blank"
            rel="noopener noreferrer"
          >
            {linkUrl}
          </a>
          <div
            className="link-edit"
            role="button"
            tabIndex={0}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => {
              setEditedLinkUrl(linkUrl);
              setIsLinkEditMode(true);
            }}
          />
          <div
            className="link-trash"
            role="button"
            tabIndex={0}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => {
              editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
            }}
          />
        </div>
      )}
    </div>
  );
}

function useFloatingLinkEditorToolbar(
  editor,
  anchorElem,
  isLinkEditMode,
  setIsLinkEditMode
) {
  const [activeEditor, setActiveEditor] = useState(editor);
  const [isLink, setIsLink] = useState(false);

  useEffect(() => {
    function updateToolbar() {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const focusNode = getSelectedNode(selection);
        const focusLinkNode = $findMatchingParent(focusNode, $isLinkNode);
        const focusAutoLinkNode = $findMatchingParent(
          focusNode,
          $isAutoLinkNode
        );
        if (!(focusLinkNode || focusAutoLinkNode)) {
          setIsLink(false);
          return;
        }
        const badNode = selection.getNodes().find((node) => {
          const linkNode = $findMatchingParent(node, $isLinkNode);
          const autoLinkNode = $findMatchingParent(node, $isAutoLinkNode);
          return (
            !linkNode?.is(focusLinkNode) &&
            !autoLinkNode?.is(focusAutoLinkNode) &&
            !linkNode &&
            !autoLinkNode &&
            !$isLineBreakNode(node)
          );
        });
        if (!badNode) {
          setIsLink(true);
        } else {
          setIsLink(false);
        }
      }
    }
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateToolbar();
        });
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        (_payload, newEditor) => {
          updateToolbar();
          setActiveEditor(newEditor);
          return false;
        },
        COMMAND_PRIORITY_CRITICAL
      ),
      editor.registerCommand(
        CLICK_COMMAND,
        (payload) => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            const node = getSelectedNode(selection);
            const linkNode = $findMatchingParent(node, $isLinkNode);
            if ($isLinkNode(linkNode) && (payload.metaKey || payload.ctrlKey)) {
              window.open(linkNode.getURL(), "_blank");
              return true;
            }
          }
          return false;
        },
        COMMAND_PRIORITY_LOW
      )
    );
  }, [editor]);

  return createPortal(
    <FloatingLinkEditor
      editor={activeEditor}
      isLink={isLink}
      anchorElem={anchorElem}
      setIsLink={setIsLink}
      isLinkEditMode={isLinkEditMode}
      setIsLinkEditMode={setIsLinkEditMode}
    />,
    anchorElem
  );
}

export function FloatingLinkEditorPlugin({
  anchorElem = document.body,
  isLinkEditMode,
  setIsLinkEditMode,
}) {
  const [editor] = useLexicalComposerContext();
  return useFloatingLinkEditorToolbar(
    editor,
    anchorElem,
    isLinkEditMode,
    setIsLinkEditMode
  );
}

const Editor = ({ onChangeHandler }) => {
  const {
    settings: { isRichText },
  } = useSettings();
  const [floatingAnchorElem, setFloatingAnchorElem] = useState(null);
  const [isLinkEditMode, setIsLinkEditMode] = useState(false);

  const onRef = (_floatingAnchorElem) => {
    if (_floatingAnchorElem !== null) {
      setFloatingAnchorElem(_floatingAnchorElem);
    }
  };

  return (
    <LexicalComposer initialConfig={editorConfig}>
      <LecialMainWrapper>
        <ToolbarPlugin setIsLinkEditMode={setIsLinkEditMode} />
        <LecialInnerWrapper>
          <RichTextPlugin
            contentEditable={
              <div className="editor" ref={onRef}>
                <ContentEditable className="editor-input" />
              </div>
            }
            placeholder={<Placeholder />}
            ErrorBoundary={LexicalErrorBoundary}
          />
          {floatingAnchorElem && (
            <FloatingLinkEditorPlugin
              anchorElem={floatingAnchorElem}
              isLinkEditMode={isLinkEditMode}
              setIsLinkEditMode={setIsLinkEditMode}
            />
          )}
          <MarkdownShortcutPlugin />
          <OnChangePlugin
            onChange={(editorState, editor) => {
              editorState.read(() => {
                const html = $generateHtmlFromNodes(editor);
                onChangeHandler(html);
              });
            }}
          />
          <ActionsPlugin isRichText={isRichText} />
          <HistoryPlugin />
          <AutoFocusPlugin />
        </LecialInnerWrapper>
      </LecialMainWrapper>
      <div className="editor-container"></div>
    </LexicalComposer>
  );
};

export default Editor;
