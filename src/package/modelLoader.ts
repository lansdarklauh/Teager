import THREE from "./index"
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry'
import HelvetikerFont from 'three/examples/fonts/helvetiker_bold.typeface.json'
import { STLExporter } from 'three/examples/jsm/exporters/STLExporter'
import { OBJExporter } from 'three/examples/jsm/exporters/OBJExporter'
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter'

interface param {
    content: string,
    size: number,
    height: number,
    curveSegments: number
    bevelEnabled: boolean
    bevelThickness: number
    bevelSize: number
    bevelSegments: number
}

interface Result {
    result: THREE.Object3D | null,
    type: string
}

class ModelLoader {
    fontLoader: THREE.Loader
    stlLoader: THREE.Loader
    objLoader: THREE.Loader
    gltfLoader: THREE.Loader
    stlExporter: any
    objExporter: any
    gltfExporter: any

    constructor() {

    }
    //load model, include obj, stl, gltf
    loadModel(str: string, url: string | Blob): Promise<Result> {
        return new Promise((resolve, reject) => {
            const loadName = str.toLowerCase()
            let content = typeof url === 'string' ? url : URL.createObjectURL(url)
            switch (loadName) {
                case 'obj':
                    this.objLoader = new OBJLoader()
                    this.objLoader.load(content, (object) => {
                        resolve({
                            result: object,
                            type: 'mesh'
                        }),
                            () => { },
                            (err) => {
                                reject({
                                    result: err,
                                    type: 'err'
                                })
                            }
                    })
                    break;
                case 'stl':
                    this.stlLoader = new STLLoader()
                    this.stlLoader.load(content, (geometry) => {
                        resolve({
                            result: geometry,
                            type: 'geometry'
                        }),
                            () => { },
                            (err) => {
                                reject({
                                    result: err,
                                    type: 'err'
                                })
                            }
                    })
                    break;
                case 'gltf':
                    this.gltfLoader = new GLTFLoader()
                    this.gltfLoader.load(content, (scene) => {
                        resolve({
                            result: scene,
                            type: 'scene'
                        }),
                            () => { },
                            (err) => {
                                reject({
                                    result: err,
                                    type: 'err'
                                })
                            }
                    })
                    break;
                default:
                    reject({
                        result: null,
                        type: 'err'
                    })
                    break;
            }
        })
    }
    //load text, can load font or use default font
    loadFont(param: Partial<param>, str?: string | Blob): Promise<Result> {
        if (!param || !param.content) {
            console.log('there is no text')
            return
        }
        const obj = JSON.parse(JSON.stringify(param))
        delete obj.content
        this.fontLoader = new FontLoader()
        return new Promise((resolve, reject) => {
            if (str) {
                if (typeof str === 'string') {
                    this.fontLoader.load(str, (font) => {
                        obj.font = font
                        const geometry = new TextGeometry(param.content, obj)
                        resolve({
                            result: geometry,
                            type: 'geometry'
                        })
                    }, () => { }, (err) => {
                        reject({
                            result: err,
                            type: 'err'
                        })
                    })
                } else {
                    const reader = new FileReader()
                    reader.onload = res => {
                        const { result } = res.target
                        if (typeof result === 'string') {
                            const data = JSON.parse(result)
                            const font = this.fontLoader.parse(data)
                            obj.font = font
                            const geometry = new TextGeometry(param.content, obj)
                            resolve({
                                result: geometry,
                                type: 'geometry'
                            })
                        } else {
                            reject({
                                result: result,
                                type: 'err'
                            })
                        }

                    }
                    reader.onerror = err => {
                        reject({
                            result: err,
                            type: 'err'
                        })
                    }
                    reader.readAsText(str, 'utf-8')
                }
            } else {
                obj.font = HelvetikerFont
                const geometry = new TextGeometry(param.content, obj)
                resolve({
                    result: geometry,
                    type: 'geometry'
                })
            }
        })
    }
    //export model(include obj, stl, gltf)
    exportModels(models: THREE.Mesh[], format: 'obj' | 'stl' | 'gltf', name: string = 'model') {
        if (!models.length) return null
        const group = new THREE.Group()
        models.forEach(item => {
            group.add(item)
        })
        let result: Blob | null = null
        switch (format.toUpperCase()) {
            case 'obj':
                this.objExporter = new OBJExporter()
                result = new Blob([this.objExporter.parse(group)], { type: 'application/octet-stream' })
                return result
            case 'stl':
                this.stlExporter = new STLExporter()
                result = new Blob([this.stlExporter.parse(group, { binary: true })], { type: 'application/octet-stream' })
                return result
            case 'gltf':
                this.gltfExporter = new GLTFExporter()
                this.gltfExporter.parse(
                    group,
                    arrayBuffer => {
                        result = new Blob([JSON.stringify(arrayBuffer)], { type: 'text/plain' })
                        return result
                    }
                )
                break
            default:
                return null
        }
    }
}

export default ModelLoader