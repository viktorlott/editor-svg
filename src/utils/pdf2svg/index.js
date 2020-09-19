import pdfDoc from '../../spcmanual.pdf'

const pdfjsLib = require("pdfjs-dist/lib/pdf")

// Some PDFs need external cmaps.
const CMAP_URL = "node_modules/pdfjs-dist/cmaps/";
const CMAP_PACKED = true;

var url = 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/examples/learning/helloworld.pdf';


window.pdfjsLib = pdfjsLib

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.js`;



class PDF2SVG {
    constructor(data) {
        this.data = new Uint8Array(data)
    }

    static from(data) {
        const pdf = new PDF2SVG(data)
        const loadingTask = pdf.loadDocument()
        console.log(loadingTask)
        return pdf.extractSVG(loadingTask)

    }

    loadDocument() {
        return pdfjsLib.getDocument({
            url: pdfDoc,
            cMapUrl: CMAP_URL,
            cMapPacked: CMAP_PACKED,
            fontExtraProperties: true,
          })
    }

    loadPage(doc, pageNum) {
        return doc.getPage(pageNum).then(page => {
            console.log("# Page " + pageNum)
            let viewport = page.getViewport({ scale: 1.0 })
            console.log("Size: " + viewport.width + "x" + viewport.height)
            console.log()
    
            return page.getOperatorList().then(opList => {
                let svgGfx = new pdfjsLib.SVGGraphics(page.commonObjs, page.objs)
                svgGfx.embedFonts = true
                return svgGfx.getSVG(opList, viewport).then(svg => {
                    return this.writeSvgToFile(svg, pageNum)
                })
            })
        })
    }

    async extractSVG(loadingTask) {
        return loadingTask.promise.then(doc => {

            console.log(doc)
            let numPages = doc.numPages;
            console.log("# Document Loaded");
            console.log("Number of Pages: " + numPages);
            console.log();
        
            let lastPromise = Promise.resolve(); 
          
            for (let i = 1; i <= numPages; i++) {
                lastPromise = lastPromise.then(this.loadPage.bind(this, doc, i));
            }
            return lastPromise;
        })

    }

    writeSvgToFile(svgElement, pageNum) {
        console.log(svgElement)
        return svgElement
    }

}


export default PDF2SVG

