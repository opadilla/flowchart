import * as go from "gojs/release/go-debug-module";

const $ = go.GraphObject.make;

export default class FlowChart {
  constructor() {
  }

  init(diagramDivId, paletteDivId, showContextMenuHandler) {
    this.initDiagram(diagramDivId)
    this.defineNodeTemplates(showContextMenuHandler)
    this.defineLinkTemplate()
    this.initPalette(paletteDivId);

    return this.myDiagram
  }

  initDiagram (diagramDivId) {
    this.myDiagram =
    $(go.Diagram, diagramDivId,  // must name or refer to the DIV HTML element
      {
        "LinkDrawn": showLinkLabel,  // this DiagramEvent listener is defined below
        "LinkRelinked": showLinkLabel,
        "undoManager.isEnabled": true  // enable undo & redo
      });
  
    // when the document is modified, add a "*" to the title and enable the "Save" button
    this.myDiagram.addDiagramListener("Modified", (e) => {
      var button = document.getElementById("SaveButton");

      if (button) button.disabled = !this.myDiagram.isModified;

      var idx = document.title.indexOf("*");
      if (this.myDiagram.isModified) {
        if (idx < 0) document.title += "*";
      } else {
        if (idx >= 0) document.title = document.title.substr(0, idx);
      }
    });
  }

  initPalette (paletteDivId) {
      $(go.Palette, paletteDivId,  // must name or refer to the DIV HTML element
        {
          // Instead of the default animation, use a custom fade-down
          "animationManager.initialAnimationStyle": go.AnimationManager.None,
          "InitialAnimationStarting": animateFadeDown, // Instead, animate with this function
  
          nodeTemplateMap: this.myDiagram.nodeTemplateMap,  // share the templates used by myDiagram
          model: new go.GraphLinksModel([  // specify the contents of the Palette
            { category: "Start", text: "Start" },
            { text: "Step" },
            { category: "Conditional", text: "???" },
            { category: "End", text: "End" },
            { category: "Comment", text: "Comment" }
          ])
        });
  }

  contextMenuClick(e, obj) {
    // e.diagram.commit(function(d) {
    //   // get the context menu that holds the button that was clicked
    //   var contextmenu = obj.part;
    //   // get the node data to which the Node is data bound
    //   var nodedata = contextmenu.data;
    //   // compute the next color for the node
    //   var newcolor = "lightblue";
    //   switch (nodedata.color) {
    //     case "lightblue": newcolor = "lightgreen"; break;
    //     case "lightgreen": newcolor = "lightyellow"; break;
    //     case "lightyellow": newcolor = "orange"; break;
    //     case "orange": newcolor = "lightblue"; break;
    //   }
    //   // modify the node data
    //   // this evaluates data Bindings and records changes in the UndoManager
    //   d.model.set(nodedata, "color", newcolor);
    // }, "changed color");
    console.log('clicked')
  }

  

  defineLinkTemplate() {
    // replace the default Link template in the linkTemplateMap
    this.myDiagram.linkTemplate =
      $(go.Link,  // the whole link panel
        {
          routing: go.Link.AvoidsNodes,
          curve: go.Link.JumpOver,
          corner: 5, toShortLength: 4,
          relinkableFrom: true,
          relinkableTo: true,
          reshapable: true,
          resegmentable: true,
          // mouse-overs subtly highlight links:
          mouseEnter: function(e, link) { link.findObject("HIGHLIGHT").stroke = "rgba(30,144,255,0.2)"; },
          mouseLeave: function(e, link) { link.findObject("HIGHLIGHT").stroke = "transparent"; },
          selectionAdorned: false
        },
        new go.Binding("points").makeTwoWay(),
        $(go.Shape,  // the highlight shape, normally transparent
          { isPanelMain: true, strokeWidth: 8, stroke: "transparent", name: "HIGHLIGHT" }),
        $(go.Shape,  // the link path shape
          { isPanelMain: true, stroke: "gray", strokeWidth: 2 },
          new go.Binding("stroke", "isSelected", function(sel) { return sel ? "dodgerblue" : "gray"; }).ofObject()),
        $(go.Shape,  // the arrowhead
          { toArrow: "standard", strokeWidth: 0, fill: "gray" }),
        $(go.Panel, "Auto",  // the link label, normally not visible
          { visible: false, name: "LABEL", segmentIndex: 2, segmentFraction: 0.5 },
          new go.Binding("visible", "visible").makeTwoWay(),
          $(go.Shape, "RoundedRectangle",  // the label shape
            { fill: "#F8F8F8", strokeWidth: 0 }),
          $(go.TextBlock, "Yes",  // the label
            {
              textAlign: "center",
              font: "10pt helvetica, arial, sans-serif",
              stroke: "#333333",
              editable: true
            },
            new go.Binding("text").makeTwoWay())
        )
      );
  }

  load(modelJson) {
    // temporary links used by LinkingTool and RelinkingTool are also orthogonal:
    this.myDiagram.toolManager.linkingTool.temporaryLink.routing = go.Link.Orthogonal;
    this.myDiagram.toolManager.relinkingTool.temporaryLink.routing = go.Link.Orthogonal;

    this.myDiagram.model = go.Model.fromJson(modelJson)
  }

