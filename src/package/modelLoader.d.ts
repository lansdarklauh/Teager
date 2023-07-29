import THREE from "./index";
interface param {
    content: string;
    size: number;
    height: number;
    curveSegments: number;
    bevelEnabled: boolean;
    bevelThickness: number;
    bevelSize: number;
    bevelSegments: number;
}
declare class ModelLoader {
    fontLoader: THREE.Loader;
    stlLoader: THREE.Loader;
    objLoader: THREE.Loader;
    gltfLoader: THREE.Loader;
    textureLoader: THREE.Loader;
    constructor();
    loadModel(str: string, url: string | Blob): Promise<unknown>;
    loadFont(param: Partial<param>, str?: string | Blob): Promise<unknown>;
    exportModels(models: THREE.Mesh[], format: 'obj' | 'stl' | 'gltf', name?: string): Blob;
}
export default ModelLoader;
