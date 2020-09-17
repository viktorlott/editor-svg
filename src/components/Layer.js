import React, { useEffect, useRef, useState, useCallback, useContext, useMemo, createContext, useReducer, } from 'react'
import Konva from 'konva'
import useTransformer from '../hooks/useTransformer'
import getDragDirection from '../utils/getDragDirection'
import KonvaContext from '../context/konvacontext'
import Structure from './Structure'
import DrawShape from './DrawShape'

function smallestDistance(a, b) {
  try {
    return  a.delta <= b.delta ? a : b
  } catch(err) {
    console.log(a, b, err)
    return a
  }
}

function getBoundingBoxes(node) {
  const rect = node
  const x = rect.x
  const y = rect.y
  const xWidth = x + rect.width
  const yHeight = y + rect.height
   
  return { 
    ...rect,
    x, 
    y, 
    xWidth, 
    yHeight
  }
}

function isOnLeftSide(dbox, obox, margin) {

 /** 
   *0,0____________________________________X
   * |                
   * |                
   * |                               
   * |               
   * |           ____         ____   
   * |          |obox|       |dbox|
   * |          |____|       |____|
   * |               
   * |               
   * |               
   * |               
   * Y
   */
  if(dbox.x >= obox.xWidth - margin && (
      (dbox.y >= obox.y) &&
      (dbox.y <= obox.yHeight + margin) || 
      (obox.y - margin <= dbox.yHeight && obox.yHeight >= dbox.yHeight) ||
      (obox.y >= dbox.y && obox.yHeight <= dbox.yHeight)
    )) {
      return true
  } else {
    return false
  }
}

function isOnRightSide(dbox, obox, margin) {

 /** 
   *0,0____________________________________X
   * |
   * |                       |
   * |                       |
   * |           ____        |____   
   * |          |dbox|       |obox|
   * |          |____|       |____|
   * |                       |
   * |                       |  
   * |                       |  
   * |                       | dbox.xWidth <= obox.x + (margin is used to contract the Y line that detects objects and classifies them as "objects to the right side of dragging object")
   * |                  
   * |                  
   * Y
   */
  if(dbox.xWidth <= obox.x + margin && (
      (dbox.y >= obox.y) &&
      (dbox.y <= obox.yHeight + margin) || 
      (obox.y - margin <= dbox.yHeight && obox.yHeight >= dbox.yHeight) ||
      (obox.y >= dbox.y && obox.yHeight <= dbox.yHeight)
    )) {
      return true
  } else {
    return false
  }
}

function isOnTopSide(dbox, obox, margin) {

 /**
   *0,0____________________________________X
   * |
   * |           ____
   * |          |obox|
   * | _ _ _ _ _|____|_ _ _ _ _ dbox.y >= obox.yHeight - (margin is used to contract the Y line that detects objects and classifies them as "objects above dragging object")
   * |       
   * |
   * |           ____
   * |          |dbox|
   * |          |____|
   * |
   * |
   * |
   * Y
   */
  if(dbox.y >= obox.yHeight - margin && (
    (dbox.x >= obox.x && dbox.x <= obox.xWidth + margin) || 
    (obox.x - margin <= dbox.xWidth && obox.xWidth >= dbox.xWidth) || 
    (obox.x >= dbox.x && obox.xWidth <= dbox.xWidth)
  )) {
      return true
  } else {
    return false
  }
}

function isOnBottomSide(dbox, obox, margin) {


 /**
  *  
   *0,0____________________________________X
   * |
   * |           ____
   * |          |dbox|
   * |          |____|
   * |       
   * |
   * | _ _ _ _ _ ____ _ _ _ _ _ dbox.yHeight <= obox.y + (margin is used to extend the Y line that detects objects and classifies them as "objects below dragging object")
   * |          |obox|
   * |          |____|
   * |
   * |
   * |
   * Y
   */
  if(dbox.yHeight <= obox.y + margin && (
    (dbox.x >= obox.x && dbox.x <= obox.xWidth + margin) || 
    (obox.x - margin <= dbox.xWidth && obox.xWidth >= dbox.xWidth) || 
    (obox.x >= dbox.x && obox.xWidth <= dbox.xWidth)
  )) {
    return true
  } else {
    return false
  }
}





