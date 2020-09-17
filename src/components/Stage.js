import React, { useEffect, useRef, useState, useCallback, useContext, useMemo, createContext, useReducer, forwardRef} from 'react'
import Konva from 'konva';
import useTransformer from '../hooks/useTransformer'
import getDragDirection from '../utils/getDragDirection'
import KonvaContext from '../context/konvacontext'
import Structure from './Structure'
import canvg from 'canvg'
import { NavContainer, NavButton, Icon, StageContainer, CanvasWrapper, LeftSide, RightSide, SideMenu, SideMenuHeader, SideMenuParameters, Options, Input, AttributeSection, FormWrapper} from './styles'
import CursorIcon from './styles/cursor_normal'
import InputColor from 'react-input-color';

function DisplayText(object, stage) {
  if(object) {
    switch(object.className) {
      case "Rect": return "Rektangel";
      case "Text": return "Text";
      case "Image": return "Bild";
      case "Line": return "Signatur";
      default: return null
    }
  }
  return null
}


function getSelectedObject(selected, stage) {
  if(selected) {
    const object = stage.findOne("#"+selected)
    return object
  }

  return null
}


function InputForm(props) {
  return (
    <FormWrapper>
      <label style={{color: "#989898", margin: "0 5px"}} htmlFor="">{props.label}</label>
      <Input {...props}/>
    </FormWrapper>
  )
}


function OptionsForm(props) {
  const { onChange, value, ...restProps } = props
  return (
    <FormWrapper>
      <label style={{color: "#989898", margin: "0 5px"}} htmlFor="">{props.label}</label>
      <Options {...restProps}>
        <select onChange={onChange} value={value}>
          {props.data.map(field => <option selected={field.value === props.selected} value={field.value}>{field.label}</option>)}
        </select>
      </Options>
    </FormWrapper>
  )
}


function TextFormAttributes(props) {
  const { stage, selectedObject } = props

  const [attrs, setAttrs] = useState(() => selectedObject && {...selectedObject.attrs, fontFamily: selectedObject.fontFamily(), fontStyle: selectedObject.fontStyle()})

  const updateAttrs = useCallback(() => {
    setAttrs({...selectedObject.attrs, fontFamily: selectedObject.fontFamily(), fill: selectedObject.fill() })
  }, [selectedObject, selectedObject.id()])

  const onChangeFontFamily = (e) => {

    selectedObject.fontFamily(e.target.value)
    if(selectedObject.parent) {
      selectedObject.parent.draw()
    }
    updateAttrs()
  }

  const onChangeFontSize = (e) => {
    selectedObject.fontSize(+e.target.value)
    if(selectedObject.parent) {
      selectedObject.parent.draw()
    }
    updateAttrs()
  }


  const onChangeFontWeight = (e) => {
    selectedObject.fontStyle(e.target.value)
    if(selectedObject.parent) {
      selectedObject.parent.draw()
    }
    updateAttrs()
  }

  const onChangeFontColor = (e) => {

    selectedObject.fill(e.target.value)
    if(selectedObject.parent) {
      selectedObject.parent.draw()
    }
    updateAttrs()
  }

  const optionsDataFontFamilies = [{ value: "Arial", label: "Arial"}, { value: "Helvetica", label: "Helvetica"}, { value: "sans-serif", label: "Sans-serif"}, { value: "Times", label: "Times"}]

  const optionsDataFontStyles = [{ value: "normal", label: "Normal"}, { value: "bold", label: "Bold"}, { value: "italic", label: "Italic"}]

  return (
    <AttributeSection>
          <OptionsForm onChange={onChangeFontFamily} label="Typsnitt" value={attrs.fontFamily}  selected={"Times"} width={"150px"} data={optionsDataFontFamilies} />
          <InputForm onChange={onChangeFontSize} value={attrs.fontSize} width={"150px"} label={"Text storlek"} type="number"/>
          <OptionsForm onChange={onChangeFontWeight} label={"Text tjocklek"} value={attrs.fontStyle} selected={"normal"} width={"150px"} data={optionsDataFontStyles} />
          <InputForm onChange={onChangeFontColor} value={attrs.fill} width={"150px"} height={"40px"} label={"Text färg"} type="color"/>
    </AttributeSection>
  )
}



