import React, { useEffect, useRef, useState, useCallback, useContext, useMemo, createContext, useReducer, } from 'react'
import Konva from 'konva'
import getDragDirection from '../utils/getDragDirection'
import KonvaContext from '../context/konvacontext'

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
            },
            // {
            //   guide: Math.round(box.x + box.width / 2),
            //   offset: Math.round(node.x() - box.x - box.width / 2),
            //   snap: 'center',
            // },
            {
                guide: Math.round(box.x + box.width),
                offset: Math.round(node.x() - box.x - box.width),
                snap: 'end',
            },
        ],
        horizontal: [
            {
                guide: Math.round(box.y),
                offset: Math.round(node.y() - box.y),
                snap: 'start',
            },
            // {
            //   guide: Math.round(box.y + box.height / 2),
            //   offset: Math.round(node.y() - box.y - box.height / 2),
            //   snap: 'center',
            // },
            {
                guide: Math.round(box.y + box.height),
                offset: Math.round(node.y() - box.y - box.height),
                snap: 'end',
            },
        ],
    }
}


function getGuides(lineGuideStops, itemBounds) {
    let resultV = []
    let resultH = []


    lineGuideStops.vertical.forEach((lineGuide) => {
        itemBounds.vertical.forEach((itemBound) => {
            let diff = Math.round(Math.abs(lineGuide - itemBound.guide))
            // if the distance between guild line and object snap point is close we can consider this for snapping

            if (diff < 2 && diff !== 0) {
                resultV.push({
                    lineGuide: lineGuide,
                    diff: diff,
                    snap: itemBound.snap,
                    offset: itemBound.offset,
                })
            }
        })
    })

    lineGuideStops.horizontal.forEach((lineGuide) => {
        itemBounds.horizontal.forEach((itemBound) => {
            let diff = Math.round(Math.abs(lineGuide - itemBound.guide))
            if (diff < 2 && diff !== 0) {
                resultH.push({
                    lineGuide: lineGuide,
                    diff: diff,
                    snap: itemBound.snap,
                    offset: itemBound.offset,
                })
            }
        })
    })

    let guides = []

    // find closest snap
    let minV = resultV.sort((a, b) => a.diff - b.diff)[0]
    let maxV = resultV.sort((a, b) => b.diff - a.diff)[0]
    let minH = resultH.sort((a, b) => a.diff - b.diff)[0]
    let maxH = resultH.sort((a, b) => b.diff - a.diff)[0]

    if (maxH) {
        guides.push({
            lineGuide: maxH.lineGuide,
            offset: maxH.offset,
            diff: maxH.diff,
            orientation: 'H',
            snap: maxH.snap,
        })
    }

    if (maxV) {
        guides.push({
            lineGuide: maxV.lineGuide,
            offset: maxV.offset,
            diff: maxV.diff,
            orientation: 'V',
            snap: maxV.snap,
        })
    }

    return guides
}

function drawGuides(guides, layer) {
    guides.forEach((lg) => {
        if (lg.orientation === 'H') {
            let line = new Konva.Line({
                points: [-6000, lg.lineGuide, 6000, lg.lineGuide],
                stroke: '#ff26a9',
                strokeWidth: 1,
                name: 'guid-line',
                // dash: [4, 6],
            })
            layer.add(line)
            layer.batchDraw()
        } else if (lg.orientation === 'V') {
            let line = new Konva.Line({
                points: [lg.lineGuide, -6000, lg.lineGuide, 6000],
                stroke: '#ff26a9',
                strokeWidth: 1,
                name: 'guid-line',
                // dash: [4, 6],
            })
            layer.add(line)
            layer.batchDraw()
        }
    })
}