function getRelativeDistances(node, stage, guides) {
  const relatives = stage.find('.object').reduce((distances, object, i, objects) => {
    const nodeRect = node.getClientRect()
    const objectRect = object.getClientRect()

    let margin = 5 
 
    if(isOnLeftSide(getBoundingBoxes(nodeRect), getBoundingBoxes(objectRect), margin)) {
      const item = { side: "l", ...objectRect, delta: Math.abs(nodeRect.x + nodeRect.width - objectRect.x) }
      if(!distances["l"]) {
        distances["l"] = item
      } else {

        distances["l"] = smallestDistance(distances["l"], item)
      }

    } else if(isOnRightSide(getBoundingBoxes(nodeRect), getBoundingBoxes(objectRect), margin)) {
      const item = { side: "r", ...objectRect, delta: Math.abs(nodeRect.x + nodeRect.width - objectRect.x)}
      

      if(!distances["r"]) {
        distances["r"] = item
      } else {
        distances["r"] = smallestDistance(distances["r"], item)
      }
    } else if(isOnTopSide(getBoundingBoxes(nodeRect), getBoundingBoxes(objectRect), margin)) {
      const item = { side: "t", ...objectRect, delta: Math.abs(objectRect.y + objectRect.height - nodeRect.y)}
      if(!distances["t"]) {
        distances["t"] = item
      } else {
        distances["t"] = smallestDistance(distances["t"], item)
      }

    } else if(isOnBottomSide(getBoundingBoxes(nodeRect), getBoundingBoxes(objectRect), margin)) {
      const item = { side: "b", ...objectRect, delta: Math.abs(nodeRect.y + nodeRect.height - objectRect.y)}
      if(!distances["b"]) {
        distances["b"] = item
      } else {
        distances["b"] = smallestDistance(distances["b"], item)
      }

    }

    return distances
  }, {})

  return relatives
}

function createDistanceGuideLine({orientation, x1, y1, x2, y2, lineColor, wallSize, alignOffset, textOffset, delta}) {
  let line = new Konva.Line({
    points: [x1, y1, x2, y2],
    stroke: lineColor,
    strokeWidth: 1,
    name: 'relative-guid-line',
  })

  let wallLeft = new Konva.Line({
    points: [x1, y1 + wallSize, x1, y1 - wallSize],
    stroke: lineColor,
    strokeWidth: 1,
    name: 'relative-guid-line',
  })

  let wallRight = new Konva.Line({
    points: [x2 , y2 + wallSize, x2, y2 - wallSize ],
    stroke: lineColor,
    strokeWidth: 1,
    name: 'relative-guid-line',
  })


  let text = new Konva.Text({
    fill: lineColor,
    fontSize: 10,
    name: 'relative-guid-line',
    text: Math.round(delta)
  })

  if(orientation === "H") {
    text.x((x1) + (line.width() / 2) - text.width() / 2)
    text.y(y2 + alignOffset + textOffset)
  } else if(orientation === "V") {
    text.y((y1) + (line.height() / 2) - text.height() / 2)
    text.x(x2 + alignOffset + textOffset)
  }

  return [line, wallLeft, wallRight, text]
}


