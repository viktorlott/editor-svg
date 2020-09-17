import React, { useEffect, useRef, useState, useCallback, useContext, useMemo, createContext, useReducer, } from 'react'
import Konva from 'konva';
import useTransformer from '../hooks/useTransformer'
import getDragDirection from '../utils/getDragDirection'
import KonvaContext from '../context/konvacontext'
import Structure from './Structure'


// were can we snap our objects?
function getLineGuideStops(skipShape, stage) {
  // we can snap to stage borders and the center of the stage
  let vertical = [0, stage.width() / 2, stage.width()]
  let horizontal = [0, stage.height() / 2, stage.height()]

  // and we snap over edges and center of each object on the canvas
  stage.find('.object').forEach((guideItem) => {

    if (guideItem === skipShape) {
      return
    }

    let box = guideItem.getClientRect()
    // and we can snap to all edges of shapes
    vertical.push([box.x, box.x + box.width, box.x + box.width / 2])
    horizontal.push([box.y, box.y + box.height, box.y + box.height / 2])
  })

  return {
    vertical: vertical.flat(),
    horizontal: horizontal.flat(),
  }
}


function getObjectSnappingEdges(node) {

  let box = node.getClientRect()
  return {
    vertical: [
      {
        guide: Math.round(box.x),
        offset: Math.round(node.x() - box.x),
        snap: 'start',
        box,
      },
      {
        guide: Math.round(box.x + box.width / 2),
        offset: Math.round(node.x() - box.x - box.width / 2),
        snap: 'center',
        box,
      },
      {
        guide: Math.round(box.x + box.width),
        offset: Math.round(node.x() - box.x - box.width),
        snap: 'end',
        box,
      },
    ],
    horizontal: [
      {
        guide: Math.round(box.y),
        offset: Math.round(node.y() - box.y),
        snap: 'start',
        box,
      },
      {
        guide: Math.round(box.y + box.height / 2),
        offset: Math.round(node.y() - box.y - box.height / 2),
        snap: 'center',
        box,
      },
      {
        guide: Math.round(box.y + box.height),
        offset: Math.round(node.y() - box.y - box.height),
        snap: 'end',
        box,
      },
    ],
  }
}

// find all snapping possibilities
function getGuides(lineGuideStops, itemBounds) {
  let resultV = []
  let resultH = []

  lineGuideStops.vertical.forEach((lineGuide, i) => {
    itemBounds.vertical.forEach((itemBound) => {
      let diff = Math.abs(lineGuide - itemBound.guide)

      if (diff < 5) {
        resultV.push({
          lineGuide: lineGuide,
          diff: diff,
          snap: itemBound.snap,
          offset: itemBound.offset,
          box: itemBound.box,
          other: lineGuideStops,
          itemBound

        })
      }
    })
  })

  lineGuideStops.horizontal.forEach((lineGuide) => {
    itemBounds.horizontal.forEach((itemBound) => {
      let diff = Math.abs(lineGuide - itemBound.guide)

      if (diff < 5) {
        resultH.push({
          lineGuide: lineGuide,
          diff: diff,
          snap: itemBound.snap,
          offset: itemBound.offset,
          box: itemBound.box,
          other: lineGuideStops,
          itemBound
        })
      }
    })
  })

  let guides = []


  let v = resultV.filter(e => e.diff <= 3).sort((a, b) => a.diff - b.diff)
  let minV = v[0]
  
  let h = resultH.filter(e => e.diff <= 3).sort((a, b) => a.diff - b.diff)   
  let minH = h[0]
  
  if (minV) {

    guides.push({
      lineGuide: minV.lineGuide,
      offset: minV.offset,
      orientation: 'V',
      diff: minV.diff,
      snap: minV.snap,
      box: minV.box,
      other: minV.other,
      itemBound: minV.itemBound,
      disabled: false
    })
  }
  
  if (minH) {
    guides.push({
      lineGuide: minH.lineGuide,
      offset: minH.offset,
      orientation: 'H',
      snap: minH.snap,
      diff: minH.diff,
      box: minH.box,
      other: minH.other,
      itemBound: minH.itemBound,
      disabled: false
    })
  }


  return guides
}


function Rect(props) {
    const { attrs, layer, stage } = props
  
    const rect = useMemo(() => new Konva.Rect(attrs), [])
  
    useTransformer(rect, layer, stage, { 
      name: attrs.name + "_transformer",
     })
    
  

    
  
    useEffect(() => {     
      
      
      rect.on("transform", () => {
        // console.log(rect.attrs)
      })
      
      return () => {
        layer.remove(rect)
      }
    },[])
  
  
  
  
  
    if(!props.children || !Array.isArray(props.children)) return null
  
    return props.children.map(struct => {
      return <Structure {...struct} />
    })
  
  }

  
  export default Rect