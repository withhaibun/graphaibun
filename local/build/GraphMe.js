export class GraphMe {
    latest = new Date().getTime();
    first = new Date().getTime();
    generations = 0;
    scaleFactor = 500;
    graph = {
        nodes: [],
        links: [],
    };
    created() {
        this.latest = new Date().getTime();
        return this.latest;
    }
    createNode({ type, group, label, created = this.created(), fz }) {
        const id = this.graph.nodes.length;
        this.graph.nodes.push({ id, label, type, group, created, fz: fz !== undefined ? fz * this.scaleFactor : undefined });
        return id;
    }
    createLink(source, target, linkType) {
        const id = this.graph.links.length;
        this.graph.links.push({ id, source, target, linkType, created: this.created() });
        return id;
    }
}
//# sourceMappingURL=GraphMe.js.map