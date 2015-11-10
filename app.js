var SceneWorker = new Worker('src/workers/SceneWorker.js');
var Engine = boxer.core.Engine;
var Scene = boxer.core.Scene;
var DOMComponent = boxer.components.DOMComponent;

var scene = {
    addSubGraph: []
};


var elements = {}; // a graph of elements;

// Add 180 Nodes to the Scene in a SubGraph.
for( var i=0; i<180; i++ ){
    var conf = {
        position: 'absolute',
        translate : [0, 0, 0],
        origin : [0.0,0.0,0.0],
        align : [0.0,0.0,0.0],
        size : [80,80,80],
        scale : [0.5,0.5,0.5],
        rotate: [(i+1)*4,0,(i+1)*4],
        id: 'node-'+i,
        opacity : 0.0,
        transition:{
            t: 'opacity',
            from: 0.0,
            to: 1.0,
            curve: 'linear',
            duration: 1000,
            delay: 0
        }
    };
    scene.addSubGraph.push(conf);
    elements['node-'+i] = new DOMComponent(conf);
};

SceneWorker.postMessage(scene); // Adds Nodes to the Scene.
SceneWorker.postMessage({graph:true}); // send message to Scene Worker to retrieve current Graph.
//TODO: Make a better API for messaging Graph?

SceneWorker.postMessage({query: {
                           id:'node-0'
                        },
                        transition:{
                            t: 'opacity',
                            from: 0.0,
                            to: 1.0,
                            curve: 'linear',
                            duration: 1000,
                            delay: 0
                        }
                        });


SceneWorker.onmessage = function(e) {

  if(e.data.message) {
    //console.log(e.data.message, elements[e.data.node].elem.style[e.data.message.prop]);
    elements[e.data.node].elem.style[e.data.message.prop] = e.data.message.val;
  }

}


// TODO: Change for better API? Need to link Scene to receive updates somehow...
Engine.init(SceneWorker);
