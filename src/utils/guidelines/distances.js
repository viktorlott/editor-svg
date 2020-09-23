
import { isOnLeftSide, isOnRightSide, isOnTopSide, isOnBottomSide, getBoundingBoxes } from './relations'
import Konva from 'konva'

export function smallestDistance(a, b) {
    try {
      return  a.delta <= b.delta ? a : b
    } catch(err) {
      console.log(a, b, err)
      return a
    }
  }


export function getRelativeDistances(node, stage, guides) {
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


export function createDistanceGuideLine({orientation, x1, y1, x2, y2, lineColor, wallSize, alignOffset, textOffset, delta}) {
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
  export function drawRelativeGuideLines(relatives, node, layer, guides, lg) {
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