import React, { useEffect, useRef, useState, useCallback, useContext, useMemo, createContext, useReducer, forwardRef } from 'react'
import Konva from 'konva';
import Structure from './Structure'
import KonvaContext from '../context/konvacontext'


function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}


const HiddenInput = forwardRef((props, ref) => <input type="file" ref={ref} style={{ display: "none" }} {...props} />)
//   function ImportImage(props) {
//     const { stage } = props
//     const hiddenInputRef = useRef()

//     const onImageUpload = useCallback((e) => {
//       const { files } = e.target
//       if(files && files.length) {
//         image.src = window.URL.createObjectURL(files[0])
//       }

//     }, [stage]) 

//     const uploadImage = useCallback(() => {
//         hiddenInputRef.current.click()
//     },[stage])


//     return (
//       <NavButton onClick={uploadImage}>
//         <Icon type="fas fa-images" size="20px"/>
//         <HiddenInput ref={hiddenInputRef} onChange={onImageUpload} accept={"image/png, image/jpeg"} />
//       </NavButton>
//     )
//   }


function getCrop(image, size, clipPosition = 'center-middle') {
    const width = size.width;
    const height = size.height;
    const aspectRatio = width / height;

    let newWidth;
    let newHeight;

    const imageRatio = image.width / image.height;

    if (aspectRatio >= imageRatio) {
        newWidth = image.width;
        newHeight = image.width / aspectRatio;
    } else {
        newWidth = image.height * aspectRatio;
        newHeight = image.height;
    }

    let x = 0;
    let y = 0;
    if (clipPosition === 'left-top') {
        x = 0;
        y = 0;
    } else if (clipPosition === 'left-middle') {
        x = 0;
        y = (image.height - newHeight) / 2;
    } else if (clipPosition === 'left-bottom') {
        x = 0;
        y = image.height - newHeight;
    } else if (clipPosition === 'center-top') {
        x = (image.width - newWidth) / 2;
        y = 0;
    } else if (clipPosition === 'center-middle') {
        x = (image.width - newWidth) / 2;
        y = (image.height - newHeight) / 2;
    } else if (clipPosition === 'center-bottom') {
        x = (image.width - newWidth) / 2;
        y = image.height - newHeight;
    } else if (clipPosition === 'right-top') {
        x = image.width - newWidth;
        y = 0;
    } else if (clipPosition === 'right-middle') {
        x = image.width - newWidth;
        y = (image.height - newHeight) / 2;
    } else if (clipPosition === 'right-bottom') {
        x = image.width - newWidth;
        y = image.height - newHeight;
    } else if (clipPosition === 'scale') {
        x = 0;
        y = 0;
        newWidth = width;
        newHeight = height;
    } else {
        console.error(
            new Error('Unknown clip position property - ' + clipPosition)
        );
    }

    return {
        cropX: x,
        cropY: y,
        cropWidth: newWidth,
        cropHeight: newHeight,
    };
}

// function to apply crop
function applyCrop(pos, img, layer) {
    // const img = layer.findOne('.image');
    img.setAttr('lastCropUsed', pos);
    const crop = getCrop(
        img.image(),
        { width: img.width(), height: img.height() },
        pos
    );
    img.setAttrs(crop);
    layer.draw();
}

const createDataURL = file => window.URL.createObjectURL(file)

