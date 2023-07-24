import THREE from "./index";
type Model = (THREE.Mesh | THREE.BufferGeometry | (THREE.Mesh | THREE.BufferGeometry)[]);
declare class Teager {
    scene: THREE.Scene;
    camera: THREE.Camera;
    light: THREE.Light;
    renderer: THREE.WebGLRenderer;
    control: any;
    container: HTMLElement;
    material: THREE.Material;
    clock: THREE.Clock;
    constructor(container?: HTMLElement, material?: THREE.Material);
    init(container?: HTMLElement, material?: THREE.Material): void;
    private resize;
    private render;
    private animate;
    addModels(models: Model, material?: THREE.Material): any[];
}
export default Teager;