function getRectAttrs(selectedObject) {
  return {...selectedObject.attrs, width: selectedObject.width(), height: selectedObject.height(), fill: selectedObject.fill(), stroke: selectedObject.stroke(), strokeWidth: selectedObject.strokeWidth(), cornerRadius: selectedObject.cornerRadius() }
}

function RectFormAttributes(props) {
  const { stage, selectedObject } = props
  const [attrs, setAttrs] = useState(() => selectedObject && getRectAttrs(selectedObject))


  useEffect(() => {

    setAttrs(getRectAttrs(selectedObject))
  },[selectedObject.id()])
  
  const updateAttrs = useCallback(() => {
    setAttrs(getRectAttrs(selectedObject))
  }, [selectedObject])
  
  const onChangeRectColor = (e) => {
    selectedObject.fill(e.target.value)
    selectedObject.parent.draw()
    updateAttrs()
  }

  const onChangeRectBorderColor = (e) => {
    selectedObject.stroke(e.target.value)
    selectedObject.parent.draw()
    updateAttrs()
  }

  const onChangeRectBorderWidth = (e) => {
    if(e.target.value < 0) return
    const transformer = stage.findOne("#"+selectedObject.id()+"_transformer")
    selectedObject.strokeWidth(+e.target.value)
    transformer.padding(selectedObject.strokeWidth() / 2)
    transformer.update()
    selectedObject.parent.draw()
    updateAttrs()
  }

  const onChangeRectBorderCornerRadius = (e) => {
    if(e.target.value < 0) return
    const transformer = stage.findOne("#"+selectedObject.id()+"_transformer")
    selectedObject.cornerRadius(+e.target.value)
    transformer.update()
    selectedObject.parent.draw()
    updateAttrs()
  }

  return (
    <AttributeSection>
        <AttributeSection style={{display: "flex", justifyContent: "center", marginTop: 50, flexFlow: "row"}}>
          <InputForm onChange={onChangeRectColor} onClick={() => {}} value={attrs.fill} width={"75px"} height={"40px"} label={"Fyll"} type="color" colorFormat="rgba" />
          <InputForm onChange={onChangeRectBorderColor} value={attrs.stroke} width={"75px"} height={"40px"} label={"Kant"} type="color" colorFormat="rgba"/>
        </AttributeSection>
        <AttributeSection style={{display: "flex", justifyContent: "center", marginTop: 0, flexFlow: "row"}}>
          <InputForm onChange={onChangeRectBorderWidth} value={attrs.strokeWidth} width={"75px"} height={"40px"} label={"Kant"} type="number"/>
          <InputForm onChange={onChangeRectBorderCornerRadius} value={attrs.cornerRadius} width={"75px"} height={"40px"} label={"Radius"} type="number"/>
        </AttributeSection>
    </AttributeSection>
  )
}

function getShapeSizeAttrs(selectedObject) {
  return {...selectedObject.attrs, width: selectedObject.width(), height: selectedObject.height()}
}


function getShapeSizeAttrsScale(selectedObject) {
  return {...selectedObject.attrs, width: selectedObject.width() * selectedObject.scaleX(), height: selectedObject.height() * selectedObject.scaleY()}
}

