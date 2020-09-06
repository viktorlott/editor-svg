
import React, { useEffect, useRef, useState, useCallback, useContext, useMemo, createContext, useReducer, } from 'react'
import Konva from 'konva';
import useTransformer from '../hooks/useTransformer'
import getDragDirection from '../utils/getDragDirection'
import KonvaContext from '../context/konvacontext'
import Structure from './Structure'


function Text(props) {
    const { attrs, layer, stage } = props
  
    // const transform =  useMemo(() => new Konva.Transformer(), [])  
  
    const text = useMemo(() => {
        const textNode = new Konva.Text(attrs);
        textNode.placeholder = "Skriv text här"
        return textNode
    }, [])
  
  
    // const [structures, updateStore] = useStructureStore(text)
  
    const transform = useTransformer(text, layer, stage, { 
      enabledAnchors: ['middle-left', 'middle-right'],
      boundBoxFunc: (oldBox, newBox) => {
        if (newBox.width < 100) {
          return oldBox;
        }
        return newBox;
      }
     })
  
    useEffect(() => {

      // console.log(text.data())
      text.on('transform', (e) => {
  
        text.setAttrs({
          width: Math.max(text.width() * text.scaleX(), 100),
          scaleX: 1,
          scaleY: 1,
          
        });
      
  
      })
  
      text.on('dblclick', () => {
        // hide text node and transformer:
        text.hide();
        // transform.hide();
        layer.draw();
  
        // create textarea over canvas with absolute position
        // first we need to find position for textarea
        // how to find it?
  
        // at first lets find position of text node relative to the stage:
        let textPosition = text.absolutePosition();
  
        // then lets find position of stage container on the page:
        let stageBox = stage.container().getBoundingClientRect();
  
        // so position of textarea will be the sum of positions above:
        let areaPosition = {
          x: stageBox.left + textPosition.x,
          y: stageBox.top + textPosition.y,
        };
  
        // create textarea and style it
        let textarea = document.createElement('textarea');
        document.body.appendChild(textarea);
  
        let isFirefox =
          navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
  
        let isChrome =
          navigator.userAgent.toLowerCase().indexOf('chrome') > -1;
  
        // apply many styles to match text on canvas as close as possible
        // remember that text rendering on canvas and on the textarea can be different
        // and sometimes it is hard to make it 100% the same. But we will try...
        textarea.value = text.text();
        textarea.style.position = 'absolute';
        textarea.style.top = (isChrome ? (areaPosition.y + 2) : areaPosition.y) + 'px';
        textarea.style.left = (isChrome ? (areaPosition.x + 1) : areaPosition.x) + 'px';
        textarea.style.width = text.width() - text.padding() * 2 + 'px';
        textarea.style.height =
          text.height() - text.padding() * 2 + 'px';
        textarea.style.fontSize = text.fontSize() + 'px';
        textarea.style.border = 'none';
        textarea.style.padding = '0px';
        textarea.style.margin = '0px';
        textarea.style.float = "left"
        textarea.style.overflow = 'hidden';
        textarea.style.background = 'none';
        textarea.style.outline = 'none';
        textarea.style.resize = 'none';
        textarea.style.lineHeight = text.lineHeight();
        textarea.style.fontFamily = text.fontFamily();

        textarea.style.transformOrigin = 'left top';
        textarea.style.textAlign = text.align();
        textarea.style.color = text.fill();
        let rotation = text.rotation();
        let transform = '';
        if (rotation) {
          transform += 'rotateZ(' + rotation + 'deg)';
        }
  
        let px = 0;
        // also we need to slightly move textarea on firefox
        // because it jumps a bit
        
        if (isFirefox) {
          px += 2 + Math.round(text.fontSize() / 20);
        }
  
        if (isChrome) {
          px += 2 + Math.round(text.fontSize() / 20);
        }
  
        transform += 'translateY(-' + px + 'px)';
  
        textarea.style.transform = transform;
  
        // reset height
        textarea.style.height = 'auto';
        // after browsers resized it we can set actual value
        textarea.style.height = textarea.scrollHeight + 3 + 'px';
  
        textarea.focus();
  
        function removeTextarea() {
          textarea.parentNode.removeChild(textarea);
          window.removeEventListener('click', handleOutsideClick);
          text.show();
          // transform.show();
          // transform.forceUpdate();
          layer.draw();
        }
  
        function setTextareaWidth(newWidth) {
          if (!newWidth) {
            // set width for placeholder
            newWidth = text.placeholder.length * text.fontSize();
          }
          // some extra fixes on different browsers
          let isSafari = /^((?!chrome|android).)*safari/i.test(
            navigator.userAgent
          );
          let isFirefox =
            navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
          if (isSafari || isFirefox) {
            newWidth = Math.ceil(newWidth);
          }
  
          let isEdge =
            document.documentMode || /Edge/.test(navigator.userAgent);
          if (isEdge) {
            newWidth += 1;
          }
          textarea.style.width = newWidth + 'px';
        }
  
        textarea.addEventListener('keydown', function (e) {
          
          // hide on enter
          // but don't hide on shift + enter
          if (e.keyCode === 13 && !e.shiftKey) {
            if(textarea.value === "" ) {
              text.destroy()
            } else {
              text.text(textarea.value);
            }

  
            removeTextarea();
          }
          // on esc do not set value back to node
          if (e.keyCode === 27) {
            removeTextarea();
          }

        });

  
        textarea.addEventListener('keydown', function (e) {
          let scale = text.getAbsoluteScale().x;
          setTextareaWidth(text.width() * scale);
          textarea.style.height = 'auto';
          textarea.style.height =
            textarea.scrollHeight + text.fontSize() + 'px';

        
        });
  
        function handleOutsideClick(e) {
          if (e.target !== textarea) {
            if(textarea.value === "" ) {
              text.destroy()
            } else {
              text.text(textarea.value);
            }
            removeTextarea();
          }
        }
        setTimeout(() => {
          window.addEventListener('click', handleOutsideClick);
        });
      });
      
      text.fire("dblclick")
      
      return () => {
        layer.remove(text)
      }
    },[])
  
  
    if(!props.children || !Array.isArray(props.children)) return null
  
    return props.children.map(struct => {
      return <Structure {...struct} />
    })
  
  }
  
  
  

  export default Text