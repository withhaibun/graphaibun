export type TGraph = {
  nodes: { id: number; label: string; type: string; group: string; created: number; fx?: number; fy?: number; fz?: number; }[];
  links: { id: number; source: number; target: number; linkType: string; created: number; }[];
};
export class GraphMe {
  latest = new Date().getTime();
  first = new Date().getTime();
  generations = 0;
  scaleFactor = 500;
  graph: TGraph = {
    nodes: [],
    links: [],
  };
  created() {
    this.latest = new Date().getTime();
    return this.latest;
  }

  createNode({ type, group, label, created = this.created(), fz }: { type: string, group: string, label: string, created?: number, fz?: number }) {
    const id = this.graph.nodes.length;
    this.graph.nodes.push({ id, label, type, group, created, fz: fz !== undefined ? fz * this.scaleFactor : undefined });
    return id;
  }

  createLink(source: number, target: number, linkType: string) {
    const id = this.graph.links.length;
    this.graph.links.push({ id, source, target, linkType, created: this.created() });
    return id;
  }
}
