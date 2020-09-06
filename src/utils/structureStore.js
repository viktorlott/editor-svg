

function createStructureStore() {
    const _structures = {}
    const _cbs = {}
  
    const useStructureStore = struct => {
        const [state, setState] = useState(null)
        
        const updateStore = (change) => {
          if(change) {
            _structures[struct.id] = change
          }
  
          Object.values(_cbs).forEach(cb => cb(Math.random().toString(36).substr(2)))
        }
  
        useEffect(() => {
          _structures[struct.id] = struct
          
          updateStore()
  
          _cbs[struct.id] = setState
          
          return () => {
            delete _cbs[struct.id]
            delete _structures[struct.id]
  
            updateStore()
          }
        },[])
  
        return [_structures, updateStore, state]
    }
  
    return useStructureStore
  
  }
  
  
  const useStructureStore = createStructureStore()
  
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
    }
  
    return null
  
  
  }
  


 // const stage = useMemo(() => {
  //   return new Konva.Stage({
  //     container: canvasRef.current,
  //     width: window.innerWidth,
  //     height: window.innerHeight
  //   })
  // }, [])

  // useEffect(() => { 
  //   if(canvasRef.current) {
  //     stage.current = new Konva.Stage({
  //       container: canvasRef.current,
  //       width: window.innerWidth,
  //       height: window.innerHeight
  //     })
    

  //   // let layer = new Konva.Layer();

  //   // stage.add(layer);

  //   // // create shape
  //   // let box = new Konva.Rect({
  //   //     x: 50,
  //   //     y: 50,
  //   //     width: 100,
  //   //     height: 50,
  //   //     fill: '#00D2FF',
  //   //     stroke: 'black',
  //   //     strokeWidth: 4,
  //   //     draggable: true
  //   // });
  //   // layer.add(box);

  //   // layer.draw();

  //   // // add cursor styling
    // box.on('mouseover', function() {
    //     document.body.style.cursor = 'pointer';
    // });
    // box.on('mouseout', function() {
    //     document.body.style.cursor = 'default';
    // });

  //   }
  // }, [])
 