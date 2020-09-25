import Konva from 'konva'
import { width, height, offset } from '../config'


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
        // and we can snap to all edges of shapes
        vertical.push([box.x, box.x + box.width, box.x + box.width / 2])
        horizontal.push([box.y, box.y + box.height, box.y + box.height / 2])
    })

    return {
        vertical: vertical.flat(),
        horizontal: horizontal.flat(),
    }
}



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
