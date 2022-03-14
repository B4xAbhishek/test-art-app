import { graphql } from "gatsby"; // withPrefix has been included for any media that needs to accessed from the data folder
import React, { useState, useRef, useEffect, useLayoutEffect } from "react";
import window from "global";
import {
  createElement,
  adjustElementCoordinates,
  cursorForPosition,
  resizedCoordinates,
  midPointBtw,
  getDistance,
  getElementAtPosition,
} from "../components/Element";
// import Menu from "../components/Menu";

// grab the data
export const query = graphql`
  query($slug: String!) {
    lesson(slug: { eq: $slug }) {
      slug
      title
      grade
      features
    }
  }
`;

const useHistory = initialState => {
  const [index, setIndex] = useState(0);
  const [history, setHistory] = useState([initialState]);

  const setState = (action, overwrite = false) => {
    const newState = typeof action === "function" ? action(history[index]) : action;
    if (overwrite) {
      const historyCopy = [...history];
      historyCopy[index] = newState;
      setHistory(historyCopy);
    } else {
      const updatedState = [...history].slice(0, index + 1);
      setHistory([...updatedState, newState]);
      setIndex(prevState => prevState + 1);
    }
  };

  const undo = () => index > 0 && setIndex(prevState => prevState - 1);
  const redo = () => index < history.length - 1 && setIndex(prevState => prevState + 1);

  return [history[index], setState, undo, redo];
};

const drawElement = (canvas, ctx, element, id, x1, y1, x2, y2) => {
  switch (element.type) {
    case "line":
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      break;
    case "rectangle":
      ctx.beginPath();
      ctx.rect(x1, y1, x2 - x1, y2 - y1);
      ctx.stroke();
      break;
    case "circle":
      const radius = getDistance(x1, y1, x2, y2);
      ctx.beginPath();
      ctx.arc(x1, y1, radius, 0, 2 * Math.PI)
      ctx.stroke(); 
      break;
    case "pencil":
      ctx.beginPath();
      ctx.lineTo(element.points.x, element.points.y);
      ctx.stroke();
      break;
    case "text":
      ctx.textBaseline = "top";
      ctx.font = "24px sans-serif";
      ctx.fillText(element.text, element.x1, element.y1);
      break;
    default:
      throw new Error(`Type not recognised: ${element.type}`);
  }
};

const adjustmentRequired = type => ["line", "circle"].includes(type);

