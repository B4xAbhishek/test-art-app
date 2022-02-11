import React, { useState } from "react";

const Menu = ({ setLineColor, setLineWidth }) => {

  return (
    <div className="menu">
          <label>Brush Width</label>
          <input
            type="range"
            min="3"
            max="20"
            onChange={(e) => {
              setLineWidth(e.target.value);
            }}
          />
          <label>Brush Color </label>
          <input
            type="color"
            onChange={(e) => {
              setLineColor(e.target.value);
            }}
          />
          <div className="palette">
            <button className="btn color-1" onClick={(e)=>{setLineColor("white")}}></button>
            <button className="btn color-2" onClick={(e)=>{setLineColor("purple")}}></button>
            <button className="btn color-3" onClick={(e)=>{setLineColor("pink")}}></button>
            <button className="btn color-4" onClick={(e)=>{setLineColor("red")}}></button>
            <button className="btn color-5" onClick={(e)=>{setLineColor("black")}}></button>
          </div>
    </div>
  );
};

export default Menu;
