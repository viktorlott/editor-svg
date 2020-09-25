import React, { useEffect, useRef, useState, useCallback, useContext, useMemo, createContext, useReducer, } from 'react'
import Konva from 'konva'
import useTransformer from '../hooks/useTransformer'
import getDragDirection from '../utils/getDragDirection'
import KonvaContext from '../context/konvacontext'
import Structure from './Structure'
import DrawShape from './DrawShape'
import {
  getRelativeDistances,
  createDistanceGuideLine,
  drawRelativeGuideLines,
  getLineGuideStops,
  getObjectSnappingEdges,
  getGuides,
  drawGuides,
  getLineGuideStops2,
  getGuides2
} from '../utils/guidelines'


function Layer(props) {
  const { stage, attrs } = props

  const context = useContext(KonvaContext)
  const { store, setSelected, setMode } = context

  const layer = useMemo(() => new Konva.Layer(attrs), [])


  useEffect(() => {
    if(stage) {
      // layer.offset({x: 50, y: 50})
      layer.on("mousedown.selecting", e => {
        const id = e.target.id()
        if(store.mode === "HAND" && id !== "background") {
          setSelected(id)
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
                (Math.abs(g.diff - e.diff) <= 1 && (g.box.height === e.box.height || e.box.width === g.box.width)) )) {

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