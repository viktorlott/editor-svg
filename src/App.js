import React, { useEffect, useRef, useState, useCallback, useContext, useMemo, createContext, useReducer, } from 'react'
import Konva from 'konva';
import 'antd/dist/antd.css'
import './App.css'
import Structure from './components/Structure'
import KonvaContext from './context/konvacontext'

// {"attrs":{"stroke":"green","strokeWidth":10,"lineJoin":"round","lineCap":"round","points":[{"x":50,"y":140},{"x":450,"y":160}],"shadowColor":"black","shadowBlur":10,"shadowOffsetX":5,"shadowOffsetY":5,"shadowOpacity":0.5},"className":"Line"} {"attrs":{"x":100,"y":41,"width":106,"height":118,"id":"yodaImage"},"className":"Image"}
// "stroke":"red","strokeWidth":2,"shadowColor":"black","shadowBlur":2,"shadowOffsetX":10,"shadowOffsetY":10,"shadowOpacity":0.5
// "shadowBlur":10,"shadowOffsetX":5,"shadowOffsetY":5,"shadowOpacity":0.5,

let json = {"attrs":{"width":794, "height":150},"className":"Stage","children":[{"attrs":{  },"className":"Layer","children":[{"attrs":{"fill":"#ffffff","stroke":"#000000","name":"object","x":197.99999999999991,"y":46,"width":103.99999999999994,"height":64.99999999999999,"draggable":true,"id":"5b2i28lei6t", "strokeWidth": 1 },"className":"Rect"},{"attrs":{"strokeWidth": 1,"fill":"#ffffff","stroke":"#000000","name":"object","x":602,"y":38.999999999999986,"width":115,"height":72,"draggable":true,"id":"h8bk9w6pvl"},"className":"Rect"},{"attrs":{"rotateEnabled":false,"anchorCornerRadius":7,"anchorSize":7,"rotationSnaps":[0,90,180,270],"borderStroke":"#0099ff","rotateAnchorOffset":30,"ignoreStroke":true,"strokeScaleEnabled":true,"name":"object_transformer","id":"5b2i28lei6t_transformer","padding":1,"x":194.99999999999991,"y":49},"className":"Transformer"},{"attrs":{"resizeEnabled":false,"rotateEnabled":false,"anchorCornerRadius":7,"anchorSize":7,"rotationSnaps":[0,90,180,270],"borderStroke":"transparent","rotateAnchorOffset":30,"ignoreStroke":true,"strokeScaleEnabled":true,"name":"object_transformer","id":"h8bk9w6pvl_transformer","padding":1,"x":605,"y":34},"className":"Transformer"}]}]}
// {"attrs":{"width":794,"height":1123},"className":"Stage","children":[{"attrs":{},"className":"Layer","children":[] }]}


function DrawBoard() {
  return <Structure {...json}/>
}



const defaultStore = {
  selected: null,
  mode: "HAND"
}

function reducer(state=defaultStore, action) {
  switch(action.type) {
    case "SELECT": 
      if(state.selected == action.payload.selected) return state
      return Object.assign({}, state, { selected: action.payload.selected ? action.payload.selected : null})
    case "MODE": 
      if(state.mode == action.payload.mode) return state
      return Object.assign({}, state, { mode: action.payload.mode ? action.payload.mode : null})
    default: 
      return state
  }
}

function App() {
  const [store, dispatch] = useReducer(reducer, defaultStore)
  
  const setSelected = useCallback((selection) => {
    dispatch({ type: "SELECT", payload: { selected: selection }})
  }, [])


  const setMode = useCallback((mode) => {
    dispatch({ type: "MODE", payload: { mode }})
  }, [])


  return (
  <KonvaContext.Provider value={{ store, setSelected, setMode }}>

      <DrawBoard/>
    
  </KonvaContext.Provider>
  );
}

export default App;

