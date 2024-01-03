import { graphMe } from './server.js';

export const groups = ['Group 1', 'Group 2', 'Group 3'];
export const linkTypes = ['Type 1', 'Type 2', 'Type 3'];

export function synthGraph() {
  const its = (500 - graphMe.graph.nodes.length) / 10;
  console.log('its', its, graphMe.graph.nodes.length);
  for (let i = 0; i < its; i++) {
    const id = graphMe.graph.nodes.length;
    const type = (id < 1 || Math.random() > 0.8) ? 'Special' : 'Bun';
    const group = groups[Math.floor(Math.random() * groups.length)]!;

    const loc = type === 'Special' ? { fz: graphMe.generations } : { fz: graphMe.generations };
    graphMe.createNode({ type, group, label: `${type} ${id} G${graphMe.generations} ${loc.fz || ''}` });
  }

  // add a bunch of fake edges to graph
  for (let i = 0; i < its - 1; i++) {
    const id = graphMe.graph.links.length;
    const nodes = graphMe.graph.nodes.length;
    const linkType = linkTypes[Math.floor(Math.random() * linkTypes.length)]!;
    graphMe.createLink(nodes - 1, (id + 1), linkType);
  }
  return 4000 + Math.random() * 9000;
}