// #ff4bc8
function drawRelativeGuideLines(relatives, node, layer, guides, lg) {
  const nodeRect = node.getClientRect()
  
  layer.find('.relative-guid-line').destroy()

  let offsetEvent = 0
  let minDelta = 5
  let lineColor = '#ff26a9'
  let wallSize = 0
  let alignOffset = 0
  let textOffset = 4
  let LineSpace = 0


  let horizontal = []
  let vertical = []


  Object.values(relatives).forEach((relative) => {

    
    if (relative.side === 'l') {

      if(!guides.some(e => e.orientation === "H")) return

      const objectRightSideX = relative.x + relative.width + LineSpace
      const centerLineY = lg.lineGuide
      const nodeLeftSideX = nodeRect.x - LineSpace
      const delta = Math.abs(relative.x + relative.width - nodeRect.x)

      if(delta > minDelta) {
        horizontal.push({ side: "l", x1: objectRightSideX, y1: centerLineY, x2: nodeLeftSideX, y2: centerLineY })
        const nodes = createDistanceGuideLine({ orientation: "H", x1: objectRightSideX, y1: centerLineY, x2: nodeLeftSideX, y2: centerLineY, lineColor, wallSize, alignOffset, textOffset, delta, offsetEvent })

        nodes.forEach(node => void layer.add(node))
        layer.draw()
      }
    } else if (relative.side === 'r') {

      if(!guides.some(e => e.orientation === "H")) return

      const centerLineY = lg.lineGuide
      const objectLeftSideX = relative.x - LineSpace
      const nodeRightSideX = nodeRect.x + nodeRect.width + LineSpace
      const delta = Math.abs(nodeRect.x + nodeRect.width - relative.x)

      if(delta > minDelta) {
        horizontal.push({ side: "r", x1: nodeRightSideX, y1: centerLineY, x2: objectLeftSideX, y2: centerLineY })
        const nodes = createDistanceGuideLine({ orientation: "H", x1: nodeRightSideX, y1: centerLineY, x2: objectLeftSideX, y2: centerLineY, lineColor, wallSize, alignOffset, textOffset, delta, offsetEvent })
        nodes.forEach(node => void layer.add(node))
        layer.draw()
      }

    } else if (relative.side === 't') {
      if(!guides.some(e => e.orientation === "V")) return

      const centerLineX = guides.find(e => e.orientation === "V").lineGuide
      const objectLeftSideY = relative.y + relative.height + LineSpace
      const nodeRightSideY = nodeRect.y - LineSpace
      const delta = Math.abs(relative.y + relative.height - nodeRect.y)

      if(delta > minDelta) {
        vertical.push({ side: "t", x1: centerLineX, y1: objectLeftSideY, x2: centerLineX, y2: nodeRightSideY })
        const nodes = createDistanceGuideLine({ orientation: "V", x1: centerLineX, y1: objectLeftSideY, x2: centerLineX, y2: nodeRightSideY, lineColor, wallSize, alignOffset, textOffset, delta, offsetEvent })
        nodes.forEach(node => void layer.add(node))
        layer.draw()
      }

    } else if (relative.side === 'b') {

      if(!guides.some(e => e.orientation === "V")) return

      const centerLineX = guides.find(e => e.orientation === "V").lineGuide
      const objectLeftSideY = relative.y - LineSpace
      const nodeRightSideY = nodeRect.y + nodeRect.height + LineSpace
      const delta = Math.abs(nodeRect.y + nodeRect.height - relative.y )

      if(delta > minDelta) {
        vertical.push({ side: "b", x1: centerLineX, y1: nodeRightSideY, x2: centerLineX, y2: objectLeftSideY, })
        const nodes = createDistanceGuideLine({ orientation: "V", x1: centerLineX, y1: nodeRightSideY, x2: centerLineX, y2: objectLeftSideY, lineColor, wallSize, alignOffset, textOffset, delta, offsetEvent })
        nodes.forEach(node => void layer.add(node))
        layer.draw()
      }
    }
  })
}


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



function getLineGuideStops2(skipShape, stage) {
  let vertical = [{ id: "stage", point: 0 }, { id: "stage", point: stage.width() / 2 }, { id: "stage", point: stage.width() }]
  let horizontal = [{ id: "stage", point: 0 }, { id: "stage", point: stage.height() / 2 }, { id: "stage", point: stage.height() }]

  stage.find('.object').forEach((guideItem) => {

    if (guideItem === skipShape) {
      return
    }

    let box = guideItem.getClientRect()
    
    vertical.push([{ id: guideItem.id(), box, point: box.x }, { id: guideItem.id(), box, point: box.x + box.width }, { id: guideItem.id(), box, point: box.x + box.width / 2 }])
    horizontal.push([{ id: guideItem.id(), box, point: box.y }, { id: guideItem.id(), box, point: box.y + box.height }, { id: guideItem.id(), box, point: box.y + box.height / 2 }])

  })

  return {
    vertical: vertical.flat(),
    horizontal: horizontal.flat(),
  }
}


