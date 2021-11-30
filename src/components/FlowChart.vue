<template>
  <div id="sample">
    <div style="width: 100%; display: flex; justify-content: space-between">
      <div id="myPaletteDiv" style="width: 100px; margin-right: 2px; background-color: #282c34;"></div>
      <div id="myDiagramDiv" style="flex-grow: 1; height: 750px; background-color: #282c34;"></div>
      <ul id="contextMenu" class="menu">
        <li id="copy" class="menu-item" @click="cxcommand('copy')">Copy Task</li>
        <li id="copy" class="menu-item" onclick="cxcommand(event)">Copy</li>
        <li id="paste" class="menu-item" onclick="cxcommand(event)">Paste</li>
        <li id="delete" class="menu-item" onclick="cxcommand(event)">Delete</li>
        <li id="color" class="menu-item">Color
          <ul class="menu">
            <li class="menu-item" style="background-color: #f38181;" onclick="cxcommand(event, 'color')">Red</li>
            <li class="menu-item" style="background-color: #eaffd0;" onclick="cxcommand(event, 'color')">Green</li>
            <li class="menu-item" style="background-color: #95e1d3;" onclick="cxcommand(event, 'color')">Blue</li>
            <li class="menu-item" style="background-color: #fce38a;" onclick="cxcommand(event, 'color')">Yellow</li>
          </ul>
        </li>
      </ul>
    </div>
    <p/>
    <textarea id="mySavedModel" style="width:100%;height:300px;visibility:hidden">
      { "class": "go.GraphLinksModel",
      "linkFromPortIdProperty": "fromPort",
      "linkToPortIdProperty": "toPort",
      "nodeDataArray": [
      {"category":"Comment", "loc":"360 -10", "text":"Kookie Brittle", "key":-13},
      {"key":-1, "category":"Start", "loc":"175 0", "text":"Start"},
      {"key":0, "loc":"-5 75", "text":"Preheat oven to 375 F"},
      {"key":1, "loc":"175 100", "text":"In a bowl, blend: 1 cup margarine, 1.5 teaspoon vanilla, 1 teaspoon salt"},
      {"key":2, "loc":"175 200", "text":"Gradually beat in 1 cup sugar and 2 cups sifted flour"},
      {"key":3, "loc":"175 290", "text":"Mix in 6 oz (1 cup) Nestle's Semi-Sweet Chocolate Morsels"},
      {"key":4, "loc":"175 380", "text":"Press evenly into ungreased 15x10x1 pan"},
      {"key":5, "loc":"355 85", "text":"Finely chop 1/2 cup of your choice of nuts"},
      {"key":6, "loc":"175 450", "text":"Sprinkle nuts on top"},
      {"key":7, "loc":"175 515", "text":"Bake for 25 minutes and let cool"},
      {"key":8, "loc":"175 585", "text":"Copy Task into rectangular grid"},
      {"key":-2, "category":"End", "loc":"175 660", "text":"Enjoy!"}
      ],
      "linkDataArray": [
      {"from":1, "to":2, "fromPort":"B", "toPort":"T"},
      {"from":2, "to":3, "fromPort":"B", "toPort":"T"},
      {"from":3, "to":4, "fromPort":"B", "toPort":"T"},
      {"from":4, "to":6, "fromPort":"B", "toPort":"T"},
      {"from":6, "to":7, "fromPort":"B", "toPort":"T"},
      {"from":7, "to":8, "fromPort":"B", "toPort":"T"},
      {"from":8, "to":-2, "fromPort":"B", "toPort":"T"},
      {"from":-1, "to":0, "fromPort":"B", "toPort":"T"},
      {"from":-1, "to":1, "fromPort":"B", "toPort":"T"},
      {"from":-1, "to":5, "fromPort":"B", "toPort":"T"},
      {"from":5, "to":4, "fromPort":"B", "toPort":"T"},
      {"from":0, "to":4, "fromPort":"B", "toPort":"T"}
      ]}
    </textarea>
  </div>
</template>
<script>
import FlowChart from '../lib/flowChart'

const flowChart = new FlowChart()

export default {
  name: 'FlowChart',
  mounted () {
    flowChart.init('myDiagramDiv', 'myPaletteDiv', this.showContextMenu)
    flowChart.load(document.getElementById("mySavedModel").value);  // load an initial diagram from some JSON text
  },
  methods: {
    // This is the general menu command handler, parameterized by the name of the command.
    cxcommand(val) {
      switch (val) {
        case "copy":
          alert('copy')
          break;
        case "copy":
          alert('copy')
          break;
        case "color": {
          // var color = window.getComputedStyle(event.target)['background-color'];
          // changeColor(diagram, color); break;
        }
      }
      diagram.currentTool.stopTool();
    },

    showContextMenu(obj, diagram, tool) {
      // Show only the relevant buttons given the current state.
      const cxElement = document.getElementById("contextMenu");

      var cmd = diagram.commandHandler;
      var hasMenuItem = false;
      function maybeShowItem(elt, pred) {
        if (pred) {
          elt.style.display = "block";
          hasMenuItem = true;
        } else {
          elt.style.display = "none";
        }
      }
      maybeShowItem(document.getElementById("copy"), cmd.canCutSelection());
      maybeShowItem(document.getElementById("copy"), cmd.canCopySelection());
      maybeShowItem(document.getElementById("paste"), cmd.canPasteSelection(diagram.toolManager.contextMenuTool.mouseDownPoint));
      maybeShowItem(document.getElementById("delete"), cmd.canDeleteSelection());
      maybeShowItem(document.getElementById("color"), obj !== null);
    
      // Now show the whole context menu element
      if (hasMenuItem) {
        cxElement.classList.add("show-menu");
        // we don't bother overriding positionContextMenu, we just do it here:
        var mousePt = diagram.lastInput.viewPoint;
        cxElement.style.left = mousePt.x + 5 + "px";
        cxElement.style.top = mousePt.y + "px";
      }
    
      // Optional: Use a `window` click listener with event capture to
      //           remove the context menu if the user clicks elsewhere on the page
      window.addEventListener("click", this.hideCX, true);
    }
  }
}
</script>

<style lang="css" scoped>
.menu {
  display: none;
  position: absolute;
  opacity: 0;
  margin: 0;
  padding: 8px 0;
  z-index: 999;
  box-shadow: 0 5px 5px -3px rgba(0, 0, 0, .2), 0 8px 10px 1px rgba(0, 0, 0, .14), 0 3px 14px 2px rgba(0, 0, 0, .12);
  list-style: none;
  background-color: #ffffff;
  border-radius: 4px;
}

.menu-item {
  display: block;
  position: relative;
  min-width: 60px;
  margin: 0;
  padding: 6px 16px;
  font: bold 12px sans-serif;
  color: rgba(0, 0, 0, .87);
  cursor: pointer;
}

.menu-item::before {
  position: absolute;
  top: 0;
  left: 0;
  opacity: 0;
  pointer-events: none;
  content: "";
  width: 100%;
  height: 100%;
  background-color: #000000;
}

.menu-item:hover::before {
  opacity: .04;
}

.menu .menu {
  top: -8px;
  left: 100%;
}

.show-menu, .menu-item:hover > .menu {
  display: block;
  opacity: 1;
}
</style>