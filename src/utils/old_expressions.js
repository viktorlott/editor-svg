// nodeRect.x >= objectRect.x + objectRect.width && (
//   (nodeRect.y >= objectRect.y ) && (nodeRect.y  <= objectRect.y + objectRect.height + margin) || 
//   (objectRect.y - margin <= (nodeRect.y + nodeRect.height) && (objectRect.y + objectRect.height) >= (nodeRect.y + nodeRect.height)) ||

//   (objectRect.y >= nodeRect.y && (objectRect.y + objectRect.height) <= (nodeRect.y + nodeRect.height))
// )


// nodeRect.x + nodeRect.width <= objectRect.x + margin && 
//       (((nodeRect.y >= objectRect.y) && (nodeRect.y  <= objectRect.y + objectRect.height + margin)) 
//         || (objectRect.y - margin <= (nodeRect.y + nodeRect.height) 
//             && (objectRect.y + objectRect.height) >= (nodeRect.y + nodeRect.height) 
//             || (objectRect.y >= nodeRect.y && (objectRect.y + objectRect.height) <= (nodeRect.y + nodeRect.height))))

// nodeRect.y >= objectRect.y + objectRect.height && (
//   ((nodeRect.x >= objectRect.x) && (nodeRect.x <= objectRect.x + objectRect.width + margin )) || 
//   (objectRect.x - margin <= (nodeRect.x + nodeRect.width ) &&
//   (objectRect.x + objectRect.width) >= (nodeRect.x + nodeRect.width)) || 
//   (objectRect.x >= nodeRect.x && (objectRect.x + objectRect.width) <= (nodeRect.x + nodeRect.width))
// )

// nodeRect.y + nodeRect.height<= objectRect.y && (
//   ((nodeRect.x >= objectRect.x) && (nodeRect.x <= objectRect.x + objectRect.width + margin )) || 
//   (objectRect.x - margin <= (nodeRect.x + nodeRect.width) && (objectRect.x + objectRect.width) >= (nodeRect.x + nodeRect.width)) || 
//   (objectRect.x >= nodeRect.x && (objectRect.x + objectRect.width) <= (nodeRect.x + nodeRect.width))
//   )