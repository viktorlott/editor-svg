function getDragDirection(currentBox, nextBox) {

    const changes = {}
    const sides = [0,1,2,3,4,5,6,7]
    for(let key in currentBox) {
        changes[key] = nextBox[key] - currentBox[key]
    }

    if(changes.height !== 0 && changes.y !== 0 && changes.height > 0 && changes.y < 0) {
        // 1  up
        // console.log("Side: 1 - UP", changes)
        return [1,1]
    } else if(changes.height !== 0 && changes.y !== 0 && changes.height < 0 && changes.y > 0) {
        // 1  down
        // console.log("Side: 1 - DOWN", changes)
        return [1,5]
    } else if(changes.width !== 0  && changes.x === 0 && changes.width > 0) {
        // 3 + right
        // console.log("Side: 3 - RIGHT")
        return [3,3]
    } else if(changes.width !== 0  && changes.x === 0 && changes.width < 0 ) {
        // 3 - left
        return [3,7]
        // console.log("Side: 3 - LEFT")
    } else if(changes.height !== 0 && changes.y === 0 && changes.height < 0) {
        // 5 - up
        // console.log("Side: 5 - UP")
        return [5,1]
    } else if(changes.height !== 0 && changes.y === 0 && changes.height > 0) {
        // 5 + down
        // console.log("Side: 5 - DOWN")
        return [5,5]
    } else if(changes.width !== 0  && changes.x !== 0 && changes.width < 0 && changes.x > 0) {
        // 7  right
        // console.log("Side: 7 - RIGHT")
        return [7,3]
    } else if(changes.width !== 0  && changes.x !== 0 && changes.width > 0 && changes.x < 0) {
        // 7 left
        // console.log("Side: 7 - LEFT")
        return [7,7]
    }
    return [0,0]
    
}

export default () => {

    let votes = {}
    let threshold = 4
    let direction = null

    return (currentBox, nextBox) => {
        const newDirection = getDragDirection(currentBox, nextBox)


        if(!votes[newDirection.join("")]) {
          votes[newDirection.join("")] = 1
        } else {
          votes[newDirection.join("")] += 1
        }
    
        for(let key in votes) {
          if(key !== "00" && votes[key] >= threshold) {
            direction = key
            votes = {}
            break;
          }
        }

        return direction
    }



}