  defineNodeTemplates(showContextMenuHandler) {
    // This is the actual HTML context menu:
    this.cxElement = document.getElementById("contextMenu");

    // an HTMLInfo object is needed to invoke the code to set up the HTML cxElement
    var myContextMenu = $(go.HTMLInfo, {
      show: showContextMenuHandler,
      hide: this.hideContextMenu
    });

    // define the Node templates for regular nodes
  
    this.myDiagram.nodeTemplateMap.add("",  // the default category
      $(go.Node, "Table", nodeStyle(),
        // the main object is a Panel that surrounds a TextBlock with a rectangular Shape
        $(go.Panel, "Auto",
        
          $(go.Shape, "Rectangle",
            { fill: "#282c34", stroke: "#00A9C9", strokeWidth: 3.5 },
            new go.Binding("figure", "figure")),
          $(go.TextBlock, textStyle(),
            {
              margin: 8,
              maxSize: new go.Size(160, NaN),
              wrap: go.TextBlock.WrapFit,
              editable: true
            },
            new go.Binding("text").makeTwoWay()),
            { contextMenu: myContextMenu },
        ),
        // four named ports, one on each side:
        makePort("T", go.Spot.Top, go.Spot.TopSide, false, true),
        makePort("L", go.Spot.Left, go.Spot.LeftSide, true, true),
        makePort("R", go.Spot.Right, go.Spot.RightSide, true, true),
        makePort("B", go.Spot.Bottom, go.Spot.BottomSide, true, false)
      ));
  
    this.myDiagram.nodeTemplateMap.add("Conditional",
      $(go.Node, "Table", nodeStyle(),
        // the main object is a Panel that surrounds a TextBlock with a rectangular Shape
        $(go.Panel, "Auto",
          $(go.Shape, "Diamond",
            { fill: "#282c34", stroke: "#00A9C9", strokeWidth: 3.5 },
            new go.Binding("figure", "figure")),
          $(go.TextBlock, textStyle(),
            {
              margin: 8,
              maxSize: new go.Size(160, NaN),
              wrap: go.TextBlock.WrapFit,
              editable: true
            },
            new go.Binding("text").makeTwoWay())
        ),
        // four named ports, one on each side:
        makePort("T", go.Spot.Top, go.Spot.Top, false, true),
        makePort("L", go.Spot.Left, go.Spot.Left, true, true),
        makePort("R", go.Spot.Right, go.Spot.Right, true, true),
        makePort("B", go.Spot.Bottom, go.Spot.Bottom, true, false)
      ));
  
    this.myDiagram.nodeTemplateMap.add("Start",
      $(go.Node, "Table", nodeStyle(),
        $(go.Panel, "Spot",
          $(go.Shape, "Circle",
            { desiredSize: new go.Size(70, 70), fill: "#282c34", stroke: "#09d3ac", strokeWidth: 3.5 }),
          $(go.TextBlock, "Start", textStyle(),
            new go.Binding("text"))
        ),
        // three named ports, one on each side except the top, all output only:
        makePort("L", go.Spot.Left, go.Spot.Left, true, false),
        makePort("R", go.Spot.Right, go.Spot.Right, true, false),
        makePort("B", go.Spot.Bottom, go.Spot.Bottom, true, false)
      ));
  
    this.myDiagram.nodeTemplateMap.add("End",
      $(go.Node, "Table", nodeStyle(),
        $(go.Panel, "Spot",
          $(go.Shape, "Circle",
            { desiredSize: new go.Size(60, 60), fill: "#282c34", stroke: "#DC3C00", strokeWidth: 3.5 }),
          $(go.TextBlock, "End", textStyle(),
            new go.Binding("text"))
        ),
        // three named ports, one on each side except the bottom, all input only:
        makePort("T", go.Spot.Top, go.Spot.Top, false, true),
        makePort("L", go.Spot.Left, go.Spot.Left, false, true),
        makePort("R", go.Spot.Right, go.Spot.Right, false, true)
      ));
  
    // taken from ../extensions/Figures.js:
    go.Shape.defineFigureGenerator("File", function(shape, w, h) {
      var geo = new go.Geometry();
      var fig = new go.PathFigure(0, 0, true); // starting point
      geo.add(fig);
      fig.add(new go.PathSegment(go.PathSegment.Line, .75 * w, 0));
      fig.add(new go.PathSegment(go.PathSegment.Line, w, .25 * h));
      fig.add(new go.PathSegment(go.PathSegment.Line, w, h));
      fig.add(new go.PathSegment(go.PathSegment.Line, 0, h).close());
      var fig2 = new go.PathFigure(.75 * w, 0, false);
      geo.add(fig2);
      // The Fold
      fig2.add(new go.PathSegment(go.PathSegment.Line, .75 * w, .25 * h));
      fig2.add(new go.PathSegment(go.PathSegment.Line, w, .25 * h));
      geo.spot1 = new go.Spot(0, .25);
      geo.spot2 = go.Spot.BottomRight;
      return geo;
    });
    
    this.myDiagram.nodeTemplateMap.add("Comment",
      $(go.Node, "Auto", nodeStyle(),
        $(go.Shape, "File",
          { fill: "#282c34", stroke: "#DEE0A3", strokeWidth: 3 }),
        $(go.TextBlock, textStyle(),
          {
            margin: 8,
            maxSize: new go.Size(200, NaN),
            wrap: go.TextBlock.WrapFit,
            textAlign: "center",
            editable: true
          },
          new go.Binding("text").makeTwoWay())
        // no ports, because no links are allowed to connect with a comment
      ));
  }

