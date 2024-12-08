import ColorPicker from "@thednp/color-picker";
import { DataSet, Edge, Network } from "vis-network/standalone";
import { App, Modal, Setting } from 'obsidian';



export function createGraph(container : HTMLElement){
    var nextid = 6;
    var nodes = new DataSet([ 
        {id: 1, label: '1'},
        {id: 2, label: '2'},
        {id: 3, label: '3'},
        {id: 4, label: '4'},
        {id: 5, label: '5'}
    ]);
    // create an array with edges
    var edgesArray: Edge[] = [
        {from: 1, to: 3},
        {from: 1, to: 2},
        {from: 2, to: 4},
        {from: 2, to: 5}
    ];

    var data = {
    nodes: nodes,
    edges: edgesArray
    };
    var options = {
        autoResize: true,
        height: '100%',
        width: '100%',
        edges: {
            smooth:{
                type: "continuous",
            }
        },
        physics: {
            enabled: false,
        },
    };
    var network = new Network(container, data, options);
    const DataSetUpdatedEvent = new CustomEvent("DataSetUpdated", {
        bubbles: true,
        detail: {
            data: data,
            network: network
        }});
    nodes.on("*", function (event, properties, senderId){
        container.dispatchEvent(DataSetUpdatedEvent);
    })
    network.on("selectNode", function(params){
    });
    addEventListener("input", updateNode);

    function updateNode(e: InputEvent){
        var nodeid = getSelectedNode()
        console.log('selected event element', e);
        var nodeLabel = e.target.value;
        nodes.updateOnly({id: nodeid, label: nodeLabel});
    }

    function getSelectedNode() : string|number{
        var SelectedNodes = network.getSelectedNodes();
        var node = nodes.get(SelectedNodes[0]);
        if(node){
            return node.id;
        }
        return -1;
    }
    nodes.on("add", function (event, properties, senderId){
        if(properties){
        var node = nodes.get(properties.items[0]);
        if(node){
        nodes.updateOnly({id: node.id, label: nextid.toString()});
        nextid += 1;
        }
        }
    })
    nodes.on("remove", function (event, properties, senderId){
        nextid -= 1;
    })
    return {data, network};
    
    
}



 
  
