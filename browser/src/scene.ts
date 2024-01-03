import { ForceGraph3DInstance } from "3d-force-graph";
import { GridHelper } from "three";
import { PlaneGeometry, MeshLambertMaterial, DoubleSide, Mesh } from "three";

const gridSize = 9000;
export function sceneGrid(theGraph: ForceGraph3DInstance) {
  const gridDivisions = 10;

  // Grid Helpers
  // X-axis grid (red)
  const gridX = new GridHelper(gridSize, gridDivisions, 0xff0000, 0xff0000);
  gridX.rotation.x = Math.PI / 2;
  gridX.position.set(0, 0, 0);
  //   myGraph.scene().add(gridX);

  // Y-axis grid (green)
  const gridY = new GridHelper(gridSize, gridDivisions, 0x00ff00, 0x00ff00);
  gridY.position.set(0, 0, 0);
  //   myGraph.scene().add(gridY);

  // Z-axis grid (blue)
  const gridZ = new GridHelper(gridSize, gridDivisions, 0x0000ff, 0x0000ff);
  gridZ.rotation.z = Math.PI / 2;
  gridZ.position.set(0, 0, 0);
  theGraph.scene().add(gridZ);
  return [gridX, gridY, gridZ];
}
export function sceneTranslucentPlanes(theGraph: ForceGraph3DInstance) {
  const planes = [];
  const planeGeometry = new PlaneGeometry(gridSize, gridSize, 1, 1);
  const planeMaterial = new MeshLambertMaterial({
    color: 0x5555ff,
    side: DoubleSide,
    transparent: true,
    opacity: 0.9, // Adjust opacity for visibility
  });

  // Total number of planes and space length
  const totalPlanes = gridSize / 500;

  for (let i = 0; i < totalPlanes; i++) {
    const mesh = new Mesh(planeGeometry, planeMaterial);
    // Position each plane at the calculated interval
    mesh.position.set(0, 0, i * 500 - 40);
    theGraph.scene().add(mesh);
    planes.push(mesh);
  }
  return planes;
}