function DrawShape(props) {
    const { layer, stage } = props

    const context = useContext(KonvaContext)
    const { store, setSelected, setMode } = context
    const [shapes, setShapes] = useState([])

    const hiddenInputRef = useRef()
    const imageFileRef = useRef()

    // const selectionRectangle = useMemo(() => {
    //     const selectionRectangle =  new Konva.Rect({
    //         fill: 'rgba(0,0,255,0.5)',
    //       });
    //       layer.add(selectionRectangle)
    //       selectionRectangle.moveToTop()

    //       return selectionRectangle
    // },[])



    useEffect(() => {
        stage.find(".selecting").forEach(e => e.destroy())
        if (store.mode === "HAND") return
        let x1, y1, x2, y2;


        if (store.mode === "IMAGE") {
            hiddenInputRef.current.click()
        }

        const attrs = store.mode === "TEXT" || store.mode === "IMAGE" ? { 
            stroke: '#0099ff',
            strokeWidth: 1,
            fill: 'transparent'
        } : { 
            fill: 'black'
         }

         console.log("store", store.mode)
        const selectionRectangle = new Konva.Rect({
            ...attrs,
            name: "selecting"
        })

        layer.add(selectionRectangle)
        selectionRectangle.moveToTop()

        stage.on('mousedown touchstart', (e) => {
            // do nothing if we mousedown on eny shape

            // selectionRectangle.attrs.fill = getRandomColor()


            if (e.target !== stage) {
                return;
            }


            x1 = stage.getPointerPosition().x;
            y1 = stage.getPointerPosition().y;
            x2 = stage.getPointerPosition().x;
            y2 = stage.getPointerPosition().y;

            // selectionRectangle.fill("transparent")
            selectionRectangle.visible(true);
            selectionRectangle.width(0);
            selectionRectangle.height(0);
            selectionRectangle.moveToTop()
            layer.draw();
        });

        stage.on('mousemove touchmove', () => {
            // no nothing if we didn't start selection
            if (!selectionRectangle.visible()) {
                return;
            }
            x2 = stage.getPointerPosition().x;
            y2 = stage.getPointerPosition().y;

            selectionRectangle.setAttrs({
                x: Math.min(x1, x2),
                y: Math.min(y1, y2),
                width: Math.abs(x2 - x1),
                height: Math.abs(y2 - y1),
            });
            layer.batchDraw();
        });

        stage.on('mouseup touchend', () => {
            // no nothing if we didn't start selection

            if (!selectionRectangle.visible()) {
                return;
            }
            // update visibility in timeout, so we can check it in click event
            setTimeout(() => {
                selectionRectangle.visible(false);
                layer.batchDraw();
            })


            if (x1 === x2 && y1 === y2) return


            let shape = null
            if (store.mode === "TEXT") {
                const text = new Konva.Text({ width: selectionRectangle.width(), x: selectionRectangle.x(), y: selectionRectangle.y(), fontSize: 24, fill: "black", enabledAnchors: ['middle-left', 'middle-right'] })
                text.fontSize(24)
                // text.text("Skriv här..")
                

                shape = JSON.parse(text.toJSON())
            } else if (store.mode === "IMAGE") {

                let imageObj = new Image()
                imageObj.onload = function () {
                    const img = new Konva.Image({
                        height: selectionRectangle.height(),
                        width: selectionRectangle.width(),
                        x: selectionRectangle.x(),
                        y: selectionRectangle.y(),
                        name: 'object',
                        draggable: true,
                        id: Math.random().toString(36).substring(2)
                    })

                    const image = JSON.parse(img.toJSON())


                    image.attrs.image = imageObj

                    setShapes(prev => [...prev, image])
                };
                imageObj.src = createDataURL(imageFileRef.current)
                return

            } else {
                shape = JSON.parse(selectionRectangle.toJSON())
            }


            shape.attrs.draggable = true
            shape.attrs.name = "object"
            shape.attrs.id = Math.random().toString(36).substring(2)


            setShapes(prev => [...prev, shape])






            layer.batchDraw();
        })

        return () => {
            stage.off("mousedown touchstart")

            stage.off("mousemove touchmove")

            stage.off("mouseup touchend")
        }
    }, [store.mode])


    const onImageUpload = useCallback((e) => {
        const { files } = e.target
        if (files && files.length) {
            imageFileRef.current = files[0]
        }
    }, [stage])



    return (
        <>
            <HiddenInput ref={hiddenInputRef} onChange={onImageUpload} accept={"image/*"} />
            {shapes.map(struct => <Structure {...struct} layer={layer} struct={struct} stage={stage} />)}
        </>
    )
}

export default DrawShape