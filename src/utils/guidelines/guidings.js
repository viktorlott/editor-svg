import Konva from 'konva'
import { width, height, offset } from '../config'
import { isOnLeftSide, isOnRightSide, isOnTopSide, isOnBottomSide, getBoundingBoxes } from './relations'



// were can we snap our objects?
export function getLineGuideStops(skipShape, stage) {
    // we can snap to stage borders and the center of the stage

    const sceneStage = stage.findOne("#background")
    const sceneY = 0 + offset / 2
    const sceneX = 0 + offset / 2

    const centerHorizontal = (sceneStage.height() / 2) + sceneY
    const centerVertical = (sceneStage.width() / 2) + sceneX

    const sceneHeight = sceneStage.height() + sceneY
    const sceneWidth = sceneStage.width() + sceneX

    let vertical = [sceneY, centerVertical, sceneWidth]
    let horizontal = [sceneX, centerHorizontal, sceneHeight]

    // let vertical = [0, stage.width() / 2, stage.width()]
    // let horizontal = [0, stage.height() / 2, stage.height()]

    // and we snap over edges and center of each object on the canvas
    stage.find('.object').forEach((guideItem) => {

        if (guideItem === skipShape) {
            return
        }

        let box = guideItem.getClientRect()
        console.log(guideItem.strokeWidth())
        // and we can snap to all edges of shapes
        vertical.push([box.x + 0, box.x + box.width - 0, box.x + box.width / 2])
        horizontal.push([box.y + 0, box.y + box.height - 0, box.y + box.height / 2])
    })

    return {
        vertical: vertical.flat(),
        horizontal: horizontal.flat(),
    }
}

// (guideItem.strokeWidth && guideItem.strokeWidth() % 2 === 0 ? 0 : 1)
// (guideItem.strokeWidth && guideItem.strokeWidth() % 2 === 0 ? 0 : 1)
// (guideItem.strokeWidth && guideItem.strokeWidth() % 2 === 0 ? 0 : 1)
// (guideItem.strokeWidth && guideItem.strokeWidth() % 2 === 0 ? 0 : 1)

export function getLineGuideStops2(skipShape, stage) {
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
export function getGuides2(lineGuideStops, itemBounds) {
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
        if (!rHm[e.alignedTo.id]) {
            rHm[e.alignedTo.id] = [e]
        } else {
            rHm[e.alignedTo.id].push(e)
        }
    })

    resultV.forEach(e => {
        if (!rVm[e.alignedTo.id]) {
            rVm[e.alignedTo.id] = [e]
        } else {
            rVm[e.alignedTo.id].push(e)
        }
    })



    // console.log(rVm, rHm)


}


export function getObjectSnappingEdges(node) {
    let skippedTransformBox = node.getClientRect({ skipTransform: true})

    let box = node.getClientRect()
    let absPos = node.absolutePosition()

    
    return {
        vertical: [
            {
                guide: (box.x),
                offset: (absPos.x - box.x),
                snap: 'start',
                boundingbox: box,
            },
            {
                guide: (box.x + box.width / 2),
                offset: (absPos.x - box.x - box.width / 2),
                snap: 'center',
                boundingbox: box,
            },
            {
                guide: (box.x + box.width),
                offset: (absPos.x - box.x - box.width),
                snap: 'end',
                boundingbox: box,
            },
        ],
        horizontal: [
            {
                guide: (box.y),
                offset: (absPos.y - box.y),
                snap: 'start',
                boundingbox: box,
            },
            {
                guide: (box.y + box.height / 2),
                offset: (absPos.y - box.y - box.height / 2),
                snap: 'center',
                boundingbox: box,
            },
            {
                guide: (box.y + box.height),
                offset: (absPos.y - box.y - box.height),
                snap: 'end',
                boundingbox: box,
            },
        ]
    }
}

