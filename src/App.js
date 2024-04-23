import FolderTree from "react-folder-tree";
import "react-folder-tree/dist/style.css";
import Editor from "@monaco-editor/react";
import { useEffect, useRef, useState } from "react";

const language = {
  html: "html",
  js: "javascript",
  css: "css",
  json: "json",
};

const initialState = {
  name: "my-app",
  checked: 0.5, // half check: some children are checked
  isOpen: true, // this folder is opened, we can see it's children
  children: [
        { name: "index.html", checked: 0 }
  ],
};

export default function App() {
  const [files, setFiles] = useState(null);
  const editorRef = useRef(null);
  const [clicked, setClicked] = useState("");

  useEffect(() => {
    editorRef.current?.focus();
  }, [clicked]);
  const [treeState, setTreeState] = useState(initialState);
  const onTreeStateChange = (state, event) => setTreeState(state);

  const folderIcon = ({ onClick: defaultOnClick, nodeData }) => {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        fill="currentColor"
        class="bi bi-folder2-open"
        viewBox="0 0 16 16"
      >
        <path d="M1 3.5A1.5 1.5 0 0 1 2.5 2h2.764c.958 0 1.76.56 2.311 1.184C7.985 3.648 8.48 4 9 4h4.5A1.5 1.5 0 0 1 15 5.5v.64c.57.265.94.876.856 1.546l-.64 5.124A2.5 2.5 0 0 1 12.733 15H3.266a2.5 2.5 0 0 1-2.481-2.19l-.64-5.124A1.5 1.5 0 0 1 1 6.14V3.5zM2 6h12v-.5a.5.5 0 0 0-.5-.5H9c-.964 0-1.71-.629-2.174-1.154C6.374 3.334 5.82 3 5.264 3H2.5a.5.5 0 0 0-.5.5V6zm-.367 1a.5.5 0 0 0-.496.562l.64 5.124A1.5 1.5 0 0 0 3.266 14h9.468a1.5 1.5 0 0 0 1.489-1.314l.64-5.124A.5.5 0 0 0 14.367 7H1.633z" />
      </svg>
    );
  };

  const editIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      fill="currentColor"
      class="bi bi-folder2-open"
      viewBox="0 0 16 16"
    >
      <path d="M1 3.5A1.5 1.5 0 0 1 2.5 2h2.764c.958 0 1.76.56 2.311 1.184C7.985 3.648 8.48 4 9 4h4.5A1.5 1.5 0 0 1 15 5.5v.64c.57.265.94.876.856 1.546l-.64 5.124A2.5 2.5 0 0 1 12.733 15H3.266a2.5 2.5 0 0 1-2.481-2.19l-.64-5.124A1.5 1.5 0 0 1 1 6.14V3.5zM2 6h12v-.5a.5.5 0 0 0-.5-.5H9c-.964 0-1.71-.629-2.174-1.154C6.374 3.334 5.82 3 5.264 3H2.5a.5.5 0 0 0-.5.5V6zm-.367 1a.5.5 0 0 0-.496.562l.64 5.124A1.5 1.5 0 0 0 3.266 14h9.468a1.5 1.5 0 0 0 1.489-1.314l.64-5.124A.5.5 0 0 0 14.367 7H1.633z" />
    </svg>
  );

  const getPathFromIndices = (obj, indices) => {
    let path = obj.name;

    if (indices.length >= 1) {
      const childIdx = indices[0];
      if (obj.children && obj.children[childIdx]) {
        path += `/${obj.children[childIdx].name}`;

        if (indices.length >= 2) {
          const grandChildIdx = indices[1];
          if (
            obj.children[childIdx].children &&
            obj.children[childIdx].children[grandChildIdx]
          ) {
            path += `/${obj.children[childIdx].children[grandChildIdx].name}`;
          } else {
            console.error("Invalid path");
            return "";
          }
        }
      } else {
        console.error("Invalid path");
        return "";
      }
    }

    return path;
  };

  const onNameClick = ({ defaultOnClick, nodeData }) => {
    defaultOnClick();

    const {
      // internal data
      path,
      isOpen,
    } = nodeData;
    if (isOpen !== true && isOpen !== false) {
      const location = getPathFromIndices(treeState, path);
      const FileName = location.split("/")[location.split("/").length - 1];
      // if(files.findIndex(item => item.name === location) === -1){
      const extention = FileName?.split(".")[1];
      setClicked(location)
      setFiles({
        name: location,
        language: language[extention?.toLowerCase()] || "",
        value: "",
      });
      // }
    }
  };

  return (
    <div style={{ display: "flex" }}>
      <div style={{ width: "15%" }}>
      <FolderTree
        data={initialState}
        initCheckedStatus='checked'  // default: 0 [unchecked]
        initOpenStatus='custom'     // default: 'open'
        onChange={onTreeStateChange}
        onNameClick={onNameClick}
        showCheckbox={false} // default: true
        iconComponents={{ folderIcon: folderIcon, editIcon: editIcon }}
      />
        </div>
       <div style={{ width: "85%", marginLeft: "auto" }}>
        {clicked && (
             <div>
                <h3>{clicked}</h3>
             </div>
        )}
      {files && (
        <Editor
          height="80vh"
          theme="vs-dark"
          path={files.name}
          defaultLanguage={files.language}
          defaultValue={files.value}
          onMount={(editor) => (editorRef.current = editor)}
        />
      )}
      </div>
    </div>
  );
}
