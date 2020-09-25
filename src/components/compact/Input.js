import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react'
// import Codemirror from 'codemirror/lib/codemirror'
import * as Codemirror from 'codemirror';
import { CodeMirrorWrapper, GlobalStyles } from './styled'
import "codemirror/addon/hint/show-hint" 
import "codemirror/addon/hint/show-hint.css" 

import "codemirror/addon/hint/javascript-hint" 

import "codemirror/addon/hint/anyword-hint" 


import "codemirror/mode/javascript/javascript" 
import "codemirror/mode/markdown/markdown" 

import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/monokai.css'

import 'codemirror/mode/htmlmixed/htmlmixed'

import Beautify from 'js-beautify'






function CodeMirror(props) {
    const [codem, setState] = useState(null)
    const codemirrorRef = useRef()

    useEffect(() => {
        if (codemirrorRef.current) {
            var comp = [
                ["here", "hither"],
                ["asynchronous", "nonsynchronous"],
                ["completion", "achievement", "conclusion", "culmination", "expirations"],
                ["hinting", "advive", "broach", "imply"],
                ["function", "action"],
                ["provide", "add", "bring", "give"],
                ["synonyms", "equivalents"],
                ["words", "token"],
                ["each", "every"],
            ]

            function synonyms(cm, option) {

                return new Promise(function (accept) {
                    setTimeout(function () {
                        var cursor = cm.getCursor(), line = cm.getLine(cursor.line)
                        var start = cursor.ch, end = cursor.ch
                        while (start && /\w/.test(line.charAt(start - 1))) --start
                        while (end < line.length && /\w/.test(line.charAt(end))) ++end
                        var word = line.slice(start, end).toLowerCase()
                        for (var i = 0; i < comp.length; i++) if (comp[i].indexOf(word) != -1)
                        
                            return accept({
                                list: comp[i],
                                from: Codemirror.Pos(cursor.line, start),
                                to: Codemirror.Pos(cursor.line, end),
                                className: "codemirror-custom-hints",
                            })
                        return accept(null)
                    }, 100)
                })
            }

        
            const cm = Codemirror(codemirrorRef.current, {
                value: "",
                extraKeys: { "Ctrl-Space": "autocomplete" },
                lineWrapping: true,
                mode:  "htmlmixed",
                htmlMode: true,
                theme: 'monokai'
            })

            Codemirror.commands.autocomplete = function (cm) {
                cm.showHint({ hint: synonyms });
            }

            cm.on("keyup", function (editor) {
                let containerShowHint = document.body;
                if (!editor.state.completionActive) {
                    Codemirror.commands.autocomplete(editor, null, {completeSingle: false, container: containerShowHint, });
                }
            });
       
            setState(cm)
        }
    }, [])


    useEffect(() => {
        if (!codem) return

        if(props.text) {
            const doc = codem.getDoc()
            codem.replaceRange(Beautify.html(props.text, { indent_size: 2 }), { line: 0, ch: 0}, { line: doc.lineCount()})
        }

    }, [codem, props.text])


    return (
        <div>
            <GlobalStyles/>
            <CodeMirrorWrapper id="codemirror" ref={codemirrorRef} />
        </div>
    )
}


export default CodeMirror




