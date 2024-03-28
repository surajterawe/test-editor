/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $findMatchingParent,
  $getNearestNodeOfType,
  mergeRegister,
} from "@lexical/utils";
import {
  $getSelectionStyleValueForProperty,
  $patchStyleText,
  $setBlocksType,
} from "@lexical/selection";

import {
  $createParagraphNode,
  $getNodeByKey,
  $getSelection,
  $isRangeSelection,
  $isRootOrShadowRoot,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
  COMMAND_PRIORITY_NORMAL,
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
  KEY_MODIFIER_COMMAND,
  REDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  UNDO_COMMAND,
} from "lexical";

import { useCallback, useEffect, useRef, useState } from "react";
import * as React from "react";
import FontSize from "./fontSize";
import { $isLinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link";
import { sanitizeUrl } from "../utils/url";
import {
  $isListNode,
  INSERT_CHECK_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  ListNode,
} from "@lexical/list";
import { getSelectedNode } from "../utils/getSelectedNode";
import { $isTableNode } from "@lexical/table";
import {
  $createHeadingNode,
  $createQuoteNode,
  $isHeadingNode,
} from "@lexical/rich-text";
import {
  $createCodeNode,
  $isCodeNode,
  CODE_LANGUAGE_MAP,
  getLanguageFriendlyName,
} from "@lexical/code";

const LowPriority = 1;

function Divider() {
  return <div className="divider" />;
}

const FONT_FAMILY_OPTIONS = [
  ["Arial", "Arial"],
  ["Courier New", "Courier New"],
  ["Georgia", "Georgia"],
  ["Times New Roman", "Times New Roman"],
  ["Trebuchet MS", "Trebuchet MS"],
  ["Verdana", "Verdana"],
];

const blockTypeToBlockName = {
  bullet: "Bulleted List",
  check: "Check List",
  code: "Code Block",
  h1: "Heading 1",
  h2: "Heading 2",
  h3: "Heading 3",
  h4: "Heading 4",
  h5: "Heading 5",
  h6: "Heading 6",
  number: "Numbered List",
  paragraph: "Normal",
  quote: "Quote",
};

function FontDropDown({ editor, value, style, disabled = false }) {
  const handleClick = useCallback(
    (option) => {
      editor.update(() => {
        const selection = $getSelection();
        if (selection !== null) {
          $patchStyleText(selection, {
            [style]: option,
          });
        }
      });
    },
    [editor, style]
  );

  const buttonAriaLabel =
    style === "font-family"
      ? "Formatting options for font family"
      : "Formatting options for font size";

  function dropDownActiveClass(active) {
    if (active) {
      return "active dropdown-item-active";
    } else {
      return "";
    }
  }

  return (
    <select
      disabled={disabled}
      buttonClassName={"toolbar-item " + style}
      buttonLabel={value}
      onChange={(e) => {
        
        handleClick(e.target.value);
      }}
      buttonIconClassName={
        style === "font-family" ? "icon block-type font-family" : ""
      }
      buttonAriaLabel={buttonAriaLabel}
    >
      {FONT_FAMILY_OPTIONS.map(([option, text]) => (
        <option
          className={`item ${dropDownActiveClass(value === option)} ${
            style === "font-size" ? "fontsize-item" : ""
          }`}
          value={option}
          key={option}
        >
          <span className="text">{text}</span>
        </option>
      ))}
    </select>
  );
}

export const CODE_LANGUAGE_FRIENDLY_NAME_MAP = {
  c: "C",
  clike: "C-like",
  cpp: "C++",
  css: "CSS",
  html: "HTML",
  java: "Java",
  js: "JavaScript",
  markdown: "Markdown",
  objc: "Objective-C",
  plain: "Plain Text",
  py: "Python",
  rust: "Rust",
  sql: "SQL",
  swift: "Swift",
  typescript: "TypeScript",
  xml: "XML",
};

function getCodeLanguageOptions() {
  const options = [];

  for (const [lang, friendlyName] of Object.entries(
    CODE_LANGUAGE_FRIENDLY_NAME_MAP
  )) {
    options.push([lang, friendlyName]);
  }

  return options;
}

export const DEFAULT_CODE_LANGUAGE = "javascript";

export const getDefaultCodeLanguage = () => DEFAULT_CODE_LANGUAGE;

function BlockFormatDropDown({
  editor,
  blockType,
  rootType,
  disabled = false,
}) {
  const formatParagraph = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createParagraphNode());
      }
    });
  };

  const formatHeading = (headingSize) => {
    if (blockType !== headingSize) {
      editor.update(() => {
        const selection = $getSelection();
        $setBlocksType(selection, () => $createHeadingNode(headingSize));
      });
    }
  };

  const formatBulletList = () => {
     editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
  };

  const formatCheckList = () => {
      editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined);
   };

  const formatNumberedList = () => {
      editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
  };

  const formatQuote = () => {
      editor.update(() => {
        const selection = $getSelection();
        $setBlocksType(selection, () => $createQuoteNode());
      });
    
  };

  const formatCode = () => {
      editor.update(() => {
        let selection = $getSelection();

        if (selection !== null) {
          if (selection.isCollapsed()) {
            $setBlocksType(selection, () => $createCodeNode());
          } else {
            const textContent = selection.getTextContent();
            const codeNode = $createCodeNode();
            selection.insertNodes([codeNode]);
            selection = $getSelection();
            if ($isRangeSelection(selection)) {
              selection.insertRawText(textContent);
            }
          }
        }
      });
    
  };

  const blockTypeToBlockName = {
    code: "Code Block",
    h1: "Heading 1",
    h2: "Heading 2",
    h3: "Heading 3",
    h4: "Heading 4",
    h5: "Heading 5",
    h6: "Heading 6",
   
    paragraph: "Normal",
    quote: "Quote",
  };
  function dropDownActiveClass(active) {
    if (active) {
      return "active dropdown-item-active";
    } else {
      return "";
    }
  }

  const HandelChangeValue = (value) => {
    switch (value) {
      case "normal": {
        formatParagraph();
        break;
      }
      case "h1": {
        formatHeading("h1");
        break;
      }
      case "h2": {
        formatHeading("h2");
        break;
      }
      case "h3": {
        formatHeading("h3");
        break;
      }
      case "bulletList": {
        formatBulletList();
        break;
      }
      case "numberlist": {
        formatNumberedList();
        break;
      }
      case "checklist": {
        formatCheckList();
        break;
      }
      case "quote": {
        formatQuote();
        break;
      }
      case "codeBlock": {
        formatCode();
        break;
      }
      default: {
        break;
      }
    }
  };

  return (
    <select
      disabled={disabled}
      onChange={(e) => HandelChangeValue(e.target.value)}
      buttonClassName="toolbar-item block-controls"
      buttonIconClassName={"icon block-type " + blockType}
      buttonLabel={blockTypeToBlockName[blockType]}
      buttonAriaLabel="Formatting options for text style"
    >
      <option
        value={"normal"}
        className={"item " + dropDownActiveClass(blockType === "paragraph")}
      >
        <i className="icon paragraph" />
        <span className="text">Normal</span>
      </option>
      <option
        value={"h1"}
        className={"item " + dropDownActiveClass(blockType === "h1")}
      >
        <i className="icon h1" />
        <span className="text">Heading 1</span>
      </option>
      <option
        value={"h2"}
        className={"item " + dropDownActiveClass(blockType === "h2")}
      >
        <i className="icon h2" />
        <span className="text">Heading 2</span>
      </option>
      <option
        value={"h3"}
        className={"item " + dropDownActiveClass(blockType === "h3")}
      >
        <i className="icon h3" />
        <span className="text">Heading 3</span>
      </option>
      <option
        value={"quote"}
        className={"item " + dropDownActiveClass(blockType === "quote")}
      >
        <i className="icon quote" />
        <span className="text">Quote</span>
      </option>
      <option
        value={"codeBlock"}
        className={"item " + dropDownActiveClass(blockType === "code")}
      >
        <i className="icon code" />
        <span className="text">Code Block</span>
      </option>
    </select>
  );
}

