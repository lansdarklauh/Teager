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
interface Result {
    result: THREE.Object3D | null;
    type: string;
}
declare class ModelLoader {
    fontLoader: THREE.Loader;
    stlLoader: THREE.Loader;
    objLoader: THREE.Loader;
    gltfLoader: THREE.Loader;
    stlExporter: any;
    objExporter: any;
    gltfExporter: any;
    constructor();
    loadModel(str: string, url: string | Blob): Promise<Result>;
    loadFont(param: Partial<param>, str?: string | Blob): Promise<Result>;
    exportModels(models: THREE.Mesh[], format: 'obj' | 'stl' | 'gltf', name?: string): Blob;
}
export default ModelLoader;