function useTransformer(shape, layer, stage, attrs = {}) {
    const { store } = useContext(KonvaContext)

    const transform = useMemo(() => new Konva.Transformer({
        resizeEnabled: false,
        rotateEnabled: false,
        anchorCornerRadius: 7,
        anchorStrokeWidth: 1,
        anchorSize: 7,
        rotationSnaps: [0, 90, 180, 270],
        borderStroke: "transparent",
        borderStrokeWidth: 1,
        rotateAnchorOffset: 30,
        ignoreStroke: true,
        strokeScaleEnabled: false,
        
        // keepRatio: true,
        // padding: shape.strokeWidth() / 2,
        ...attrs,
        id: shape.id() + "_transformer"
    }), [])
    // #2ca7ff
    const toggleResizer = useCallback((val) => {
        transform.setAttr("resizeEnabled", val)
        transform.setAttr("borderStroke", val ? "#0099ff" : "transparent")
        layer.draw()
    }, [transform])


    useEffect(() => {
        shape.dragDistance(3)
        console.log(shape.attrs)
        layer.add(shape)
        layer.add(transform)
        transform.nodes([shape])

        if(shape.className === "Rect") {
            transform.padding(shape.strokeWidth() / 2)
        }


     
        shape.on('mouseover', function (e) {
            if (!transform.getAttr("resizeEnabled")) {
                // transform.setAttr("borderStroke", "#0099ff")
                transform.setAttr("borderStroke", "#0099ff")
                transform.setZIndex(layer.children.length)
                layer.draw()
            }
        })

        shape.on('mouseout', function (e) {
            if (!transform.getAttr("resizeEnabled")) {
                transform.setAttr("borderStroke", "transparent")
                layer.draw()
            }
        })





        let tempGuides = null

        shape.on("transformstart", () => {
            transform.resizeEnabled(false)
        })
        shape.on("transformend", () => {
            transform.resizeEnabled(true)
        })
        shape.on("transform", e => {
            transform.padding(shape.strokeWidth() / 2)

            shape.strokeWidth(shape.strokeWidth())

            if (e.target.className === "Transformer") {
                return
            }
            // clear all previous lines on the screen
            layer.find('.guid-line').destroy()


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

            tempGuides = guides.filter(lg => lg.diff !== 0)


                shape.setAttrs({
                    width: Math.max(shape.width() * shape.scaleX(), 5),
                    height: Math.max(shape.height() * shape.scaleY(), 5),
                    scaleX: 1,
                    scaleY: 1,
                  });

        })
    


        transform.boundBoxFunc((oldBox, newBox) => {
            // now force object position

            if (!tempGuides) return newBox
            let tempBox = { ...newBox }

            tempGuides.forEach((lg) => {

                switch (lg.snap) {
                    case 'start': {
                        switch (lg.orientation) {
                            case 'V': {
                                const x = +(lg.lineGuide + lg.offset).toFixed(4)
                                if (Math.round(newBox.x) === Math.round(x)) break


                                if (newBox.x + 2 >= x && newBox.x - 2 <= x) {

                                    tempBox = { ...oldBox, width: oldBox.width + oldBox.x - x, x }
                                }


                                break
                            }
                            case 'H': {
                                const y = +(lg.lineGuide + lg.offset).toFixed(4)

                                if (Math.round(newBox.y) === Math.round(y)) break

                                if (newBox.y + 2 >= y && newBox.y - 2 <= y) {

                                    tempBox = { ...oldBox, height: oldBox.height + oldBox.y - y, y: y }
                                }

                                break
                            }
                        }
                        break
                    }
                    case 'end': {
                        switch (lg.orientation) {
                            case 'V': {
                                const width = +(lg.lineGuide - newBox.x).toFixed(4)

                                if (Math.round(newBox.width) === Math.round(width)) break

                                if (newBox.width + 2 >= width && newBox.width - 2 <= width) {

                                    tempBox = { ...newBox, width }
                                }
                                break
                            }
                            case 'H': {

                                const height = +(lg.lineGuide - newBox.y).toFixed(4)

                                if (Math.round(newBox.height) === Math.round(height)) break

                                if (newBox.height + 2 >= height && newBox.height - 2 <= height) {
                                    tempBox = { ...newBox, height: height }
                                }

                            }
                        }
                        break
                    }
                }
            })

            // for(let key in tempBox) {
            //     if(typeof tempBox[key] === "number") {
            //         tempBox[key] = Math.round(tempBox[key])
            //     }
            // }

            return tempBox

        })

        shape.on("transformend", e => {

            // transform.boundBoxFunc((oldBox, newBox) => newBox)
            // clear all previous lines on the screen
            layer.find('.guid-line').destroy()
            layer.batchDraw()
        })

        layer.draw()



    }, [])


    const hasChangedSelected = store && store.selected

    useEffect(() => {
        if (store) {
            if (shape.id() === store.selected) {
                toggleResizer(true)
            } else {
                toggleResizer(false)
            }
        }


        shape.on("dragmove.transform_resize", () => {
            if(shape.id() === store.selected) {
                transform.resizeEnabled(false)
            }
        })

        shape.on("dragend.transform_resize", () => {
            if(shape.id() === store.selected) {
                transform.resizeEnabled(true)
            }
        })

        return () => {
            shape.off("dragmove.transform_resize")
            shape.off("dragend.transform_resize")
        }


    }, [shape, store, hasChangedSelected])


    return transform

}


export default useTransformer