import ForceGraph3DVR, { ForceGraphVRInstance } from "3d-force-graph-vr";
import ForceGraph3D, { ForceGraph3DInstance } from "3d-force-graph";
import SpriteText from "three-spritetext";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { GridHelper, Vector2, Vector3 } from "three";
import Socketed from "./Socketed";
import "./App.css";
import { manyManyEmojis } from "./manyManyEmojis";
import { CSS2DRenderer } from "three/examples/jsm/renderers/CSS2DRenderer";
import { sceneGrid, sceneTranslucentPlanes } from "./scene";

type TMeta = {
  first: number;
  latest: number;
}
export type TUpData = {
  graph: TGraph;
  meta: TMeta;
};

type TNode = { id: number; label: string; type: string; group: string; created: number; fx?: number; fy?: number; fz?: number };
type TGraphNode = TNode & { x: number; y: number; z: number; };
type TLink = { id: number; source: number; target: number; linkType: string; created: number; };

export type TGraph = {
  nodes: TNode[];
  links: TLink[];
};

const useVR = false;

function getElementById(id: string): HTMLElement {
  const el = document.getElementById(id);
  if (el === undefined) {
    throw new Error(`cannot find element ${id}`);
  }
  return el!;
}

const controlsVR = { extraRenderers: [new CSS2DRenderer() as any] }
const controls3D = { controlType: "orbit", extraRenderers: [new CSS2DRenderer() as any] }
export default class App extends Socketed {
  init = useVR ? controlsVR : controls3D;

  theGraph = (useVR ? ForceGraph3DVR : ForceGraph3D)(this.init);
  theAnyGraph = this.theGraph as any;
  the3DGraph = this.theGraph as ForceGraph3DInstance;
  theVRGraph = this.theGraph as ForceGraphVRInstance;
  freeOrbit = false;
  spheres = false;
  planes: any[] = [];
  grids: GridHelper[] = [];

  constructor() {
    super();
    this.theGraph(getElementById("3d-graph"));
    this.the3DGraph.backgroundColor("#000")
      .linkDirectionalArrowRelPos(1)
      .linkWidth(1)
      .backgroundColor("#000")
      .linkDirectionalArrowLength(3.5)
      .linkCurvature(0.0)
      .onNodeClick((node: any, event: MouseEvent) => this.nodeClick(node as TGraphNode))

      // .onNodeDragEnd((node: any) => {
      //   node.fx = node.x;
      //   node.fy = node.y;
      //   node.fz = node.z;
      //   console.log("dragged", node);
      // })
      .nodeLabel((node: any) => `${node.label} - ${node.z}`);
    this.setupNodeRender();

    this.the3DGraph.d3Force("link")?.distance(200);
    this.controls();
  }

  updateOrbitLimit() {
    const controls = this.the3DGraph?.controls();
    if (controls) {
      // For OrbitControls
      // controls.enableRotate = this.freeOrbit;
      // controls.enablePan = this.freeOrbit;
    }
  }
  update(upData: TUpData) {
    const currentData = this.theGraph.graphData();
    const newData = upData.graph;

    if (!newData?.nodes?.length) {
      return;
    }

    // Set to store IDs of nodes that are new in the updated data
    this.theGraph.graphData(currentData);
    this.updateNodes(newData.nodes, currentData as TGraph);
    this.updateLinks(newData.links, currentData as TGraph);

    if (!useVR && upData.meta) this.setup3d(upData.meta);
    this.theGraph.refresh();
    getElementById("info").innerHTML = `nodes: ${currentData.nodes.length} links: ${currentData.links.length}`;
  }
  setupNodeRender() {
    if (!this.spheres) {
      this.theGraph.nodeThreeObject((node: any) => {
        const contents = `${manyManyEmojis[manyManyEmojis.length % node.id] || "¿"} ${node.label}`;
        if (true) {
          const sprite = new SpriteText(contents);
          sprite.color = "cyan";
          // update sprite.color depending how close z is to node.z
          sprite.textHeight = 8; // Adjust as needed
          return sprite as any;
        } else {
          // does not work
          const nodeEl = document.createElement("a");
          nodeEl.innerHTML = contents;
          nodeEl.style.color = "white";
          nodeEl.className = "node-label";
          nodeEl.addEventListener("pointerdown", () => this.nodeClick(node)); // Correct way to attach an event listener
          // return new CSS2DObject(nodeEl);
        }
      });
    } else {
      console.log("no spheres");
    }
  }

  updateNodes(newNodes: TNode[], currentData: TGraph) {
    // keep existing nodes or add new ones
    newNodes.forEach((newNode) => {
      const existingNode = currentData.nodes.find((n) => n.id === newNode.id);
      if (!existingNode) {
        currentData.nodes.push(newNode);
      }
    });

    // Remove nodes not present in newNodes
    currentData.nodes = currentData.nodes.filter((node) => newNodes.some((n) => n.id === node.id));
  }

  updateLinks(newLinks: TLink[], currentData: TGraph) {
    // keep or update links
    newLinks.forEach((newLink) => {
      let existingLink = currentData.links.find((l) => l.id === newLink.id);
      if (!existingLink) {
        currentData.links.push(newLink);
      }
    });

    // Remove links not present in newLinks
    currentData.links = currentData.links.filter((link) => newLinks.some((newLink) => link.id === newLink.id));
  }

