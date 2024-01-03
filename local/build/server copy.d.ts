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
export declare let generations: number;
export declare function created(): number;
export declare let graph: TGraph;
export declare const groups: string[];
export declare const linkTypes: string[];
