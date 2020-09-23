


export function getBoundingBoxes(node) {
    const rect = node
    const x = rect.x
    const y = rect.y
    const xWidth = x + rect.width
    const yHeight = y + rect.height

    return {
        ...rect,
        x,
        y,
        xWidth,
        yHeight
    }
}

export function isOnLeftSide(dbox, obox, margin) {

    /** 
      *0,0____________________________________X
      * |                
      * |                
      * |                               
      * |               
      * |           ____         ____   
      * |          |obox|       |dbox|
      * |          |____|       |____|
      * |               
      * |               
      * |               
      * |               
      * Y
      */
    if (dbox.x >= obox.xWidth - margin && (
        (dbox.y >= obox.y) &&
        (dbox.y <= obox.yHeight + margin) ||
        (obox.y - margin <= dbox.yHeight && obox.yHeight >= dbox.yHeight) ||
        (obox.y >= dbox.y && obox.yHeight <= dbox.yHeight)
    )) {
        return true
    } else {
        return false
    }
}

export function isOnRightSide(dbox, obox, margin) {

    /** 
      *0,0____________________________________X
      * |
      * |                       |
      * |                       |
      * |           ____        |____   
      * |          |dbox|       |obox|
      * |          |____|       |____|
      * |                       |
      * |                       |  
      * |                       |  
      * |                       | dbox.xWidth <= obox.x + (margin is used to contract the Y line that detects objects and classifies them as "objects to the right side of dragging object")
      * |                  
      * |                  
      * Y
      */
    if (dbox.xWidth <= obox.x + margin && (
        (dbox.y >= obox.y) &&
        (dbox.y <= obox.yHeight + margin) ||
        (obox.y - margin <= dbox.yHeight && obox.yHeight >= dbox.yHeight) ||
        (obox.y >= dbox.y && obox.yHeight <= dbox.yHeight)
    )) {
        return true
    } else {
        return false
    }
}

export function isOnTopSide(dbox, obox, margin) {

    /**
      *0,0____________________________________X
      * |
      * |           ____
      * |          |obox|
      * | _ _ _ _ _|____|_ _ _ _ _ dbox.y >= obox.yHeight - (margin is used to contract the Y line that detects objects and classifies them as "objects above dragging object")
      * |       
      * |
      * |           ____
      * |          |dbox|
      * |          |____|
      * |
      * |
      * |
      * Y
      */
    if (dbox.y >= obox.yHeight - margin && (
        (dbox.x >= obox.x && dbox.x <= obox.xWidth + margin) ||
        (obox.x - margin <= dbox.xWidth && obox.xWidth >= dbox.xWidth) ||
        (obox.x >= dbox.x && obox.xWidth <= dbox.xWidth)
    )) {
        return true
    } else {
        return false
    }
}

export function isOnBottomSide(dbox, obox, margin) {


    /**
     *  
      *0,0____________________________________X
      * |
      * |           ____
      * |          |dbox|
      * |          |____|
      * |       
      * |
      * | _ _ _ _ _ ____ _ _ _ _ _ dbox.yHeight <= obox.y + (margin is used to extend the Y line that detects objects and classifies them as "objects below dragging object")
      * |          |obox|
      * |          |____|
      * |
      * |
      * |
      * Y
      */
    if (dbox.yHeight <= obox.y + margin && (
        (dbox.x >= obox.x && dbox.x <= obox.xWidth + margin) ||
        (obox.x - margin <= dbox.xWidth && obox.xWidth >= dbox.xWidth) ||
        (obox.x >= dbox.x && obox.xWidth <= dbox.xWidth)
    )) {
        return true
    } else {
        return false
    }
}


