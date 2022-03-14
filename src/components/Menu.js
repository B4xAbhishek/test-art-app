import React, { useState } from "react";

const Menu = ({ setLineColor, setLineWidth, eraser, clear, download,
  imageUpload, tool, setTool, undo, redo, primaryColor, secondaryColor }) => {
  const [collapsed, setCollapsed] = useState(false);
  const collapseMenu = () => {
    setCollapsed(!collapsed);
  };

  return (
    <div className="menu">
      {!collapsed && (
           <div style={{position: "absolute"}}>
           <label>Brush Width</label>
           <input
             type="range"
             min="3"
             max="20"
             onChange={(e) => {
               setLineWidth(e.target.value);
             }}
           />
           <input 
             type="file" 
             onChange={imageUpload}
           />
           <label>More Color </label>
           <input
             type="color"
             onChange={(e) => {
               setLineColor(e.target.value);
             }}
           />
           <button onClick={primaryColor}>
             Primary Color
             <input
               id="userPrimary"
               type="color"
               onChange={(e) => {
                 const userInput = e.target.value;
                 setLineColor(userInput);
               }}
             />
           </button>
           <button onClick={secondaryColor}>
             Secondary Color
             <input
               id="userSecondary"
               type="color"
               onChange={(e) => {
                 const userInput = e.target.value;
                 setLineColor(userInput);
               }}
             />
           </button>
           <div className="palette">
             <button className="btn color-1" onClick={(e)=>{setLineColor("white")}}></button>
             <button className="btn color-2" onClick={(e)=>{setLineColor("purple")}}></button>
             <button className="btn color-3" onClick={(e)=>{setLineColor("pink")}}></button>
             <button className="btn color-4" onClick={(e)=>{setLineColor("red")}}></button>
             <button className="btn color-5" onClick={(e)=>{setLineColor("black")}}></button>
           </div>
         <button
           className="btn"
           type="radio"
           id="selection"
           checked={tool === "selection"}
           onClick={() => setTool("selection")}
         >Selection</button>
         <button className="btn" type="radio" id="line" checked={tool === "line"} onClick={() => setTool("line")}
         >Line</button>
         <button
           className="btn"
           type="radio"
           id="rectangle"
           checked={tool === "rectangle"}
           onClick={() => setTool("rectangle")}
         >Rectangle</button>
         <button
           className="btn"
           type="radio"
           id="circle"
           checked={tool === "circle"}
           onClick={() => setTool("circle")}
         >Circle</button>
         <button
           className="btn"
           type="radio"
           id="pencil"
           onClick={() => setTool("pencil")}
         >Pencil</button>
         <button className="btn" type="radio" id="text" checked={tool === "text"} onClick={() => setTool("text")} 
         >Text</button>
         <button className="btn" onClick={undo}>Undo</button>
         <button className="btn" onClick={redo}>Redo</button>
         <button className="btn" onClick={eraser}>Erase</button>
         <button className="btn" onClick={clear}>Clear</button>
         <button className="btn" onClick={download}>Download</button>
     </div>
      )}
      <button className="btn collapse" style={{position: "absolute"}}onClick={collapseMenu}>
        +
      </button>
    </div>
  );
};

export default Menu;
