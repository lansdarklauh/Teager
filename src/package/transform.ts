import THREE from "./index"
import { TransformControls } from "three/examples/jsm/controls/TransformControls"
import { ThreeScene } from "./static"

type Mode = 'translate' | 'rotate' | 'scale'

class TransformLoader implements ThreeScene {
    scene: THREE.Scene
    camera: THREE.Camera
    renderer: THREE.WebGLRenderer
    control: any
    transform: any
    size: number


    constructor(scene: THREE.Scene, camera: THREE.Camera, renderer: THREE.WebGLRenderer, control: any) {
        this.scene = scene
        this.camera = camera
        this.renderer = renderer
        this.control = control
        this.transform = new TransformControls(camera, renderer)
        this.transform.addEventListener('change', this.renderer.render)
        this.transform.addEventListener('dragging-changed', (e) => {
            this.control.enabled = !e.value
        })
        this.size = 1
    }
    attachModel(model: THREE.Mesh | string) {
        if (!model) {
            console.log('there is no model wanted to attach')
        }
        if (this.transform.object) this.detachModel()
        if (typeof model === 'string') {
            this.scene.children.forEach(item => {
                if (item.isMesh && (item.name === model || item.uuid === model)) {
                    this.transform.attach(item)
                }
            })
        } else {
            this.transform.attach(model)
        }
    }
    detachModel() {
        this.transform.detach()
    }
    checkCollisions() {
        if (!this.transform || !this.transform.object) {
            console.log('no model transform')
            return
        }
        const collisionResult: THREE.Mesh[] = []
        const object = this.transform.object
        object.geometry.computeBoundsTree()
        const matrix = object.matrixWorld.clone().invert()
        this.scene.children.forEach(mesh => {
            if (!mesh.geometry.boundsTree) {
                mesh.geometry.computeBoundsTree()
            }
            const multiMatrix = new THREE.Matrix4().copy(matrix).multiply(mesh.matrixWorld)
            if (object.geometry.boundsTree.intersectsGeometry(mesh.geometry, multiMatrix)) {
                collisionResult.push(mesh)
            }
        });
        return collisionResult
    }
    changeMode(str: Mode) {
        if (str) this.transform.setMode(str)
    }
    changeLocation(mode: 0 | 1) {
        if (mode) {
            this.transform.setSpace('world')
        } else {
            this.transform.setSpace('local')
        }
    }
    changeSnap(mode: Mode, number: number) {
        if (mode && number && number > 0) {
            switch (mode) {
                case 'translate':
                    this.transform.setTranslationSnap(number)
                    break
                case 'rotate':
                    this.transform.setRotationSnap(THREE.MathUtils.degToRad(115))
                    break
                case 'scale':
                    if (number > 0 && number <= 1) this.transform.setScaleSnap(number)
                    else this.transform.setScaleSnap(number / 100)
            }
        }
    }
    changeSize(num: number) {
        if (num || num === 0) this.transform.setSize(this.size + num)
    }
    showDirection(direction: 'x' | 'y' | 'z', flag?: boolean) {
        const result = {
            direction: 'x',
            result: false
        }
        switch (direction) {
            case "x":
                this.transform.showX = [true, false].includes(flag) ? flag : !this.transform.showX
                result.direction = 'x'
                result.result = this.transform.showX
                break
            case "y":
                this.transform.showY = [true, false].includes(flag) ? flag : !this.transform.showY
                result.direction = 'y'
                result.result = this.transform.showY
                break
            case "z":
                this.transform.showZ = [true, false].includes(flag) ? flag : !this.transform.showZ
                result.direction = 'z'
                result.result = this.transform.showZ
                break
        }
        return result
    }
    enabledTransform(flag) {
        if ([true, false].includes(flag)) this.transform.enabled = flag
        else this.transform.enabled = !this.transform.enabled
        return this.transform.enabled
    }
    dispose() {
        this.transform.detach()
        this.transform.dispose()
        this.transform = null
    }
}

export default TransformLoader