import React, { useEffect, useRef, useState, useCallback, useContext, useMemo, createContext, useReducer, } from 'react'
import Konva from 'konva'
import useTransformer from '../hooks/useTransformer'
import getDragDirection from '../utils/getDragDirection'
import KonvaContext from '../context/konvacontext'
import Structure from './Structure'
import DrawShape from './DrawShape'

function smallestDistance(a, b) {
  try {
    return  a.delta < b.delta ? a : b
  } catch(err) {
    console.log(a, b, err)
    return a
  }

}

function getRelativeDistances(node, stage) {
  const relatives = stage.find('.object').reduce((distances, object, i, objects) => {
    const nodeRect = node.getClientRect()
    const objectRect = object.getClientRect()
    if(Konva.Util.haveIntersection(nodeRect, objectRect)) return distances

    let margin = 5
 
    if(nodeRect.x >= objectRect.x + objectRect.width && (
      (nodeRect.y >= objectRect.y ) && (nodeRect.y  <= objectRect.y + objectRect.height + margin) || 
      (objectRect.y - margin <= (nodeRect.y + nodeRect.height) && (objectRect.y + objectRect.height) >= (nodeRect.y + nodeRect.height)) ||
      (objectRect.y >= nodeRect.y && (objectRect.y + objectRect.height) <= (nodeRect.y + nodeRect.height))
      )) {
      const item = { side: "l", ...objectRect, delta: Math.abs(nodeRect.x + nodeRect.width - objectRect.x) }
      if(!distances["l"]) {
        distances["l"] = item
      } else {
        distances["l"] = smallestDistance(distances["l"], item)
      }

    } else if(nodeRect.x + nodeRect.width <= objectRect.x && (((nodeRect.y >= objectRect.y) && (nodeRect.y  <= objectRect.y + objectRect.height + margin)) || (objectRect.y - margin <= (nodeRect.y + nodeRect.height) && (objectRect.y + objectRect.height) >= (nodeRect.y + nodeRect.height) || (objectRect.y >= nodeRect.y && (objectRect.y + objectRect.height) <= (nodeRect.y + nodeRect.height))))) {
      const item = { side: "r", ...objectRect, delta: Math.abs(nodeRect.x + nodeRect.width - objectRect.x)}
      if(!distances["r"]) {
        distances["r"] = item
      } else {
        distances["r"] = smallestDistance(distances["r"], item)
      }
    } else if(nodeRect.y >= objectRect.y + objectRect.height && (((nodeRect.x >= objectRect.x) && (nodeRect.x <= objectRect.x + objectRect.width + margin )) || (objectRect.x - margin <= (nodeRect.x + nodeRect.width ) && (objectRect.x + objectRect.width) >= (nodeRect.x + nodeRect.width)) || (objectRect.x >= nodeRect.x && (objectRect.x + objectRect.width) <= (nodeRect.x + nodeRect.width)))) {
      const item = { side: "t", ...objectRect, delta: Math.abs(objectRect.y + objectRect.height - nodeRect.y)}
      if(!distances["t"]) {
        distances["t"] = item
      } else {
        distances["t"] = smallestDistance(distances["t"], item)
      }

    } else if(nodeRect.y + nodeRect.height<= objectRect.y && (
      ((nodeRect.x >= objectRect.x) && (nodeRect.x <= objectRect.x + objectRect.width + margin )) || 
      (objectRect.x - margin <= (nodeRect.x + nodeRect.width) && (objectRect.x + objectRect.width) >= (nodeRect.x + nodeRect.width)) || 
      (objectRect.x >= nodeRect.x && (objectRect.x + objectRect.width) <= (nodeRect.x + nodeRect.width))
      )) {
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
// #ff4bc8
function drawRelativeGuideLines(relatives, node, layer, lg) {
  const nodeRect = node.getClientRect()
  
  layer.find('.relative-guid-line').destroy()
  let offsetEvent = 40
  let minDelta = 4
  let lineColor = '#ff26a9'
  let wallSize = 2
  let alignOffset = 5
  Object.values(relatives).forEach((relative) => {

    
    if (relative.side === 'l') {
      const isEvenTop = ((nodeRect.y + nodeRect.height) - offsetEvent <= relative.y && (nodeRect.y + nodeRect.height) + offsetEvent >= relative.y) 
      const isEventBottom = ((relative.y + relative.height) - offsetEvent <= nodeRect.y && (relative.y + relative.height) + offsetEvent >= nodeRect.y)

      const objectRightSideX = relative.x + relative.width + 2
      const centerLineY = isEvenTop ? relative.y + alignOffset : isEventBottom ? relative.y + relative.height - alignOffset : (relative.y + relative.height / 2) + alignOffset 
      const nodeLeftSideX = nodeRect.x - 2
      const delta = Math.abs(relative.x + relative.width - nodeRect.x)

      if(delta > minDelta) {
        let line = new Konva.Line({
          points: [objectRightSideX, centerLineY, nodeLeftSideX, centerLineY],
          stroke: lineColor,
          strokeWidth: 1,
          name: 'relative-guid-line',
        })
  
        let wallLeft = new Konva.Line({
          points: [objectRightSideX, centerLineY + wallSize, objectRightSideX, centerLineY - wallSize],
          stroke: lineColor,
          strokeWidth: 1,
          name: 'relative-guid-line',
        })
  
        let wallRight = new Konva.Line({
          points: [nodeLeftSideX , centerLineY + wallSize, nodeLeftSideX, centerLineY - wallSize ],
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
  
        text.x((objectRightSideX) + (line.width() / 2) - text.width() / 2)
        text.y(centerLineY + alignOffset)
  
        layer.add(text)
        layer.add(line)
        layer.add(wallLeft)
        layer.add(wallRight)
        layer.draw()
      }
    } else if (relative.side === 'r') {
      const isEvenTop = ((nodeRect.y + nodeRect.height) - offsetEvent <= relative.y && (nodeRect.y + nodeRect.height) + offsetEvent >= relative.y) 
      const isEventBottom = ((relative.y + relative.height) - offsetEvent <= nodeRect.y && (relative.y + relative.height) + offsetEvent >= nodeRect.y)

      const centerLineY = isEvenTop ? relative.y + alignOffset : isEventBottom ? relative.y + relative.height - alignOffset : (relative.y + relative.height / 2) + alignOffset 
      const objectLeftSideX = relative.x - 2
      const nodeRightSideX = nodeRect.x + nodeRect.width + 2

      const delta = Math.abs(nodeRect.x + nodeRect.width - relative.x)

      if(delta > minDelta) {
        let line = new Konva.Line({
        points: [objectLeftSideX, centerLineY, nodeRightSideX, centerLineY],
        stroke: lineColor,
        strokeWidth: 1,
        name: 'relative-guid-line',
      })

      let wallLeft = new Konva.Line({
        points: [objectLeftSideX, centerLineY + wallSize, objectLeftSideX, centerLineY - wallSize],
        stroke: lineColor,
        strokeWidth: 1,
        name: 'relative-guid-line',
      })

      let wallRight = new Konva.Line({
        points: [nodeRightSideX , centerLineY + wallSize, nodeRightSideX, centerLineY - wallSize ],
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

      text.x((nodeRightSideX) + (line.width() / 2) - text.width() / 2)
      text.y(centerLineY + alignOffset)

      layer.add(text)
      layer.add(line)
      layer.add(wallLeft)
      layer.add(wallRight)
      layer.draw()
    }

    } else if (relative.side === 't') {

      const isEvenRight = ((nodeRect.x + nodeRect.width) - offsetEvent <= relative.x && (nodeRect.x + nodeRect.width) + offsetEvent >= relative.x) 
      const isEventLeft = ((relative.x + relative.width) - offsetEvent <= nodeRect.x && (relative.x + relative.width) + offsetEvent >= nodeRect.x)

      const centerLineX = isEvenRight ? relative.x + alignOffset : isEventLeft ? relative.x + relative.width - alignOffset : (relative.x + relative.width / 2) + alignOffset 
      const objectLeftSideY = relative.y + relative.height + 2 

      const nodeRightSideY = nodeRect.y  - 2

      const delta = Math.abs(relative.y + relative.height - nodeRect.y)
      if(delta > minDelta) {
        let line = new Konva.Line({
          points: [centerLineX, objectLeftSideY, centerLineX, nodeRightSideY],
          stroke: lineColor,
          strokeWidth: 1,
          name: 'relative-guid-line',
        })
  
        let wallLeft = new Konva.Line({
          points: [centerLineX + wallSize, objectLeftSideY, centerLineX - wallSize, objectLeftSideY ],
          stroke: lineColor,
          strokeWidth: 1,
          name: 'relative-guid-line',
        })
  
        let wallRight = new Konva.Line({
          points: [centerLineX + wallSize, nodeRightSideY, centerLineX - wallSize, nodeRightSideY ],
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
  
        text.x(centerLineX + alignOffset)
        text.y((objectLeftSideY) + (line.height() / 2) - text.height() / 2)
  
        layer.add(text)
        layer.add(line)
        layer.add(wallLeft)
        layer.add(wallRight)
        layer.draw()
      }

    } else if (relative.side === 'b') {
      const isEvenRight = ((nodeRect.x + nodeRect.width) - offsetEvent <= relative.x && (nodeRect.x + nodeRect.width) + offsetEvent >= relative.x) 
      const isEventLeft = ((relative.x + relative.width) - offsetEvent <= nodeRect.x && (relative.x + relative.width) + offsetEvent >= nodeRect.x)

      const centerLineX = isEvenRight ? relative.x + alignOffset : isEventLeft ? relative.x + relative.width - alignOffset : (relative.x + relative.width / 2) + alignOffset 
      const objectLeftSideY = relative.y - 2 

      const nodeRightSideY = nodeRect.y + nodeRect.height + 2

      const delta = Math.abs(nodeRect.y + nodeRect.height - relative.y )

      if(delta > minDelta) {

        let line = new Konva.Line({
          points: [centerLineX, objectLeftSideY, centerLineX, nodeRightSideY],
          stroke: lineColor,
          strokeWidth: 1,
          name: 'relative-guid-line',
        })
  
        let wallLeft = new Konva.Line({
          points: [centerLineX + wallSize, objectLeftSideY, centerLineX - wallSize, objectLeftSideY ],
          stroke: lineColor,
          strokeWidth: 1,
          name: 'relative-guid-line',
        })
  
        let wallRight = new Konva.Line({
          points: [centerLineX + wallSize, nodeRightSideY, centerLineX - wallSize, nodeRightSideY ],
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
  
        text.x(centerLineX + alignOffset)
        text.y((nodeRightSideY) + (line.height() / 2) - text.height() / 2)
  
        layer.add(text)
        layer.add(line)
        layer.add(wallLeft)
        layer.add(wallRight)
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
      // if the distance between guild line and object snap point is close we can consider this for snapping

      if (diff < 3) {
        resultV.push({
          lineGuide: lineGuide,
          diff: diff,
          snap: itemBound.snap,
          offset: itemBound.offset,
          box: itemBound.box,
          other: lineGuideStops

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
          other: lineGuideStops
        })
      }
    })
  })

  let guides = []

  // find closest snap
  let minV = resultV.sort((a, b) => a.diff - b.diff)[0]
  let minH = resultH.sort((a, b) => a.diff - b.diff)[0]

  if (minV) {
    guides.push({
      lineGuide: minV.lineGuide,
      offset: minV.offset,
      orientation: 'V',
      snap: minV.snap,
      box: minV.box,
      other: minV.other
    })
  }
  
  if (minH) {
    guides.push({
      lineGuide: minH.lineGuide,
      offset: minH.offset,
      orientation: 'H',
      snap: minH.snap,
      box: minH.box,
      other: minH.other
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
  const { stage } = props

  const layer = useMemo(() => new Konva.Layer(), [])






  useEffect(() => {
    if (stage) {
      stage.add(layer)


      layer.on('dragmove', function (e) {
        if (e.target.className === "Transformer") {
          return
        }


        // clear all previous lines on the screen
        layer.find('.relative-guid-line').destroy()
        layer.find('.guid-line').destroy()

        

        let relatives = getRelativeDistances(e.target, stage)


        // find possible snapping lines
        let lineGuideStops = getLineGuideStops(e.target, stage)
        // find snapping points of current object
        let itemBounds = getObjectSnappingEdges(e.target)

        // now find where can we snap current object
        let guides = getGuides(lineGuideStops, itemBounds)



        // do nothing of no snapping
        if (!guides.length) {
          return
        }


        drawGuides(guides, layer)
        


        // now force object position

        guides.forEach((lg) => {
          switch (lg.snap) {
            case 'start': {
              switch (lg.orientation) {
                case 'V': {
                  e.target.x(lg.lineGuide + lg.offset)
                  drawRelativeGuideLines(relatives, e.target, layer, lg)
                  break
                }
                case 'H': {
                  e.target.y(lg.lineGuide + lg.offset)
                  drawRelativeGuideLines(relatives, e.target, layer, lg)
                  break
                }
              }
              break
            }
            case 'center': {
              switch (lg.orientation) {
                case 'V': {
                  e.target.x(lg.lineGuide + lg.offset)
                  drawRelativeGuideLines(relatives, e.target, layer, lg)
                  break
                }
                case 'H': {
                  e.target.y(lg.lineGuide + lg.offset)
                  drawRelativeGuideLines(relatives, e.target, layer, lg)
                  break
                }
              }
              break
            }
            case 'end': {
              switch (lg.orientation) {
                case 'V': {
                  e.target.x(lg.lineGuide + lg.offset)
                  drawRelativeGuideLines(relatives, e.target, layer, lg)
                  break
                }
                case 'H': {
                  e.target.y(lg.lineGuide + lg.offset)
                  drawRelativeGuideLines(relatives, e.target, layer, lg)
                  break
                }
              }
              break
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