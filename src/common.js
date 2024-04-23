import withStyles from "@material-ui/core/styles/withStyles";
import { CheckRounded, Edit } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import { useEffect, useState } from "react";

export const CustomLabelComp = withStyles({
  root: {
    display: "flex",
    width: "100%",
    alignItems: "center",
    padding: "0px 10px",
    justifyContent: "space-between",
  },
  actions: {
    display: "flex",
    marginLeft: "auto",
  },
  input: {
    width: "90%",
    display: "block !important",
  },
})(({ classes, name, isSelected, renameTheSection , nodes, setNodesValue}) => {
  const [renametoggle, setrenametoggle] = useState(Boolean(name));
  const [value, setValue] = useState("")
  return (
    <div className={`${classes.root} ${isSelected ? classes.selected : ""}`}>
      {renametoggle ? (
        `${name}`
      ) : (
        <input value={value} onChange={(e)=>setValue(e.target.value)} className={classes.input} />
      )}
      {!renametoggle ? (
        <IconButton
          disabled={!value}  
          onClick={(e) => {
            e.stopPropagation();
            console.log(renameTheSection(nodes,name, value))
            setrenametoggle(!renametoggle);
          }}
        >
          <CheckRounded />
        </IconButton>
      ) : (
        <IconButton
          onClick={(e) => {
            e.stopPropagation();
            setValue(name)
            setrenametoggle(!renametoggle);
          }}
        >
          <Edit />
        </IconButton>
      )}
    </div>
  );
});

export const CustomLabel = (label, isSelected, renameTheSection, nodes, setNodesValue) => {

  return (
    <div
      style={{
        backgroundColor: isSelected ? "#00000030" : "",
      }}
    >
      <CustomLabelComp name={label} isSelected={isSelected} renameTheSection={renameTheSection} nodes={nodes} setNodesValue={setNodesValue}/>{" "}
    </div>
  );
};
const empires = [
  {
    value: "favorite-empires",
    label: "Favorite Empires",
    children: [
      {
        value: "classical-era",
        label: "Classical Era",
        children: [
          {
            value: "persian",
            label: "First Persian Empire",
          },
          {
            value: "qin",
            label: "Qin Dynasty",
          },
          {
            value: "spqr",
            label: "Roman Empire",
          },
        ],
      },
      {
        value: "medieval-era",
        label: "Medieval Era",
        children: [
          {
            value: "abbasid",
            label: "Abbasid Caliphate",
          },
          {
            value: "byzantine",
            label: "Byzantine Empire",
          },
          {
            value: "holy-roman",
            label: "Holy Roman Empire",
          },
          {
            value: "ming",
            label: "Ming Dynasty",
          },
          {
            value: "mongol",
            label: "Mongol Empire",
          },
        ],
      },
      {
        value: "modern-era",
        label: "Modern Era",
        children: [
          {
            value: "aztec",
            label: "Aztec Empire",
          },
          {
            value: "british",
            label: "British Empire",
          },
          {
            value: "inca",
            label: "Inca Empire",
          },
          {
            value: "qing",
            label: "Qing Dynasty",
          },
          {
            value: "russian",
            label: "Russian Empire",
          },
          {
            value: "spanish",
            label: "Spanish Empire",
          },
        ],
      },
    ],
  },
];

export { empires };
