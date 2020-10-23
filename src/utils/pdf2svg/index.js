// import pdfDoc from '../../spcmanual.pdf'
import { SVG, Box, Element, G, extend, off, on } from '@svgdotjs/svg.js'


const pdfjsLib = require("pdfjs-dist/lib/pdf")
const pdfjsViewer = require("pdfjs-dist/lib/web/pdf_viewer")

const { pdfData, pdfData_v1, pdf } = require('./examplePDF')
const { parse, stringify } = require('svgson')
// Some PDFs need external cmaps.
const CMAP_URL = "node_modules/pdfjs-dist/cmaps/";
const CMAP_PACKED = true;


const fabric = require("fabric")
const draw = SVG("drawing")

var url = 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/examples/learning/helloworld.pdf';





window.pdfjsLib = pdfjsLib
window.pdfjsViewer = pdfjsViewer

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.js`;


var SVG_NS = "http://www.w3.org/2000/svg";




const getCoordsFromEvent = ev => {
  if (ev.changedTouches) {
    ev = ev.changedTouches[0]
  }
  return { x: ev.clientX, y: ev.clientY }
}

// Creates handler, saves it
class DragHandler {
  constructor (el) {
    el.remember('_draggable', this)
    this.el = el

    this.drag = this.drag.bind(this)
    this.startDrag = this.startDrag.bind(this)
    this.endDrag = this.endDrag.bind(this)
  }

  // Enables or disabled drag based on input
  init (enabled) {
    if (enabled) {
      this.el.on('mousedown.drag', this.startDrag)
      this.el.on('touchstart.drag', this.startDrag, { passive: false })
    } else {
      this.el.off('mousedown.drag')
      this.el.off('touchstart.drag')
    }
  }

  // Start dragging
  startDrag (ev) {
    const isMouse = !ev.type.indexOf('mouse')

    // Check for left button
    if (isMouse && ev.which !== 1 && ev.buttons !== 0) {
      return
    }

    // Fire beforedrag event
    if (this.el.dispatch('beforedrag', { event: ev, handler: this }).defaultPrevented) {
      return
    }

    // Prevent browser drag behavior as soon as possible
    ev.preventDefault()

    // Prevent propagation to a parent that might also have dragging enabled
    ev.stopPropagation()

    // Make sure that start events are unbound so that one element
    // is only dragged by one input only
    this.init(false)

    this.box = this.el.bbox()
    this.rect = this.el.node.getClientRects().item(0)
    this.coords = getCoordsFromEvent(ev)

    // this.coords.y = this.coords.y - this.rect.height
    
    this.lastClick = this.el.point(this.coords)


    const eventMove = (isMouse ? 'mousemove' : 'touchmove') + '.drag'
    const eventEnd = (isMouse ? 'mouseup' : 'touchend') + '.drag'

    // Bind drag and end events to window
    on(window, eventMove, this.drag, this, { passive: false })
    on(window, eventEnd, this.endDrag, this, { passive: false })

    // Fire dragstart event
    this.el.fire('dragstart', { event: ev, handler: this, box: this.box })
  }

  // While dragging
  drag (ev) {
    const { box, lastClick } = this

    const currentClick = this.el.point(getCoordsFromEvent(ev))
    const currentCoords = getCoordsFromEvent(ev)
    const currentTranslate = this.el.transform()


    const dx = currentClick.x - lastClick.x
    const dy = currentClick.y - lastClick.y
    // console.log("--->  ssws", currentTranslate)
    
    // const dx =  currentCoords.x - this.coords.x
    // const dy =  currentCoords.y - this.coords.y


    // const dx =  this.coords.x - 
    // const dy =  this.coords.y - 

    this.lastClick = currentClick
    this.coords = currentCoords

    if (!dx && !dy) return box



    const x = box.x + dx
    const y = box.y + dy

    // this.box = new Box(x, y, box.w, box.h)

    if (
      this.el.dispatch('dragmove', {
        event: ev,
        handler: this,
        // box: this.box
      }).defaultPrevented
    ) {
      return
    }

    this.move(x, y)

    // this.el.translate(x, y)
  }

  move (x, y) {
    // Svg elements bbox depends on their content even though they have
    // x, y, width and height - strange!
    // Thats why we handle them the same as groups
    if (this.el.type === 'svg') {
      G.prototype.move.call(this.el, x, y)
    } else {
        
    //   this.el.translate(x, y)
      this.el.move(x, y)
    }
  }

  endDrag (ev) {
    // final drag
    this.drag(ev)

    // fire dragend event
    this.el.fire('dragend', { event: ev, handler: this, box: this.box })

    // unbind events
    off(window, 'mousemove.drag')
    off(window, 'touchmove.drag')
    off(window, 'mouseup.drag')
    off(window, 'touchend.drag')

    // Rebind initial Events
    this.init(true)
  }
}


extend(Element, {
    draggable (enable = true) {
    const dragHandler = this.remember('_draggable') || new DragHandler(this)
    dragHandler.init(enable)
    return this
    }
})
// var container = document.createElement("div");



// document.body.append(container)

// var eventBus = new pdfjsViewer.EventBus();

// // (Optionally) enable hyperlinks within PDF files.
// var pdfLinkService = new pdfjsViewer.PDFLinkService({
//   eventBus: eventBus,
// });

// var pdfViewer = new pdfjsViewer.PDFViewer({
//   container: container,
//   eventBus: eventBus,
//   linkService: pdfLinkService,
//   renderer: "svg",
//   textLayerMode: 0,
// });
// pdfLinkService.setViewer(pdfViewer);

// eventBus.on("pagesinit", function () {
//   // We can use pdfViewer now, e.g. let's change default scale.
//   pdfViewer.currentScaleValue = "page-width";
// });

// // Loading document.
// var loadingTask = pdfjsLib.getDocument({
//   data: pdfData_v1,
//   cMapUrl: CMAP_URL,
//   cMapPacked: CMAP_PACKED,
// });
// loadingTask.promise.then(function (pdfDocument) {
//   // Document loaded, specifying document for the viewer and
//   // the (optional) linkService.
//   pdfViewer.setDocument(pdfDocument);

//   pdfLinkService.setDocument(pdfDocument, null);
// });

class PDF2SVG {
    constructor(data) {
        this.data = new Uint8Array(data)
    }

    static from(data) {
        const pdf = new PDF2SVG(data)
        const loadingTask = pdf.loadDocument(pdf)
        return pdf.extractSVG(loadingTask)

    }

    loadDocument(_) {
        return pdfjsLib.getDocument({
            data: pdfData_v1,
            cMapUrl: CMAP_URL,
            cMapPacked: CMAP_PACKED,
            fontExtraProperties: true,
            disableFontFace: false,
        })
    }

    loadPage(pageNum) {
        return new Promise(async resolve => {
            const loadingTask = this.loadDocument()
            const doc = await loadingTask.promise
            const page = await doc.getPage(pageNum)
            console.log("# Page " + pageNum)
            let viewport = page.getViewport({ scale: 1.4 })
            console.log("Size: " + viewport.width + "x" + viewport.height)
            const textContent = await page.getTextContent()

            const opList = await page.getOperatorList()

            let svgGfx = new pdfjsLib.SVGGraphics(page.commonObjs, page.objs)
            svgGfx.embedFonts = true

            try {
                const textSvg = this.buildTextSVG(viewport, textContent)
                const svg = await svgGfx.getSVG(opList, viewport)

                this.writeSvgToFile(svg, pageNum, resolve, textSvg)
            } catch(err) {
                console.log(err)
                resolve(err)
            }
        })
    }

    buildTextSVG(viewport, textContent) {
        // Building SVG with size of the viewport (for simplicity)
        var svg = document.createElementNS(SVG_NS, "svg:svg");
        svg.setAttribute("width", viewport.width + "px");
        svg.setAttribute("height", viewport.height + "px");
        // items are transformed to have 1px font size
        svg.setAttribute("font-size", 1);
      
        // processing all items
        console.log(textContent)
        textContent.items.forEach(function (textItem) {
          // we have to take in account viewport transform, which includes scale,
          // rotation and Y-axis flip, and not forgetting to flip text.
          var tx = pdfjsLib.Util.transform(
            pdfjsLib.Util.transform(viewport.transform, textItem.transform),
            [1, 0, 0, -1, 0, 0]
          );
          var style = textContent.styles[textItem.fontName];
          // adding text element
          var text = document.createElementNS(SVG_NS, "svg:text");
          text.setAttribute("transform", "matrix(" + tx.join(" ") + ")");
          text.setAttribute("font-family", style.fontFamily);
          text.textContent = textItem.str;
          svg.appendChild(text);
        });
        return svg;
      }

    delay(ms) {
        return new Promise(resolve => {
            setTimeout(resolve, ms)
        })
    } 
    async extractSVG(loadingTask) {
        return loadingTask.promise.then(async doc => {

            console.log(doc)
            let numPages = doc.numPages;
            console.log("# Document Loaded");
            console.log("Number of Pages: " + numPages);

            let lastPromise = Promise.resolve();


            for (let i = 1; i <= numPages; i++) {
                await this.loadPage(i)
            }

            return lastPromise;
        })

    }

    writeSvgToFile(svgElement, pageNum, resolve, textSvg) {
        const s = new XMLSerializer();
        const svgStr = s.serializeToString(svgElement)
        // console.log(svgStr)
          // const fab = new fabric()
        // fabric.fabric.loadSVGFromString(svgStr, function(objects) {
        //    console.log(objects)
        // })
        // const str = svgStr.replace(/svg:|:svg/gi, "")
        const id = `pdf_page_${pageNum}`
        const id_text = `text_page_${pageNum}`

        svgElement.id = id

        textSvg.id = id_text

        // const test = draw.svg(str)

        // console.log(textSvg)


        const defs = svgElement.querySelectorAll("defs")
        const group = svgElement.querySelectorAll("svg > g")

        // console.log(defs, group, {svgElement})
       

        const div = document.createElement("div")

        div.style.position = "relative"

        const textDiv = document.createElement("div")

        // textDiv.setAttribute("contenteditable", true)

        textDiv.style.position = "absolute"
        textDiv.style.left = "0"
        textDiv.style.top = "0"
        textDiv.style.display = "none"


        textDiv.appendChild(textSvg)

        div.appendChild(svgElement)

        div.appendChild(textDiv)



       

        document.body.appendChild(div)

        // const map = SVG.get(id)

        const pdf_container = SVG("#"+id)

        const text_container = SVG("#"+id_text)

        
        // .each(el => {


        //     const element = new Element(el.node)


        //     console.log(element)
        //     element.draggable()

        //     element.css("cursor", "default")

        // })

        const handleDraggable = el => {
            const parent = new G(el.parent().node)
            const element = new Element(el.node)

            const bbox = element.bbox()
            const draw = SVG()

            const rect = draw.rect(bbox.w, bbox.h)

            rect.attr({ 
                "fill": "transparent", 
                "stroke": "transparent", 
                "stroke-width": 1
            })

            rect.move(bbox.x, bbox.y)
            parent.add(rect)

            console.log(parent)

            // parent.add(rect)

            // const rect = pdf_container.rect(bbox.w, bbox.h).attr({ fill: '#f06' })

            // parent.attr()

            // console.log(element.parent(), el.parent())

            parent.on("mouseover", e => {
                rect.attr({ "stroke": "#0099ff" })  
            })

            parent.on("mouseout", e => {
                rect.attr({ "stroke": "transparent" })
            })

            // console.log(element)
            element.draggable()

            element.css("cursor", "default")
        }



        text_container.find("text").hide()
        pdf_container.find("text").each(handleDraggable)
        pdf_container.find('path[fill!="none"]').each(el => {
            console.log("--->", el)
        })
        // pdf_container.find("path").each(handleDraggable)


        window[id] = pdf_container

        console.log(pdf_container)

        resolve(svgElement)
    }

}



PDF2SVG.from(url)

export default PDF2SVG