// find all snapping possibilities
function getGuides2(lineGuideStops, itemBounds) {
  let resultV = []
  let resultH = []

  lineGuideStops.vertical.forEach((lineGuide, i) => {
    itemBounds.vertical.forEach((itemBound) => {
      let diff = Math.abs(lineGuide.point - itemBound.guide)

      if (diff < 3) {
        resultV.push({
          lineGuide: lineGuide.point,
          diff: diff,
          snap: itemBound.snap,
          offset: itemBound.offset,
          box: itemBound.box,
          alignedTo: lineGuide
        })
      }
    })
  })

  lineGuideStops.horizontal.forEach((lineGuide) => {
    itemBounds.horizontal.forEach((itemBound) => {
      let diff = Math.abs(lineGuide.point - itemBound.guide)

      if (diff < 3) {
        resultH.push({
          lineGuide: lineGuide.point,
          diff: diff,
          snap: itemBound.snap,
          offset: itemBound.offset,
          box: itemBound.box,
          alignedTo: lineGuide
        })
      }
    })
  })


  let rVm = {}
  let rHm = {}


  resultH.forEach(e => {
    if(!rHm[e.alignedTo.id]) {
      rHm[e.alignedTo.id] = [e]
    } else {
      rHm[e.alignedTo.id].push(e)
    }
  })

  resultV.forEach(e => {
    if(!rVm[e.alignedTo.id]) {
      rVm[e.alignedTo.id] = [e]
    } else {
      rVm[e.alignedTo.id].push(e)
    }
  })


  
  console.log(rVm, rHm)


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

      if (diff < 3) {
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

      if (diff < 3) {
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


  let v = resultV.filter(e => e.diff <= 5).sort((a, b) => a.diff - b.diff)
  let startV = v.find(e => e.snap === "start")
  let centerV = v.find(e => e.snap === "center")
  let endV = v.find(e => e.snap === "end")
  let minV = startV ? startV : endV ? endV : centerV ? centerV : v[0]

  
  let h = resultH.filter(e => e.diff <= 5).sort((a, b) => a.diff - b.diff)   

  let startH = h.find(e => e.snap === "start")
  let centerH = h.find(e => e.snap === "center")
  let endH = h.find(e => e.snap === "end")
  let minH = startH ? startH : endH ? endH : centerH ? centerH : h[0]
  
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



// #ff4bc8
function drawGuides(guides, layer) {

  guides.forEach((lg) => {
    if (lg.orientation === 'H') {
      let line = new Konva.Line({
        points: [-6000, lg.lineGuide, 6000, lg.lineGuide],
        stroke: '#0099ff',
        strokeWidth: 1,
        name: 'guid-line',
        // dash: [4, 6],
      })
      layer.add(line)
      layer.batchDraw()
    } else if (lg.orientation === 'V') {

      let line = new Konva.Line({
        points: [lg.lineGuide, -6000, lg.lineGuide, 6000],
        stroke: '#0099ff',
        strokeWidth: 1,
        name: 'guid-line',
        // dash: [4, 6],
      })
      layer.add(line)
      layer.batchDraw()
    }
  })
}


function Layer(props) {
  const { stage, attrs } = props

  const context = useContext(KonvaContext)
  const { store, setSelected, setMode } = context

  const layer = useMemo(() => new Konva.Layer(attrs), [])


  useEffect(() => {
    if(stage) {
      layer.on("mousedown.selecting", e => {
        if(store.mode === "HAND") {
          setSelected(e.target.id())
        }
      })
    }

    return () => {
      if(stage) {
        layer.off("mousedown.selecting")
      }
    }

  },[stage, store.mode])

  useEffect(() => {
    if (stage) {

      // let group = new Konva.Layer({
      //   x: 100,
      //   y: 100,
      //   width: 100,
      //   height: 50
      // })


      stage.add(layer)


      let prevGuides = null
      let prevRelatives = null
      let prevName = null
      // let prevPos = null
    
      // let count = 0
      layer.on('dragmove', function (e) {

        if (e.target.className === "Transformer") {
          return
        }

        if(prevName !== e.target.id()) {
          prevGuides = null
          prevName = null
        }

        prevName = e.target.id()
     
        // clear all previous lines on the screen
        layer.find('.relative-guid-line').destroy()
        layer.find('.guid-line').destroy()

        
        // find possible snapping lines
        let lineGuideStops = getLineGuideStops(e.target, stage)
        // find snapping points of current object
        let itemBounds = getObjectSnappingEdges(e.target)
        // now find where can we snap current object
        let guides = getGuides(lineGuideStops, itemBounds)


        
        getGuides2(getLineGuideStops2(e.target, stage), itemBounds)

        

        // console.log("-",guides,".", prevGuides)
        // do nothing of no snapping
        if (!guides.length) {
          prevGuides = null
          prevRelatives = null
          return
        }
        /**
         * FIX Align when dragging and relative object have the same uneven height or width - Priorities snap start or snap end, and skip center.
         */
        guides = guides.map(e => {
          if(prevGuides) {
            const g = prevGuides.find(p => p.orientation === e.orientation )

            if(g && 
                (Math.abs(g.diff - e.diff) <= 1 || 
                (Math.abs(g.diff - e.diff) <= 2 && (g.box.height === e.box.height || e.box.width === g.box.width)) )) {

                return g
              }
            }
          return e

        })

        let relatives = getRelativeDistances(e.target, stage, guides)


        for(let key in relatives) {
          if(prevRelatives) {
            const g = prevRelatives[key]

            if(g && Math.abs(g.delta - relatives[key].delta) <= 3) {
              relatives[key] = g
            }

          }
        }
      


        /**
         * FIX Relatives
         * racecondition on relatives needs to get fixed
         * Loop through prev and relatives and then check the differ for which return value to priorities
         * 
        */


      
        prevGuides = guides
        prevRelatives = relatives
      

        // now force object position

    
  
        guides.forEach((lg) => {
          switch (lg.snap) {
            case 'start': {
              switch (lg.orientation) {
                case 'V': {
                  !lg.disabled && e.target.x(lg.lineGuide + lg.offset)
                  !lg.disabled && drawGuides(guides, layer)
                  !lg.disabled && drawRelativeGuideLines(relatives, e.target, layer, guides, lg )
                  break
                }
                case 'H': {
                  !lg.disabled && e.target.y(lg.lineGuide + lg.offset)
                  !lg.disabled && drawGuides(guides, layer)
                  !lg.disabled && drawRelativeGuideLines(relatives, e.target, layer, guides, lg )
                  break
                }
              }
              break
            }
            case 'center': {
              switch (lg.orientation) {
                case 'V': {
                  !lg.disabled && e.target.x(lg.lineGuide + lg.offset)
                  !lg.disabled && drawGuides(guides, layer)
                  !lg.disabled && drawRelativeGuideLines(relatives, e.target, layer, guides, lg )
                  break
                }
                case 'H': {
                  !lg.disabled && e.target.y(lg.lineGuide + lg.offset)
                  !lg.disabled && drawGuides(guides, layer)
                  !lg.disabled && drawRelativeGuideLines(relatives, e.target, layer, guides, lg )
                  break
                }
              }
              break
            }
            case 'end': {
              switch (lg.orientation) {
                case 'V': {
                  !lg.disabled && e.target.x(lg.lineGuide + lg.offset)
                  !lg.disabled && drawGuides(guides, layer)
                  !lg.disabled && drawRelativeGuideLines(relatives, e.target, layer, guides, lg )
                  break
                }
                case 'H': {
                  !lg.disabled && e.target.y(lg.lineGuide + lg.offset)
                  !lg.disabled && drawGuides(guides, layer)
                  !lg.disabled && drawRelativeGuideLines(relatives, e.target, layer, guides, lg )
                  break
                }
              }
              break
            }

            default: {
              console.log("e.target", e.target.attrs)
             
            }
          }  
        })


      })

      layer.on('dragend', function (e) {
        // clear all previous lines on the screen
        layer.find('.guid-line').destroy()
        layer.find('.relative-guid-line').destroy()
        layer.batchDraw()
      })

      layer.draw()
    }

    return () => {
      stage.remove(layer)
    }

  }, [])




  useEffect(() => {



  }, [])

  if (!props.children || !Array.isArray(props.children)) return <DrawShape layer={layer} stage={stage} />

  return (
    <>
      {props.children.map(struct => <Structure {...struct} layer={layer} stage={stage} />)}
      <DrawShape layer={layer} stage={stage} />
    </>
  )

}


export default Layer