  getModelJson() {
    const result = this.myDiagram.model.toJson();
    this.myDiagram.isModified = false;
    return result;
  }

  hideContextMenu() {
    const cxElement = document.getElementById("contextMenu");
    cxElement.classList.remove("show-menu");
    // Optional: Use a `window` click listener with event capture to
    //           remove the context menu if the user clicks elsewhere on the page
    window.removeEventListener("click", this.hideCX, true);
  }

  hideCX() {
    if (this.myDiagram.currentTool instanceof go.ContextMenuTool) {
      this.myDiagram.currentTool.doCancel();
    }
  }

  // print the diagram by opening a new window holding SVG images of the diagram contents for each page
  printDiagram() {
    var svgWindow = window.open();
    if (!svgWindow) return;  // failure to open a new Window
    var printSize = new go.Size(700, 960);
    var bnds = this.myDiagram.documentBounds;
    var x = bnds.x;
    var y = bnds.y;
    while (y < bnds.bottom) {
      while (x < bnds.right) {
        var svg = this.myDiagram.makeSvg({ scale: 1.0, position: new go.Point(x, y), size: printSize });
        svgWindow.document.body.appendChild(svg);
        x += printSize.width;
      }
      x = bnds.x;
      y += printSize.height;
    }
    setTimeout(function() { svgWindow.print(); }, 1);
  }

}

function animateFadeDown(e) {
  var diagram = e.diagram;
  var animation = new go.Animation();
  animation.isViewportUnconstrained = true; // So Diagram positioning rules let the animation start off-screen
  animation.easing = go.Animation.EaseOutExpo;
  animation.duration = 900;
  // Fade "down", in other words, fade in from above
  animation.add(diagram, 'position', diagram.position.copy().offset(0, 200), diagram.position);
  animation.add(diagram, 'opacity', 0, 1);
  animation.start();
}

// Define a function for creating a "port" that is normally transparent.
// The "name" is used as the GraphObject.portId,
// the "align" is used to determine where to position the port relative to the body of the node,
// the "spot" is used to control how links connect with the port and whether the port
// stretches along the side of the node,
// and the boolean "output" and "input" arguments control whether the user can draw links from or to the port.
function makePort(name, align, spot, output, input) {
  var horizontal = align.equals(go.Spot.Top) || align.equals(go.Spot.Bottom);
  // the port is basically just a transparent rectangle that stretches along the side of the node,
  // and becomes colored when the mouse passes over it
  return $(go.Shape,
    {
      fill: "transparent",  // changed to a color in the mouseEnter event handler
      strokeWidth: 0,  // no stroke
      width: horizontal ? NaN : 8,  // if not stretching horizontally, just 8 wide
      height: !horizontal ? NaN : 8,  // if not stretching vertically, just 8 tall
      alignment: align,  // align the port on the main Shape
      stretch: (horizontal ? go.GraphObject.Horizontal : go.GraphObject.Vertical),
      portId: name,  // declare this object to be a "port"
      fromSpot: spot,  // declare where links may connect at this port
      fromLinkable: output,  // declare whether the user may draw links from here
      toSpot: spot,  // declare where links may connect at this port
      toLinkable: input,  // declare whether the user may draw links to here
      cursor: "pointer",  // show a different cursor to indicate potential link point
      mouseEnter: function(e, port) {  // the PORT argument will be this Shape
        if (!e.diagram.isReadOnly) port.fill = "rgba(255,0,255,0.5)";
      },
      mouseLeave: function(e, port) {
        port.fill = "transparent";
      }
    });
}

function nodeStyle() {
  return [
    // The Node.location comes from the "loc" property of the node data,
    // converted by the Point.parse static method.
    // If the Node.location is changed, it updates the "loc" property of the node data,
    // converting back using the Point.stringify static method.
    new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
    {
      // the Node.location is at the center of each node
      locationSpot: go.Spot.Center
    }
  ];
}

// Make link labels visible if coming out of a "conditional" node.
// This listener is called by the "LinkDrawn" and "LinkRelinked" DiagramEvents.
function showLinkLabel(e) {
  var label = e.subject.findObject("LABEL");
  if (label !== null) label.visible = (e.subject.fromNode.data.category === "Conditional");
}

function textStyle() {
  return {
    font: "bold 11pt Lato, Helvetica, Arial, sans-serif",
    stroke: "#F8F8F8"
  }
}