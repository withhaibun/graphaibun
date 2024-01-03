export type TGraph = {
    nodes: {
        id: number;
        label: string;
        type: string;
        group: string;
        created: number;
        fx?: number;
        fy?: number;
        fz?: number;
    }[];
    links: {
        id: number;
        source: number;
        target: number;
        linkType: string;
        created: number;
    }[];
};
export declare class GraphMe {
    latest: number;
    first: number;
    generations: number;
    scaleFactor: number;
    graph: TGraph;
    created(): number;
    createNode({ type, group, label, created, fz }: {
        type: string;
        group: string;
        label: string;
        created?: number;
        fz?: number;
    }): number;
    createLink(source: number, target: number, linkType: string): number;
}
