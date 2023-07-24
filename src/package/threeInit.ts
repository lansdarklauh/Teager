import THREE from "./index"
import { TrackballControl } from "three/examples/jsm/controls/TrackballControls"

type Model = (string | THREE.Mesh | THREE.BufferGeometry | (THREE.Mesh | THREE.BufferGeometry)[] | string[])

class Teager {
    scene: THREE.Scene
    camera: THREE.Camera
    light: THREE.Light
    renderer: THREE.WebGLRenderer
    control: any
    container: HTMLElement
    material: THREE.Material
    clock: THREE.Clock = new THREE.Clock()
    animateId: number

    constructor(container?: HTMLElement, material?: THREE.Material) {
        // Initialising the scene and camera
        this.container = container ? container : undefined
        this.scene = new THREE.Scene()
        this.camera = new THREE.PerspectiveCamera(90, this.container.offsetWidth / this.container.offsetHeight, 0.1, 1000)
        this.light = new THREE.DirectionalLight(0xffffff)
        this.renderer = new THREE.WebGLRenderer()
        this.material = material ? material : new THREE.MeshStandardMaterial()
    }
    init(container?: HTMLElement, material?: THREE.Material) {
        // Initialise the controller and render
        if (!this.container) {
            if (!container) {
                console.log('there is no container')
                return
            }
            this.container = container
        }
        if (material) {
            this.material = material
        }
        this.camera.position.set(0, 200, 100)
        this.camera.lookAt(this.scene.position)
        this.renderer.setClearColor(0x1d1d1d)
        this.renderer.setSize(this.container.offsetWidth, this.container.offsetHeight)
        container.appendChild(this.renderer.domElement)
        this.control = TrackballControl(this.camera, this.renderer.domElement)
        this.container.addEventListener('resize', this.resize)
        this.animate()
    }
    private resize = () => {
        // Change the renderer and camera when window resized
        this.camera.aspect = this.container.offsetWidth / this.container.offsetHeight
        this.camera.updateProjectionMatrix()
        this.renderer.setSize(this.container.offsetWidth, this.container.offsetHeight)
    }
    private render() {
        const delta = this.clock.getDelta()
        this.renderer.render(this.scene, this.camera)
        this.control.update(delta)
    }
    private animate = () => {
        this.animateId = requestAnimationFrame(this.animate)
        this.render()
    }
    addModels(models: Model, material?: THREE.Material) {
        // add models to the scene, it can assign custom material
        if (!this.container) return []
        const modelsMesh = []
        if (!models || models.length === 0) {
            console.log('there is no model add')
            return []
        }
        if (!models.length) {
            if (models.isMesh) {
                this.scene.add(models)
                modelsMesh.push(models)
            } else if (models.isBufferGeometry) {
                const mesh: THREE.Mesh = new THREE.Mesh(models, material.clone() || this.material.clone())
                if (models.name) mesh.name = models.name
                this.scene.add(mesh)
                modelsMesh.push(mesh)
            }
        } else {
            models.forEach(item => {
                if (item.isMesh) {
                    this.scene.add(item)
                    modelsMesh.push(item)
                } else if (item.isBufferGeometry) {
                    const mesh = new THREE.Mesh(item, material.clone() || this.material.clone())
                    if (item.name) mesh.name = item.name
                    this.scene.add(mesh)
                    modelsMesh.push(mesh)
                }
            })
        }
        return modelsMesh
    }
    removeModels(models: Model) {
        // remove models and its/their children
        if (!this.container) return false
        if (!models || models.length === 0) {
            console.log('there is no model add')
            return true
        }
        if (!models.length) {
            if (models.isMesh) {
                models.geometry && models.geometry.dispose()
                models.material && models.material.dispose()
                this.scene.remove(models)
                if (models.children.length !== 0) {
                    for (let i = models.children.length - 1; i >= 0; i--) {
                        this.removeModels(models.children[i])
                    }
                }
            } else if (typeof models === 'string') {
                for (let i = this.scene.children.length - 1; i >= 0; i--) {
                    const model = this.scene.children[i]
                    if (model.name === models) {
                        model.geometry && model.geometry.dispose()
                        model.material && model.material.dispose()
                        this.scene.remove(model)
                        if (model.children.length !== 0) {
                            for (let i = model.children.length - 1; i >= 0; i--) {
                                this.removeModels(model.children[i])
                            }
                        }
                    }
                }
            } else {
                models.geometry && models.geometry.dispose()
                models.material && models.material.dispose()
                this.scene.remove(models)
                if (models.children && models.children.length !== 0) {
                    for (let i = models.children.length - 1; i >= 0; i--) {
                        this.removeModels(models.children[i])
                    }
                }
            }
        } else {
            models.forEach(item => {
                if (item.isMesh) {
                    item.geometry && item.geometry.dispose()
                    item.material && item.material.dispose()
                    this.scene.remove(item)
                    if (item.children.length !== 0) {
                        for (let i = item.children.length - 1; i >= 0; i--) {
                            this.removeModels(item.children[i])
                        }
                    }
                } else if (typeof item === 'string') {
                    for (let i = this.scene.children.length - 1; i >= 0; i--) {
                        const model = this.scene.children[i]
                        if (model.name === item) {
                            model.geometry && model.geometry.dispose()
                            model.material && model.material.dispose()
                            this.scene.remove(model)
                            if (model.children.length !== 0) {
                                for (let i = model.children.length - 1; i >= 0; i--) {
                                    this.removeModels(model.children[i])
                                }
                            }
                        }
                    }
                }
            })
        }
    }
    destory() {
        // destory all include renderer, scene and models
        if (!this.container) return
        for (let i = this.scene.children.length - 1; i >= 0; i--) {
            this.removeModels(this.scene.children[i])
        }
        cancelAnimationFrame(this.animateId)
        this.container.removeEventListener('resize', this.resize)
        this.container.removeChild(this.renderer.domElement)
        this.renderer.dispose()
        this.renderer.forceContextLoss()
        this.renderer.domElement = null
        this.renderer = null
        this.scene.clear()
        this.scene = null
        this.camera = null
        this.light.dispose()
        this.light = null
        this.control = null
        this.material.dispose()
        this.material = null
    }
}

export default Teager