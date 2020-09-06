import React, { useEffect, useRef, useState, useCallback, useContext, useMemo, createContext, useReducer, } from 'react'
import Stage from './Stage'
import Layer from './Layer'
import Rect from './Rect'
import Text from './Text'
import Image from './Image'

function Structure(props) {
    const { className } = props
  
    switch(className) {
      case "Stage": {
        return <Stage {...props}/>
      }
      case "Layer": {
        return <Layer {...props}/>
      }
      case "Rect": {
        return <Rect {...props}/>
      }
      case "Text": {
        return <Text {...props}/>
      }
      case "Image": {
        return <Image {...props}/>
      }
    }
  
    return null
  
  
  }

  export default Structure