// find all snapping possibilities
export function getGuides(lineGuideStops, itemBounds) {
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
export function drawGuides(guides, layer) {
    const color = "#00EBFF" || '#0099ff'

    const stage = layer.parent
    const sceneStage = stage.findOne("#background")

    guides.forEach((lg) => {

        if (lg.orientation === 'H') {
            let line = new Konva.Line({
                // points: [-6000, lg.lineGuide, 6000, lg.lineGuide],
                points: [sceneStage.x(), lg.lineGuide, sceneStage.width() + sceneStage.x(), lg.lineGuide],
                stroke: color,
                strokeWidth: 1,
                name: 'guid-line',
                // dash: [4, 6],
            })
            layer.add(line)
            layer.batchDraw()
        } else if (lg.orientation === 'V') {

            let line = new Konva.Line({
                points: [lg.lineGuide, sceneStage.y(), lg.lineGuide, sceneStage.height() + sceneStage.y()],
                // points: [lg.lineGuide, -6000, lg.lineGuide, 6000],
                stroke: color,
                strokeWidth: 1,
                name: 'guid-line',
                // dash: [4, 6],
            })
            layer.add(line)
            layer.batchDraw()
        }
    })
}


function smallestDistance(a, b) {
    try {
      return  a.delta <= b.delta ? a : b
    } catch(err) {
      console.log(a, b, err)
      return a
    }
  }


class GuideLines {

    static get(node, objects, constraints, skipShape) {
        const guideLines = new GuideLines()
        const lineGuideStops = guideLines.getLineGuideStops(objects, constraints, skipShape)
        const itemBounds = guideLines.getObjectSnappingEdges(node)
        const guides = guideLines.getGuides(lineGuideStops, itemBounds, constraints.threshold)
        return guides
    }

    vector(object, vector) {
        return { id: object.id, guideline: vector, boundingbox: { width: object.width, height: object.height, x: object.x, y: object.y }}
    }

    getLineGuideStops(objects, constraints, skipShape) {

        const { offsetY, offsetX, width, height } = constraints
        // we can snap to stage borders and the center of the stage
    
        const sceneY = 0 + offsetY / 2
        const sceneX = 0 + offsetX / 2
    
        const centerHorizontal = (height / 2) + sceneY
        const centerVertical = (width / 2) + sceneX
    
        const sceneHeight = height + sceneY
        const sceneWidth = width + sceneX
    
        const boundingbox = { id: "scene", width, height, x: sceneX, y: sceneY }

        let vertical = [sceneY, centerVertical, sceneWidth].map(v => this.vector(boundingbox, v))
        let horizontal = [sceneX, centerHorizontal, sceneHeight].map(v => this.vector(boundingbox, v))
    

        for (let guideItem of objects) {
            if (skipShape && guideItem.id === skipShape.id) {
                continue
            }

            let box = guideItem

            vertical.push([box.x, box.x + box.width, box.x + box.width / 2].map(v => this.vector(box, v)))
            horizontal.push([box.y, box.y + box.height, box.y + box.height / 2].map(v => this.vector(box, v)))
        }
    
    
        return {
            vertical: vertical.flat(),
            horizontal: horizontal.flat(),

        }
    }


    getObjectSnappingEdges(node) {

        let box = node.getClientRect()

        let absPos = node.absolutePosition();

        
        return {
            vertical: [
                {
                    guide: Math.round(box.x),
                    offset: Math.round(absPos.x - box.x),
                    snap: 'start',
                    boundingbox: box,
                },
                {
                    guide: Math.round(box.x + box.width / 2),
                    offset: Math.round(absPos.x - box.x - box.width / 2),
                    snap: 'center',
                    boundingbox: box,
                },
                {
                    guide: Math.round(box.x + box.width),
                    offset: Math.round(absPos.x - box.x - box.width),
                    snap: 'end',
                    boundingbox: box,
                },
            ],
            horizontal: [
                {
                    guide: Math.round(box.y),
                    offset: Math.round(absPos.y - box.y),
                    snap: 'start',
                    boundingbox: box,
                },
                {
                    guide: Math.round(box.y + box.height / 2),
                    offset: Math.round(absPos.y - box.y - box.height / 2),
                    snap: 'center',
                    boundingbox: box,
                },
                {
                    guide: Math.round(box.y + box.height),
                    offset: Math.round(absPos.y - box.y - box.height),
                    snap: 'end',
                    boundingbox: box,
                },
            ],
        }
    }

    getGuides(lineGuideStops, itemBounds, threshold=3) {
        let resultV = []
        let resultH = []
    
        lineGuideStops.vertical.forEach((guide, i) => {
            itemBounds.vertical.forEach((itemBound) => {
                let lineGuide = guide.v

                let diff = Math.abs(lineGuide - itemBound.guide)
    
                if (diff < threshold) {
                    resultV.push({
                        lineGuide: lineGuide,
                        diff: diff,
                        snap: itemBound.snap,
                        offset: itemBound.offset,
                        box: itemBound.box,
                        other: lineGuideStops,
                        itemBound,
                        guide
    
                    })
                }
            })
        })
    
        lineGuideStops.horizontal.forEach((guide) => {
            itemBounds.horizontal.forEach((itemBound) => {
                let lineGuide = guide.v

                let diff = Math.abs(lineGuide - itemBound.guide)
    
                if (diff < threshold) {
                    resultH.push({
                        lineGuide: lineGuide,
                        diff: diff,
                        snap: itemBound.snap,
                        offset: itemBound.offset,
                        box: itemBound.box,
                        other: lineGuideStops,
                        itemBound,
                        guide
                    })
                }
            })
        })
    
        let guides = []
    
    
        let verticalList = resultV.sort((a, b) => a.diff - b.diff)
        let horizontalList = resultH.sort((a, b) => a.diff - b.diff)

        let firstInVerticalList = verticalList[0]
        let firstInHorizontalList = horizontalList[0]

        // find the first snap start/center/end category in the list
        let startV = verticalList.find(e => e.snap === "start")
        let centerV = verticalList.find(e => e.snap === "center")
        let endV = verticalList.find(e => e.snap === "end")
        
        let startH = horizontalList.find(e => e.snap === "start")
        let centerH = horizontalList.find(e => e.snap === "center")
        let endH = horizontalList.find(e => e.snap === "end")

    

        /**
         * If list for example contains [center, end, start, end, end, center, start]
         *                                              \____ snap start has priority in this example.
         * 
         * If list for example contains [center, center, center, end]
         *                                                        \____ snap end has priority in this example.
         * 
         * If list for example contains [center, center, center, center]
         *                                  \____ snap center has priority in this example.
         */
        let minV = startV // Always priorities snap start first 
                    ? startV 
                    : endV // then priorities snap end
                        ? endV 
                        : centerV // and last, priorities snap center
                            ? centerV 
                            : firstInVerticalList // fallback to first in list
    
        let minH = startH 
                    ? startH 
                    : endH 
                        ? endH 
                        : centerH 
                            ? centerH 
                            : firstInHorizontalList
    


                            
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


    getRelativeDistances(node, stage, guides) {
        const relatives = stage.find('.object').reduce((distances, object, i, objects) => {
          const nodeRect = node
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
    



}