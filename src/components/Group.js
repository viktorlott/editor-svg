import React, { useEffect, useRef, useState, useCallback, useContext, useMemo, createContext, useReducer, } from 'react'
import Konva from 'konva';
import useTransformer from '../hooks/useTransformer'
import getDragDirection from '../utils/getDragDirection'
import KonvaContext from '../context/konvacontext'
import Structure from './Structure'

function Group(props) {
    const { attrs, layer, stage } = props
  
    const group = useMemo(() => new Konva.Group(attrs), [])
  
    useTransformer(line, layer, stage, { name: attrs.name + "_transformer" })
    
  

    
  
    useEffect(() => {
      
      return () => {
        layer.remove(group)
      }
    },[])
  
  
  
  
  
    if(!props.children || !Array.isArray(props.children)) return null
  
    return props.children.map(struct => {
      return <Structure {...struct} />
    })
  
  }

  
  export default Group