function ShapeSizeAttributes(props) {
  const { stage, selectedObject } = props
  const [attrs, setAttrs] = useState(() => selectedObject && getShapeSizeAttrs(selectedObject))
  const ts = useRef()





  useEffect(() => {
    const transformer = stage.findOne("#"+selectedObject.id()+"_transformer")
    setAttrs(getShapeSizeAttrsScale(selectedObject, transformer))

    if(ts.current) {
      clearTimeout(ts.current)
      ts.current = null
    }
  
    

    const id = selectedObject.id()
    const shape = selectedObject
    const updateFunc = () => {
      setAttrs(getShapeSizeAttrsScale(selectedObject))

      shape.setAttrs({
        width: Math.max(shape.width() * shape.scaleX(), 5),
        height: Math.max(shape.height() * shape.scaleY(), 5),
        scaleX: 1,
        scaleY: 1,
      });
    }

    shape.on("transform."+id, updateFunc)
    // shape.on("transform."+id,updateFunc)
    shape.dragBoundFunc(updateFunc)

    

    const handleKeyPress = e => {
      if(selectedObject) {
        const node = selectedObject
        let jump = e.shiftKey ? 10 : 1
        if(e.altKey) {
          switch(e.keyCode) {
            case 37: 
              node.width(node.width() - jump) 
              break;
            case 38:
              node.height(node.height() - jump) 
              break;
            case 39: 
              node.width(node.width() + jump) 
              break;
            case 40:
              node.height(node.height() + jump) 
              break;
          }

        } else {
          switch(e.keyCode) {
            case 37: 
              node.x(node.x() - jump) 
              break;
            case 38:
              node.y(node.y() - jump) 
              break;
            case 39: 
              node.x(node.x() + jump) 
              break;
            case 40:
              node.y(node.y() + jump) 
              break;
          }
        }


        if(ts.current) {
          clearTimeout(ts.current)
          ts.current = null
        }

        ts.current = setTimeout(() => {
          selectedObject && transformer.resizeEnabled(true)
          node.parent.draw()
        }, 500)

        transformer.resizeEnabled(false)

        node.parent.draw()
        updateFunc()
      }
    }

    window.document.addEventListener("keydown", handleKeyPress)

    return () => {
      shape.off("transform."+id)
      shape.dragBoundFunc(null)
      window.document.removeEventListener("keydown", handleKeyPress)
    }
  },[selectedObject.id()])
  
  const updateAttrs = useCallback(() => {
    setAttrs(getShapeSizeAttrs(selectedObject))
  }, [selectedObject.id()])
  
  const onChangeWidth = useCallback((e) => {
    if(e.target.value < -1) return
    selectedObject.width(+e.target.value)
    selectedObject.scaleY(1)
    selectedObject.scaleX(1)
    selectedObject.parent.draw()
    updateAttrs()
  },[selectedObject.id()])

  const onChangeHeight = useCallback((e) => {
    if(+e.target.value < -1) return
    selectedObject.height(+e.target.value)
    selectedObject.scaleY(1)
    selectedObject.scaleX(1)
    selectedObject.parent.draw()
    updateAttrs()
  },[selectedObject.id()])

  const onChangeX = useCallback((e) => {
    if(+e.target.value < -1) return
    selectedObject.x(+e.target.value)
    selectedObject.parent.draw()
    updateAttrs()
  },[selectedObject.id()])

  const onChangeY = useCallback((e) => {
    if(e.target.value < -1) return
    selectedObject.y(+e.target.value)
    selectedObject.parent.draw()
    updateAttrs()
  },[selectedObject.id()])

  return (
    <AttributeSection>
        <AttributeSection style={{display: "flex", justifyContent: "center", marginTop: 0, flexFlow: "row"}}>
          <InputForm onChange={onChangeWidth} value={Math.round(attrs.width)} width={"75px"} height={"40px"} style={{fontSize: "14px"}} label={"Bredd"} type="number"/>
          <InputForm onChange={onChangeHeight} value={Math.round(attrs.height)} width={"75px"} height={"40px"} style={{fontSize: "14px"}} label={"Höjd"} type="number"/>
        </AttributeSection>
        <AttributeSection style={{display: "flex", justifyContent: "center", marginTop: 0, flexFlow: "row"}}>
          <InputForm onChange={onChangeX} value={Math.round(attrs.x)} width={"75px"} height={"40px"} style={{fontSize: "14px"}} label={"X"} type="number"/>
          <InputForm onChange={onChangeY} value={Math.round(attrs.y)} width={"75px"} height={"40px"} style={{fontSize: "14px"}} label={"Y"} type="number"/>
        </AttributeSection>
    </AttributeSection>
  )
}


function getDataUrl(img) {

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  canvas.width = img.width;
  canvas.height = img.height;

  ctx.drawImage(img, 0, 0);
  return canvas.toDataURL('image/jpeg');
}


