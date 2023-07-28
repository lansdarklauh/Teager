import THREE from "./index";
import { ThreeScene } from "./static";
type Mode = 'translate' | 'rotate' | 'scale';
declare class TransformLoader implements ThreeScene {
    scene: THREE.Scene;
    camera: THREE.Camera;
    renderer: THREE.WebGLRenderer;
    control: any;
    transform: any;
    size: number;
    constructor(scene: THREE.Scene, camera: THREE.Camera, renderer: THREE.WebGLRenderer, control: any);
    attachModel(model: THREE.Mesh | string): void;
    detachModel(): void;
    checkCollisions(): THREE.Mesh[];
    changeMode(str: Mode): void;
    changeLocation(mode: 0 | 1): void;
    changeSnap(mode: Mode, number: number): void;
    changeSize(num: number): void;
    showDirection(direction: 'x' | 'y' | 'z', flag?: boolean): {
        direction: string;
        result: boolean;
    };
    enabledTransform(flag: any): any;
    dispose(): void;
}
export default TransformLoader;