  nodeClick(node: TGraphNode) {
    console.log("click", node);
    // Aim at node from outside it
    const distance = 40;
    const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);

    const newPos = node.x || node.y || node.z ? { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio } : { x: 0, y: 0, z: distance }; // special case if node is in (0,0,0)

    this.the3DGraph.cameraPosition(
      newPos, // new position
      node, // lookAt ({ x, y, z })
      2000 // ms transition duration
    );
  }
  setup3d(meta: TMeta) {
    const initialBloomStrength = calculateBloomStrength(meta);
    const { bloomPass } = this.theAnyGraph;
    if (!bloomPass) {
      const bloomPass = new UnrealBloomPass(new Vector2(0, 0), 1, 1, 0)
      bloomPass.strength = initialBloomStrength;
      bloomPass.radius = 1;
      bloomPass.threshold = 0;
      this.theAnyGraph.bloomPass = bloomPass;
      this.theAnyGraph.postProcessingComposer().addPass(bloomPass);
    }

    this.decayBloomEffect(); // Call the decay method here
    this.the3DGraph.onBackgroundClick((event) => {
      console.log("background click", event);

      // Determine how much to shift the camera towards the clicked point
      const shiftFactor = 0.5; // Adjust this factor as needed

      // Get the current camera position and calculate the new position
      const currentCameraPosition = this.the3DGraph.cameraPosition();
      const newX = currentCameraPosition.x - (event.x - currentCameraPosition.x) * shiftFactor;
      const newY = currentCameraPosition.y - (event.y - currentCameraPosition.y) * shiftFactor;
      const newZ = currentCameraPosition.z - 200; // Move the camera 200 units closer

      // Set the new camera position and keep the orientation towards the z-plane
      this.the3DGraph.cameraPosition(
        { x: newX, y: newY, z: newZ }, // New camera position
        { x: newX, y: newY, z: 0 }, // LookAt point on the z-plane, aligned with new camera position
        100 // Transition duration in ms
      );
    })
    this.grids = sceneGrid(this.the3DGraph);
    this.planes = sceneTranslucentPlanes(this.the3DGraph);
  }
  decayBloomEffect() {
    const decayRate = 0.95; // Adjust this value as needed
    const minimumBloomStrength = 0.1; // Adjust the minimum limit
    const interval = 100; // Decay interval in milliseconds

    const decay = () => {
      if (this.theAnyGraph.bloomPass && this.theAnyGraph.bloomPass.strength > minimumBloomStrength) {
        this.theAnyGraph.bloomPass.strength *= decayRate;

        // Call this again after some time
        setTimeout(decay, interval);
      }
    };

    decay();
  }
  controls() {
    getElementById("refreshPage").addEventListener("click", () => window.location.reload());
    getElementById("togglePlanes").addEventListener("click", () => this.togglePlanes());
    getElementById("toggleSpheres").addEventListener("click", () => this.toggleSpheres());
    getElementById("fit").addEventListener("click", () => this.the3DGraph.zoomToFit());
    getElementById("resetView").addEventListener("click", () => this.resetView());
    getElementById("toggleGrids").addEventListener("click", () => this.toggleGrids());
    getElementById("dagMode").addEventListener("change", (event) => this.setDAGMode(event));
    getElementById("freeOrbit").addEventListener("click", () => {
      this.freeOrbit = !this.freeOrbit;
      this.updateOrbitLimit();
    });

    // this.updateOrbitLimit();
    this.toggleGrids();
    this.togglePlanes();
  }
  toggleGrids() {
    this.grids.forEach((grids) => {
      grids.visible = !grids.visible;
    });
  }
  togglePlanes() {
    this.planes.forEach((plane) => {
      plane.visible = !plane.visible;
    });
  }
  toggleSpheres() {
    this.spheres = !this.spheres;
    console.log("toggleSpheres", this.spheres);
    this.setupNodeRender();
    // this.theGraph.refresh();
  }
  setDAGMode(event: any) {
    this.theVRGraph.dagMode(event.target.value).onDagError(console.error);
  }
  resetView() {
    const cameraPositionZ = 500; // Distance of camera from the grid
    const gridCenter = new Vector3(0, 0, 0); // Adjust if your grid's center is different

    // Position the camera
    this.the3DGraph.cameraPosition(new Vector3(0, 0, cameraPositionZ), gridCenter);

    // If you're using OrbitControls or similar, you might want to update the target
    (this.the3DGraph.controls() as any).target.copy(gridCenter);
  }
}

function calculateBloomStrength(meta: TMeta) {
  // Ensure meta.first is not zero to avoid division by zero
  if (meta.first === 0) {
    return 0.1; // or some default value
  }

  // Normalize the value (ensure it's between 0 and 1)
  let ratio = (meta.latest - meta.first) / meta.first;
  ratio = Math.max(0, Math.min(ratio, 1)); // Clamping between 0 and 1

  // Linear interpolation within the range 0.1 to 4
  return 0.1 + ratio * (6 - 0.1);
}
