import THREE from "./index"
export const Direction = {
    up: [0, 0, 1],
    down: [0, 0, -1],
    front: [0, 1, 0],
    behind: [0, -1, 0],
    left: [-1, 0, 0],
    right: [1, 0, 0]
}
export type modelsLinkedList = {
    model: THREE.Mesh,
    next: modelsLinkedList | null
}

export interface SceneStatic {
    scene: THREE.Scene
    camera: THREE.Camera
    light: THREE.Light
    renderer: THREE.WebGLRenderer
    control: any
}

export type ThreeScene = Partial<SceneStatic>