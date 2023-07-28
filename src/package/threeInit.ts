import THREE from "./index"
import { TrackballControls } from "three/examples/jsm/controls/TrackballControls"
import { Direction, modelsLinkedList } from "./static"
//tweenjs: animation about camera(not only in fact)
import * as TWEEN from "@tweenjs/tween.js"

type Model = (string | THREE.Mesh | THREE.BufferGeometry | (THREE.Mesh | THREE.BufferGeometry)[] | string[])

class Teager {
    scene: THREE.Scene
    camera: THREE.Camera
    light: THREE.Light
    renderer: THREE.WebGLRenderer
    control: any
    container: HTMLElement
    material: THREE.Material
    selectedMaterial: THREE.Material
    clock: THREE.Clock = new THREE.Clock()
    animateId: number
    Grid: THREE.Object3D
    GridSize: number[]
    Axes: THREE.Object3D
    raycaster: THREE.Raycaster
    removeClickEvent: Function

    constructor(container?: HTMLElement, material?: THREE.Material, selectedMaterial?: THREE.Material | boolean) {
        // Initialising the scene and camera
        this.container = container ? container : undefined
        this.scene = new THREE.Scene()
        this.camera = new THREE.PerspectiveCamera(90, this.container.clientWidth / this.container.clientHeight, 0.1, 1000)
        this.light = new THREE.DirectionalLight(0xffffff)
        this.renderer = new THREE.WebGLRenderer()
        this.material = material ? material : new THREE.MeshStandardMaterial()
        this.selectedMaterial = selectedMaterial ? selectedMaterial === true ? new THREE.MeshStandardMaterial({
            color: 0x049ef4
        }) : selectedMaterial : null
    }
    init(container?: HTMLElement, material?: THREE.Material, selectedMaterial?: THREE.Material, grid: number[] | boolean = [100, 10, 0x000000, 0x000000], axes: number | boolean = 100) {
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
        if (selectedMaterial) {
            this.selectedMaterial = selectedMaterial
        }
        this.camera.position.set(0, 200, 100)
        this.camera.lookAt(this.scene.position)
        //[size,dive,centerLineColor,lineColor],color must be a hexadecimal number
        if (grid && Array.isArray(grid) && grid.length === 4) {
            this.Grid = new THREE.GridHelper(grid[0], grid[1], grid[2], grid[3])
            this.GridSize = grid
            this.scene.add(this.Grid)
        }
        if (axes) {
            this.Axes = new THREE.AxesHelper(axes !== true ? axes : 100)
            this.scene.add(this.Axes)
        }
        this.renderer.setClearColor(0x1d1d1d)
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight)
        this.container.appendChild(this.renderer.domElement)
        this.control = TrackballControls(this.camera, this.renderer.domElement)
        this.control.addEventListener('change',)
        this.container.addEventListener('resize', this.resize)
        this.animate()
    }
    private resize = () => {
        // Change the renderer and camera when window resized
        this.camera.aspect = this.container.clientWidth / this.container.clientHeight
        this.camera.updateProjectionMatrix()
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight)
    }
    private render() {
        const delta = this.clock.getDelta()
        TWEEN.update()
        this.renderer.render(this.scene, this.camera)
        this.control.update(delta)
    }
    private animate = () => {
        this.animateId = requestAnimationFrame(this.animate)
        this.render()
    }
    //select model event
    initClickEvent(cb?: Function) {
        if (this.selectedMaterial) {
            if (!this.raycaster) {
                this.raycaster = new THREE.Raycaster()
                this.raycaster.firstHitOnly = true;
            }
            const func = (e) => { this.selectModel(e, cb) }
            this.container.addEventListener('click', func)
            this.removeClickEvent = () => {
                this.container.removeEventListener('click', func)
            }
        }
    }
    // change model color when select model (only one).If click in the blank area, return null
    selectModel(e: MouseEvent, cb?: Function) {
        const pointer = {
            x: (e.clientX / this.container.clientWidth) * 2 - 1,
            y: - (e.clientY / this.container.clientHeight) * 2 + 1
        }
        let model: THREE.Mesh | null = null
        this.raycaster.setFromCamera(pointer, this.camera)
        const models = this.scene.children.filter(item => item.isMesh)
        const intersects = this.raycaster.intersectObjects(models)
        models.forEach(mesh => {
            if (mesh.originMaterial) {
                mesh.material = mesh.originMaterial
            } else {
                mesh.material = this.material
            }
        })
        if (intersects.length) {
            model = intersects[0].object
            if (model.material !== this.material) {
                model.originMaterial = model.material
            }
            model.material = this.selectedMaterial
        }
        cb && cb(model)
    }
    resetScene(clearModels: Boolean = false) {
        //reset camera and renderer, can clear models
        this.camera.position.set(0, 200, 100)
        this.camera.lookAt(this.scene.position)
        this.renderer.setClearColor(0x1d1d1d)
        if (clearModels) {
            for (let i = this.scene.children.length - 1; i >= 0; i--) {
                if (this.scene.children[i].isMesh) this.removeModels(this.scene.children[i])
            }
        }
        this.render()
    }
    changeCameraDirection = (direction: string, callBack: Function, time: number = 1000) => {
        //change camera direction, include 6 directions
        if (direction && Direction[direction]) {
            const position = this.camera.position
            const distance = Math.sqrt(((position.x) ^ 2) + ((position.y) ^ 2) + ((position.z) ^ 2))
            const locate = Direction[direction]
            const cameraRotate = new TWEEN.Tween(position)
                .to(new THREE.Vector3(locate[0] * distance, locate[1] * distance, locate[2] * distance), time)
                .easing(TWEEN.Easing.Linear.InOut)
                .onUpdate(function () {
                    this.camera.positon.set(this.x, this.y, this.z)
                })
            cameraRotate.start()
            setTimeout(() => {
                callBack && callBack()
            }, time)
        } else {
            console.log('there is no direction given')
        }
    }
    changeCameraDistance = (distance: number, callBack: Function, time: number = 1000) => {
        // Change camera distance to (0,0)
        const position = this.camera.position
        const oldDistance = Math.sqrt(((position.x) ^ 2) + ((position.y) ^ 2) + ((position.z) ^ 2))
        const cameraRotate = new TWEEN.Tween(position)
            .to(new THREE.Vector3(position.x * distance / oldDistance, position.y * distance / oldDistance, position.z * distance / oldDistance), time)
            .easing(TWEEN.Easing.Linear.InOut)
            .onUpdate(function () {
                this.camera.positon.set(this.x, this.y, this.z)
            })
        cameraRotate.start()
        setTimeout(() => {
            callBack && callBack()
        }, time)
    }
    addModels(models: Model, material?: THREE.Material, center: boolean = true, computePositon: boolean = true) {
        // Add models to the scene, it can assign custom material
        // center: Let model centre, model will raise on the platform (z = 0)
        // If multiple models are passed in and centred, the position is automatically calculated
        if (!this.container) return []
        const modelsMesh = []
        if (!models || models.length === 0) {
            console.log('there is no model add')
            return []
        }
        if (!models.length) {
            if (models.isMesh) {
                models.geometry.computeBoundingBox()
                models.geometry.center = models.geometry.boundingBox.getCenter().clone()
                if (center) {
                    models.geometry.center()
                }
                if (this.selectedMaterial) models.geometry.computeBoundsTree()
                models.position.set(models.position.x, models.position.y, center ? (models.geometry.boundingBox.max.z) : models.position.z)
                this.scene.add(models)
                modelsMesh.push(models)
            } else if (models.isBufferGeometry) {
                models.computeBoundingBox()
                models.center = models.boundingBox.getCenter().clone()
                if (center) {
                    models.center()
                }
                if (this.selectedMaterial) models.geometry.computeBoundsTree()
                const mesh: THREE.Mesh = new THREE.Mesh(models, material.clone() || this.material)
                mesh.position.set(mesh.position.x, mesh.position.y, center ? (mesh.geometry.boundingBox.max.z) : mesh.position.z)
                if (models.name) mesh.name = models.name
                this.scene.add(mesh)
                modelsMesh.push(mesh)
            } else {
                console.log('there is no model add')
                return []
            }
        } else {
            models.forEach(item => {
                if (item.isMesh) {
                    item.geometry.computeBoundingBox()
                    item.geometry.center = item.geometry.boundingBox.getCenter().clone()
                    if (center) {
                        item.geometry.center()
                    }
                    if (this.selectedMaterial) item.geometry.computeBoundsTree()
                    item.position.set(item.position.x, item.position.y, center ? (item.geometry.boundingBox.max.z) : item.position.z)
                    this.scene.add(item)
                    modelsMesh.push(item)
                } else if (item.isBufferGeometry) {
                    item.computeBoundingBox()
                    item.center = item.boundingBox.getCenter().clone()
                    if (center) {
                        item.center()
                    }
                    if (this.selectedMaterial) item.geometry.computeBoundsTree()
                    const mesh = new THREE.Mesh(item, material.clone() || this.material)
                    mesh.position.set(mesh.position.x, mesh.position.y, center ? (mesh.geometry.boundingBox.max.z) : mesh.position.z)
                    if (item.name) mesh.name = item.name
                    this.scene.add(mesh)
                    modelsMesh.push(mesh)
                }
            })
        }
        if (center && computePositon) {
            return this.computeModelsPosition(this.scene.children.filter(item => item.isMesh))
        }
        else {
            return modelsMesh
        }
    }
    computeModelsPosition(modelsMesh: THREE.Mesh[], computeBox: boolean = true) {
        if (!modelsMesh || modelsMesh.length <= 1) return
        let modelList: modelsLinkedList | null = null
        let lastNode: modelsLinkedList | null = null
        // Recursively compare each model in the linked list with the specified model, find node to insert
        function appendModel(LinkedList: modelsLinkedList | null, model: THREE.Mesh) {
            if (LinkedList === null) {
                modelList = {
                    model: model,
                    next: null
                }
            } else {
                if (LinkedList.model.area < model.area) {
                    if (lastNode === null) {
                        modelList = {
                            model: model,
                            next: LinkedList
                        }
                    } else {
                        lastNode.next = {
                            model: model,
                            next: LinkedList
                        }
                    }
                    lastNode = null
                } else if (LinkedList.next === null) {
                    LinkedList.next = {
                        model: model,
                        next: null
                    }
                    lastNode = null
                }
                else {
                    lastNode = LinkedList
                    appendModel(LinkedList.next, model)
                }
            }
        }
        // Calculate the area of the model and form a chained list from largest to smallest
        modelsMesh.forEach(model => {
            model.geometry.center()
            if (computeBox) model.geometry.computeBoundingBox()
            const box = model.geometry.boundingBox
            model.size = box.getSize()
            model.area = model.size.x * model.size.y
            appendModel(modelList, model)
        })
        let maxPos = { sumHeight: 0, maxHeight: 0, width: 0 }
        let sumHeight = 0
        let modelListArray: THREE.Mesh[] = []
        // Recursively chaining the model into rows, using the default width of the Grid as the row width of the arrangement, and calculating the row height of each column
        function computePositon(List: modelsLinkedList | null) {
            const model = List.model
            model.pos = {}
            if (maxPos.width + model.size.x / 2 > this.GridSize) {
                let lastHeight = maxPos.maxHeight
                sumHeight += lastHeight
                maxPos = {
                    sumHeight: sumHeight,
                    maxHeight: 0,
                    width: 0
                }
            }
            if (model.size.y > maxPos) maxPos.maxHeight = model.size.y
            model.pos.width = maxPos.width + model.size.x / 2 + 5
            maxPos.width = model.pos.width
            model.pos.maxPos = maxPos
            modelListArray.push(model)
            if (List.next !== null) {
                computePositon(List.next)
            } else {
                let lastHeight = maxPos.maxHeight
                sumHeight += lastHeight
            }
        }
        computePositon(modelList)

        function clearLinkedList(List: modelsLinkedList | null) {
            if (List === null) return
            const next = List.next
            delete List.model
            delete List.next
            clearLinkedList(next)
        }
        clearLinkedList(modelList)

        // Calculate the model position so that the scene origin is in the middle of the enclosing box made up of all models
        modelListArray.forEach(mesh => {
            mesh.position.set(mesh.pos.width - this.GridSize[0] / 2, (mesh.pos.maxPos.sumHeight + mesh.pos.maxPos.maxHeight) - (sumHeight / 2), mesh.position.z)
            delete mesh.pos.maxPos
            delete mesh.pos
        })
        if (this.GridSize[0] < sumHeight) {
            this.Grid.geometry && this.Grid.geometry.dispose()
            this.Grid.material && this.Grid.material.dispose()
            this.scene.remove(this.Grid)
            this.Grid = new THREE.GridHelper(sumHeight, this.GridSize[1], this.GridSize[2], this.GridSize[3])
            this.scene.add(this.Grid)
        }
        return modelListArray
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
        this.Grid = null
        this.Axes = null
    }
}

export default Teager