const TemplatePage = ({ data }) => {
  // all data for this interactive
  const settings = data.lesson;

  const [state, setState] = useState({
    title: settings.title,
    grade: settings.grade,
    features: settings.features,
  });

  // FEATURE FLAGS
  // const canvasRef = useRef(null);
  // const ctxRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lineWidth, setLineWidth] = useState(5);
  const [lineColor, setLineColor] = useState("black");
  const [elements, setElements, undo, redo] = useHistory([]);
  const [action, setAction] = useState("none");
  const [tool, setTool] = useState("pencil");
  const [selectedElement, setSelectedElement] = useState(null);
  const textAreaRef = useRef();
  const [points, setPoints] = useState([]);
  const [path, setPath] = useState([]);

  useLayoutEffect(() => {
    // const canvas = canvasRef.current;
    const canvas = document.getElementById("myCanvas");
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    ctx.strokeStyle = lineColor;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    // ctxRef.current = ctx;

    ctx.save();

    const drawpath = () => {
      path.forEach((stroke, index) => {
        ctx.beginPath();

        stroke.forEach((point, i) => {
          ctx.strokeStyle = point.newColour;
          ctx.lineWidth = point.newLinewidth;

          var midPoint = midPointBtw(point.clientX, point.clientY);

          ctx.quadraticCurveTo(
            point.clientX,
            point.clientY,
            midPoint.x,
            midPoint.y
          );
          ctx.lineTo(point.clientX, point.clientY);
          ctx.stroke();
        });
        ctx.closePath();
        ctx.save();
      });
    };

    if (path !== undefined) drawpath();

    elements.forEach(element => {
      if (action === "writing" && selectedElement.id === element.id) return;
      drawElement(canvas, ctx, element, element.id, element.x1, element.y1, element.x2, element.y2);
    });

  }, [lineColor, lineWidth, elements, action, selectedElement, path]);

  useEffect(() => {
    const undoRedoFunction = event => {
      if ((event.metaKey || event.ctrlKey) && event.key === "z") {
        if (event.shiftKey) {
          redo();
        } else {
          undo();
        }
      }
    };

    document.addEventListener("keydown", undoRedoFunction);
    return () => {
      document.removeEventListener("keydown", undoRedoFunction);
    };
  }, [undo, redo]);

  useEffect(() => {
    const textArea = textAreaRef.current;
    if (action === "writing") {
      textArea.focus();
      textArea.value = selectedElement.text;
    }
  }, [action, selectedElement]);

  const updateElement = (id, x1, y1, x2, y2, type, options) => {
    const elementsCopy = [...elements];

    switch (type) {
      case "line":
      case "rectangle":
      case "circle":
        elementsCopy[id] = createElement(id, x1, y1, x2, y2, type);
        break;
      case "pencil":
        elementsCopy[id].points = [...elementsCopy[id].points, { x: x2, y: y2 }];
        break;
      case "text":
        const textWidth = document
          .getElementById("myCanvas")
          .getContext("2d")
          .measureText(options.text).width;
        const textHeight = 24;
        elementsCopy[id] = {
          ...createElement(id, x1, y1, x1 + textWidth, y1 + textHeight, type),
          text: options.text,
        };
        break;
      default:
        throw new Error(`Type not recognised: ${type}`);
    }

    setElements(elementsCopy, true);
  };

  const handleMouseDown = (e) => {
    const canvas = document.getElementById("myCanvas");
    const ctx = canvas.getContext("2d");

    setIsDrawing(true);
    const { clientX, clientY } = e;
    if (action === "writing") return;
    if (tool === "selection") {
      const element = getElementAtPosition(clientX, clientY, elements);
      if (element) {
        if (element.type === "pencil") {
          const xOffsets = element.points.map(point => clientX - point.x);
          const yOffsets = element.points.map(point => clientY - point.y);
          setSelectedElement({ ...element, xOffsets, yOffsets });
        } else {
          const offsetX = clientX - element.x1;
          const offsetY = clientY - element.y1;
          setSelectedElement({ ...element, offsetX, offsetY });
        }
        setElements(prevState => prevState);
        if (element.position === "inside") {
          setAction("moving");
        } else {
          setAction("resizing");
        }
      }
    } else {
      const id = elements.length;
      const element = createElement(id, clientX, clientY, clientX, clientY, tool);
      setElements(prevState => [...prevState, element]);
      setSelectedElement(element);
      setAction(tool === "text" ? "writing" : "drawing");}

      if (tool === "pencil") {
        setAction("sketching");

        const newEle = {
          clientX,
          clientY,
        };

        setPoints((state) => [...state, newEle]);

        ctx.strokeStyle = "black";
        ctx.lineWidth = 10;
        ctx.lineCap = 5;
        ctx.moveTo(clientX, clientY);
        ctx.beginPath();
        setIsDrawing(true);
    }
  }

  const handleMouseMove = (e) => {
    if (!isDrawing) return;

    const { clientX, clientY } = e;

    if (tool === "selection") {
      const element = getElementAtPosition(clientX, clientY, elements);
      e.target.style.cursor = element ? cursorForPosition(element.position) : "default";
    }

    if (action === "sketching") {
      if (!isDrawing) return;
      const colour = points[points.length - 1].newColour;
      const linewidth = points[points.length - 1].newLinewidth;
      const transparency = points[points.length - 1].transparency;
      const newEle = { clientX, clientY, colour, linewidth, transparency };

      setPoints((state) => [...state, newEle]);
      var midPoint = midPointBtw(clientX, clientY);
      const canvas = document.getElementById("myCanvas");
      const ctx = canvas.getContext("2d");
      ctx.quadraticCurveTo(clientX, clientY, midPoint.x, midPoint.y);
      ctx.lineTo(clientX, clientY);
      ctx.stroke();
    } 

    if (action === "drawing") {
      const index = elements.length - 1;
      const { x1, y1 } = elements[index];
      updateElement(index, x1, y1, clientX, clientY, tool);
    } else if (action === "moving") {
      if (selectedElement.type === "pencil") {
        const newPoints = selectedElement.points.map((_, index) => ({
          x: clientX - selectedElement.xOffsets[index],
          y: clientY - selectedElement.yOffsets[index],
        }));
        const elementsCopy = [...elements];
        elementsCopy[selectedElement.id] = {
          ...elementsCopy[selectedElement.id],
          points: newPoints,
        };
        setElements(elementsCopy, true);
      } else {
        const { id, x1, x2, y1, y2, type, offsetX, offsetY } = selectedElement;
        const width = x2 - x1;
        const height = y2 - y1;
        const newX1 = clientX - offsetX;
        const newY1 = clientY - offsetY;
        const options = type === "text" ? { text: selectedElement.text } : {};
        updateElement(id, newX1, newY1, newX1 + width, newY1 + height, type, options);
      }
    } else if (action === "resizing") {
      const { id, type, position, ...coordinates } = selectedElement;
      const { x1, y1, x2, y2 } = resizedCoordinates(clientX, clientY, position, coordinates);
      updateElement(id, x1, y1, x2, y2, type);
    }
  }

  const handleMouseUp = (e) => {
    const canvas = document.getElementById("myCanvas");
    const ctx = canvas.getContext("2d");
    ctx.closePath();
    setIsDrawing(false);

    const { clientX, clientY } = e;
    if (selectedElement) {
      if (
        selectedElement.type === "text" &&
        clientX - selectedElement.offsetX === selectedElement.x1 &&
        clientY - selectedElement.offsetY === selectedElement.y1
      ) {
        setAction("writing");
        return;
      }
      const index = selectedElement.id;
      const { id, type } = elements[index];
      if ((action === "drawing" || action === "resizing") && adjustmentRequired(type)) {
        const { x1, y1, x2, y2 } = adjustElementCoordinates(elements[index]);
        updateElement(id, x1, y1, x2, y2, type);
      } else if (action === "sketching") {
        ctx.closePath();
        const element = points;
        setPoints([]);
        setPath((prevState) => [...prevState, element]); //tuple
        setIsDrawing(false);
      }
      setAction("none");
    }

    if (action === "writing") return;

    setAction("none");
    setSelectedElement(null);
  }

  const handleBlur = (e) => {
    const { id, x1, y1, type } = selectedElement;
    setAction("none");
    setSelectedElement(null);
    updateElement(id, x1, y1, null, null, type, { text: e.target.value });
  };

  const eraser = (ctx) => ctx.globalCompositeOperation = "destination-out"

  const clear = () => {
    const canvas = document.getElementById("myCanvas");
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }

  const download = async () => {
    const canvas = document.getElementById("myCanvas");
   
    const image = canvas.toDataURL('image/png');
    const blob = await (await fetch(image)).blob();
    const blobURL = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobURL;
    link.download = "image.png";
    link.click();
  }

  const imageUpload = (e) => {
    const canvas = document.getElementById("myCanvas");
    const ctx = canvas.getContext("2d");

    if (e.target.files && e.target.files[0]) {
      var FR = new FileReader();
      FR.onload = function(e) {
        var img = new Image();
        img.src = e.target.result;
        img.onload = function() {
        ctx.drawImage(img, 0, 0);
        };   
      }
      FR.readAsDataURL(e.target.files[0]);
    }
  }

  const primaryColor = () => {
    const userPrimary = document.getElementById("userPrimary");
    const currentPrimary = userPrimary.value;

    if (currentPrimary) {
      setLineColor(currentPrimary);
    }
  }

  const secondaryColor = () => {
    const userSecondary = document.getElementById("userSecondary");
    const currentSecondary = userSecondary.value;

    if (currentSecondary) {
      setLineColor(currentSecondary);
    }
  }
 
  useEffect(() => {
    const canvas = document.getElementById("myCanvas");
    const ctx = canvas.getContext("2d");

    localStorage.setItem("myCanvas", canvas.toDataURL());
    const dataURL = localStorage.getItem(canvas);

    if (localStorage.getItem(dataURL)){ 
      var img = new Image();
      img.src = dataURL;
      img.onload = function(){
        ctx.drawImage(img, 0, 0);
      };
    } else {
      localStorage.setItem("myCanvas", canvas.toDataURL());
    }
  },[])

  return (
    <div className={`Main ${settings.slug}`}>
      {/* <h1>{state.title}</h1>
      <p>Grade: {state.grade}</p>
      <p>Features:</p>
      <ul>
        {state.features.map((feature) => (
          <li>{feature}</li>
        ))}
      </ul> */}
      {/* <Menu 
        setLineColor={setLineColor}
        setLineWidth={setLineWidth}
        download={download}
        clear={clear}
        eraser={eraser}
        pen={pen}
        imageUpload={imageUpload}
       /> */}
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
       {action === "writing" ? (
        <textarea
          ref={textAreaRef}
          onBlur={handleBlur}
          style={{
            position: "fixed",
            top: selectedElement.y1 - 2,
            left: selectedElement.x1,
            font: "24px sans-serif",
            margin: 0,
            padding: 0,
            border: 0,
            outline: 0,
            resize: "auto",
            overflow: "hidden",
            whiteSpace: "pre",
            background: "transparent",
          }}
        />
      ) : null}
       <canvas
          id="myCanvas"
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          // ref={canvasRef}
          width={window.innerWidth}
          height={window.innerHeight}
        />
      {/* <Workspace /> */}
    </div>
  );
};

export default TemplatePage;