function Stage(props) {
    const [stage, setStage] = useState(null)
    
    const context = useContext(KonvaContext)
    const { store, setSelected, setMode } = context
    const { selected } = store
    const selectedObject = useMemo(() => getSelectedObject(store.selected, stage), [stage, store.selected])
    const currRef = useRef()
    const textboxRef = useRef()
    

    

    useEffect(() => {
      if(stage) {
        stage.on("click.selecting", (e) => {
          if(store.mode === "HAND") {
            setSelected(e.target.id())
          }
        })
      }

      return () => {
        if(stage) {
          stage.off("click.selecting")
        }
      }

    },[stage, store.mode])

    
    const canvasCB = useCallback((ref) => {
      const { attrs={} } = props
      const stage = new Konva.Stage({
        container: ref,
        width: 794,
        // height: 1123,
        height: 150,
        pixelRatio: 4,
        ...attrs
       
      })

      currRef.current = ref
      
      // stage.on("click", (e) => {
      //   setSelected(e.target.id())
      // })

      window.document.addEventListener("click", e => {
        console.log(document.querySelector("#rightside").contains(e.target))
        if(!ref.contains(e.target) && !document.querySelector("#rightside").contains(e.target)) {
          setSelected(null)
        }
      })
  
  
       // add a new feature, lets add ability to draw selection rectangle
     
  
      setStage(stage)
  
    }, [])

    const exportStage = useCallback(
      () => {
        
        let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("width", stage.width() * stage.scaleX())
        svg.setAttribute("height", stage.height() * stage.scaleY())


        let svgNS = svg.namespaceURI;
        let camel = (s) => s.replace(/[A-Z]/g, '-$&').toLowerCase()
        
        function createElement(object) {
            const { attrs, className: type } = object

            let shape = null
            if(type === "Image") {
              shape = document.createElementNS(svgNS, "foreignObject")
            } else if(type === "Line") {
              shape = document.createElementNS(svgNS, "polyline")

            } else {
              shape = document.createElementNS(svgNS, type.toLowerCase())
            }
            
            for(let attr in attrs) {
              if(attr === "points") {
                shape.setAttribute(camel(attr), attrs[attr].join(","))  
              } else {
                shape.setAttribute(camel(attr), attrs[attr])  
              }
            }


            
            
            shape.setAttribute("width", (object.width() * object.scaleX()) )
            shape.setAttribute("height", (object.height() * object.scaleY()))  


            if(type.toLowerCase() === "image") {

              const img = document.createElement("img")

              img.setAttribute("src", getDataUrl(object.attrs.image))

              for(let attr in attrs) {
                img.setAttribute(camel(attr), attrs[attr])  
              }

              img.setAttribute("width", (object.width() * object.scaleX()) )
              img.setAttribute("height", (object.height() * object.scaleY()))
              shape.appendChild(img)
            }
            
            if(type.toLowerCase() === "text") {
              
              shape.setAttribute("y", object.y() + 2)  
              shape.setAttribute("dominant-baseline", "hanging")  
              shape.setAttribute("font-family", object.fontFamily())  
              shape.textContent = object.text()
            }

            if(type === "Line") {
              shape.setAttribute("stroke", "black")  
              shape.setAttribute("fill", "none")  
            }
            
            svg.appendChild(shape);
          }
          
          console.log(stage.toJSON())

        stage.find(".object").forEach(shape => {
          if(shape.className !== "Transformer") {
            createElement(shape)
          }
        })

        let xmlSerializer = new XMLSerializer()
        let svgStr = xmlSerializer.serializeToString(svg)


        document.body.appendChild(svg)

        try {
          navigator.clipboard.writeText(svgStr).then(function() {
            console.log("Copied!")
          })
        } catch(err) {
          console.log(err)
        }

        textboxRef.current.value = svgStr
     
      },
      [stage],
    )
    const moveUp = useCallback(() => {
      if(selected) {
        const node = stage.findOne("#"+selected)
        const trans = stage.findOne("#"+node.id()+"_transformer")
        
        node.moveUp()
        trans && trans.moveUp()
        node.parent.draw()

      }
    },[selected, stage])

    const moveDown = useCallback(() => {
      if(selected) {
        const node = stage.findOne("#"+selected)
        const trans = stage.findOne("#"+node.id()+"_transformer")
        node.moveDown()


        trans && trans.moveDown()
        node.parent.draw()
      }
    },[selected, stage])


    const deleteObject = useCallback(() => {
      if(selected) {
        const node = stage.findOne("#"+selected)
        const trans = stage.findOne("#"+node.id()+"_transformer")
        const layer = node.parent

        trans && trans.detach()
        node.destroy()
        layer.draw()

        if(store.mode === "SIGNATURE") {
          setModeHand()
        }

      }
    },[selected, stage, store.mode])


  
      
    const setModeHand = useCallback(() => {
      setMode("HAND")
    },[])

    const setModeSignature = useCallback(() => {
      setMode("SIGNATURE")
    },[])

    const setModeText = useCallback(() => {
      setMode("TEXT")
    },[])

  
    const setModeRect = useCallback(() => {
      setMode("RECT")
    },[])


    const setModeImage = useCallback(() => {
      setMode("IMAGE")
    },[])



   


    return (
      <>
      <StageContainer>
        <NavContainer>
            <NavButton onClick={exportStage}><Icon type="fas fa-download" size="20px"/></NavButton>
            <div style={{margin: "0 50px"}}></div>
            <NavButton onClick={setModeHand} isSelected={store.mode === "HAND"}>
              <CursorIcon fill={store.mode === "HAND" ? "#579aff" : "#828282"}/>
              {/* <Icon type="fas fa-hand-paper" size="20px"/> */}
            </NavButton>
            <NavButton onClick={setModeSignature} isSelected={store.mode === "SIGNATURE"}><Icon type="fas fa-signature" size="20px"/></NavButton>
            <NavButton  style={{width: 40, height: 40}} onClick={setModeText} isSelected={store.mode === "TEXT"}> <h3>T</h3>  </NavButton>
            <NavButton onClick={setModeRect} isSelected={store.mode === "RECT"}><Icon type="fas fa-vector-square" size="20px"/></NavButton>
            <div style={{margin: "0 50px"}}></div>
            <NavButton onClick={setModeImage} isSelected={store.mode === "IMAGE"}><Icon type="fas fa-images" size="20px"/></NavButton>
            <div style={{margin: "0 50px"}}></div>
            <div style={{margin: "0 20px"}}></div>
            
        </NavContainer>



        <LeftSide></LeftSide>

        <CanvasWrapper ref={canvasCB} id="canvas">
          {stage && props.children && Array.isArray(props.children) && props.children.map(struct => {
            return <Structure {...struct} stage={stage} />
          })}
        </CanvasWrapper>

        <div style={{margin: "auto"}}>
          <textarea type="text" style={{ width: "300px", height: "200px", border: "1px solid rgba(0,0,0,0.3)", outline: "none", resize: "none", borderRadius: 3}} width="200px"  ref={textboxRef}/>
        </div>

        <RightSide id="rightside">
          <SideMenu>
            <SideMenuHeader>
              <h2>
                {DisplayText(selectedObject, stage)}
              </h2>
            </SideMenuHeader>
            <SideMenuParameters>
               {selectedObject && <ShapeSizeAttributes selectedObject={selectedObject} stage={stage}/>}
               {selectedObject && selectedObject.className === "Text" && <TextFormAttributes selectedObject={selectedObject} key={selectedObject.id()} stage={stage}/>}
               {selectedObject && selectedObject.className === "Rect" && <RectFormAttributes selectedObject={selectedObject} stage={stage}/>}
               {selectedObject && (
                <AttributeSection style={{display: "flex", justifyContent: "center", marginTop: 50, flexFlow: "row"}}>
                        <NavButton onClick={moveUp} style={{padding: 7, width: 50}}><Icon type="fas fa-angle-up" size="20px"/></NavButton>
                        <NavButton onClick={moveDown} style={{padding: 7, width: 50}}><Icon type="fas fa-angle-down" size="20px"/></NavButton>
                </AttributeSection>
               )}
               {selectedObject && (
                <AttributeSection style={{display: "flex", justifyContent: "center", marginTop: 30}}>

                  <NavButton style={{margin: 5, width: 150}} onClick={deleteObject}><Icon type="fas fa-trash" style={{color: "#ff3d3d"}} size="20px"/></NavButton>
                </AttributeSection>
               )}
            </SideMenuParameters>
            
          </SideMenu>
        </RightSide>
      </StageContainer>
        </>
    )
  }


  export default Stage