export default function ToolbarPlugin({ setIsLinkEditMode }) {
    const [editor] = useLexicalComposerContext();
  const [activeEditor, setActiveEditor] = useState(editor);
  const [blockType, setBlockType] = useState("paragraph");
  const [alignment, setAlignment] = useState("left");
  const CODE_LANGUAGE_OPTIONS = getCodeLanguageOptions();
  const [rootType, setRootType] = useState("root");
  const [selectedElementKey, setSelectedElementKey] = useState(null);
  const [fontSize, setFontSize] = useState("15px");

  const [fontFamily, setFontFamily] = useState("Arial");
  const toolbarRef = useRef(null);
  const [isLink, setIsLink] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [codeLanguage, setCodeLanguage] = useState("");
  const [isEditable, setIsEditable] = useState(() => editor.isEditable());

  


  const $updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const anchorNode = selection.anchor.getNode();
      let element =
        anchorNode.getKey() === "root"
          ? anchorNode
          : $findMatchingParent(anchorNode, (e) => {
              const parent = e.getParent();
              return parent !== null && $isRootOrShadowRoot(parent);
            });

      if (element === null) {
        element = anchorNode.getTopLevelElementOrThrow();
      }

      const elementKey = element.getKey();
      const elementDOM = activeEditor.getElementByKey(elementKey);

      // Update text format
      setIsBold(selection.hasFormat("bold"));
      setIsItalic(selection.hasFormat("italic"));
      setIsUnderline(selection.hasFormat("underline"));
      setIsStrikethrough(selection.hasFormat("strikethrough"));

      // Update links
      const node = getSelectedNode(selection);
      const parent = node.getParent();
      if ($isLinkNode(parent) || $isLinkNode(node)) {
        setIsLink(true);
      } else {
        setIsLink(false);
      }

      const tableNode = $findMatchingParent(node, $isTableNode);
      if ($isTableNode(tableNode)) {
        setRootType("table");
      } else {
        setRootType("root");
      }

      if (elementDOM !== null) {
        setSelectedElementKey(elementKey);
        if ($isListNode(element)) {
          const parentList = $getNearestNodeOfType(anchorNode, ListNode);

          const type = parentList
            ? parentList.getListType()
            : element.getListType();
          console.log(type);
          setBlockType(type);
        } else {
          const type = $isHeadingNode(element)
            ? element.getTag()
            : element.getType();

          console.log(type);

          if (type in blockTypeToBlockName) {
            setBlockType(type);
          }
          if ($isCodeNode(element)) {
            const language = element.getLanguage();
            setCodeLanguage(
              language ? CODE_LANGUAGE_MAP[language] || language : ""
            );
            return;
          }
        }
      }
      // Handle buttons
      setFontSize(
        $getSelectionStyleValueForProperty(selection, "font-size", "15px")
      );

      setFontFamily(
        $getSelectionStyleValueForProperty(selection, "font-family", "Arial")
      );
     

    }
  }, [activeEditor]);

  useEffect(() => {
    return activeEditor.registerCommand(
      KEY_MODIFIER_COMMAND,
      (payload) => {
        const event = payload;
        const { code, ctrlKey, metaKey } = event;

        if (code === "KeyK" && (ctrlKey || metaKey)) {
          event.preventDefault();
          let url;
          if (!isLink) {
            setIsLinkEditMode(true);
            url = sanitizeUrl("https://");
          } else {
            setIsLinkEditMode(false);
            url = null;
          }
          return activeEditor.dispatchCommand(TOGGLE_LINK_COMMAND, url);
        }
        return false;
      },
      COMMAND_PRIORITY_NORMAL
    );
  }, [activeEditor, isLink, setIsLinkEditMode]);

  useEffect(() => {
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      (_payload, newEditor) => {
        $updateToolbar();
        setActiveEditor(newEditor);
        return false;
      },
      COMMAND_PRIORITY_CRITICAL
    );
  }, [editor, $updateToolbar]);

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      // Update text format
      editor.registerEditableListener((editable) => {
        setIsEditable(editable);
      });

      setFontFamily(
        $getSelectionStyleValueForProperty(selection, "font-family", "Arial")
      );

      setFontSize(
        $getSelectionStyleValueForProperty(selection, "font-size", "15px")
      );
      setIsBold(selection.hasFormat("bold"));
      setIsItalic(selection.hasFormat("italic"));
      setIsUnderline(selection.hasFormat("underline"));

      setIsStrikethrough(selection.hasFormat("strikethrough"));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
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
          return false;
        },
        LowPriority
      ),
      editor.registerCommand(
        CAN_UNDO_COMMAND,
        (payload) => {
          setCanUndo(payload);
          return false;
        },
        LowPriority
      ),
      editor.registerCommand(
        CAN_REDO_COMMAND,
        (payload) => {
          setCanRedo(payload);
          return false;
        },
        LowPriority
      )
    );
  }, [editor, updateToolbar]);

  function dropDownActiveClass(active) {
    if (active) {
      return "active dropdown-item-active";
    } else {
      return "";
    }
  }

  const onCodeLanguageSelect = useCallback(
    (value) => {
      activeEditor.update(() => {
        if (selectedElementKey !== null) {
          const node = $getNodeByKey(selectedElementKey);
          if ($isCodeNode(node)) {
            node.setLanguage(value);
          }
        }
      });
    },
    [activeEditor, selectedElementKey]
  );

  return (
    <div className="toolbar" ref={toolbarRef}>
      {blockType in blockTypeToBlockName && activeEditor === editor && (
        <>
          <BlockFormatDropDown
            disabled={!isEditable}
            blockType={blockType}
            rootType={rootType}
            editor={editor}
          />
          <Divider />
        </>
      )}
      {blockType === "code" ? (
        <select
          disabled={!isEditable}
          buttonClassName="toolbar-item code-language"
          buttonLabel={getLanguageFriendlyName(codeLanguage)}
          buttonAriaLabel="Select language"
        >
          {CODE_LANGUAGE_OPTIONS.map(([value, name]) => {
            return (
              <option
                className={`item ${dropDownActiveClass(
                  value === codeLanguage
                )}`}
                onClick={() => onCodeLanguageSelect(value)}
                key={value}
              >
                <span className="text">{name}</span>
              </option>
            );
          })}
        </select>
      ) : (
        <React.Fragment>
          <button
            disabled={!canUndo}
            onClick={() => {
              editor.dispatchCommand(UNDO_COMMAND, undefined);
            }}
            className="toolbar-item spaced"
            aria-label="Undo"
          >
            <i className="format undo" />
          </button>
          <button
            disabled={!canRedo}
            onClick={() => {
              editor.dispatchCommand(REDO_COMMAND, undefined);
            }}
            className="toolbar-item"
            aria-label="Redo"
          >
            <i className="format redo" />
          </button>
          <Divider />
          <FontDropDown
            disabled={!isEditable}
            value={fontFamily}
            editor={editor}
          />
          <Divider />
          {/* Font size input */}
          <FontSize
            selectionFontSize={fontSize.slice(0, -2)}
            editor={editor}
            disabled={!isEditable}
          />
          <Divider />
          <button
            onClick={() => {
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
            }}
            className={"toolbar-item spaced " + (isBold ? "active" : "")}
            aria-label="Format Bold"
          >
            <i className="format bold" />
          </button>
          <button
            onClick={() => {
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic");
            }}
            className={"toolbar-item spaced " + (isItalic ? "active" : "")}
            aria-label="Format Italics"
          >
            <i className="format italic" />
          </button>
          <button
            onClick={() => {
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline");
            }}
            className={"toolbar-item spaced " + (isUnderline ? "active" : "")}
            aria-label="Format Underline"
          >
            <i className="format underline" />
          </button>
          <button
            onClick={() => {
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough");
            }}
            className={
              "toolbar-item spaced " + (isStrikethrough ? "active" : "")
            }
            aria-label="Format Strikethrough"
          >
            <i className="format strikethrough" />
          </button>
          <Divider />
          <button
            onClick={() => {
              setAlignment("left");
              editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "left");
            }}
            className={
              "toolbar-item spaced " + (alignment === "left" ? "active" : "")
            }
            aria-label="Left Align"
          >
            <i className="format left-align" />
          </button>
          <button
            onClick={() => {
              setAlignment("center");
              editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "center");
            }}
            className={
              "toolbar-item spaced " + (alignment === "center" ? "active" : "")
            }
            aria-label="Center Align"
          >
            <i className="format center-align" />
          </button>
          <button
            onClick={() => {
              setAlignment("right");
              editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "right");
            }}
            className={
              "toolbar-item spaced " + (alignment === "right" ? "active" : "")
            }
            aria-label="Right Align"
          >
            <i className="format right-align" />
          </button>
          <button
            onClick={() => {
              setAlignment("justify");
              editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "justify");
            }}
            className={
              "toolbar-item " + (alignment === "justify" ? "active" : "")
            }
            aria-label="Justify Align"
          >
            <i className="format justify-align" />
          </button>{" "}
        </React.Fragment>
      )}
    </div>
  );
}
