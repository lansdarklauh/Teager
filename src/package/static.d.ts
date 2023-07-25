import THREE from "./index";
export declare const Direction: {
    up: number[];
    down: number[];
    front: number[];
    behind: number[];
    left: number[];
    right: number[];
};
export type modelsLinkedList = {
    model: THREE.Mesh;
    next: modelsLinkedList | null;
};
