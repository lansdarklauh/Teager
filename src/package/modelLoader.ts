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

class ModelLoader {
    fontLoader: THREE.Loader
    stlLoader: THREE.Loader
    objLoader: THREE.Loader
    gltfLoader: THREE.Loader
    textureLoader: THREE.Loader

    constructor() {

    }
    //load model, include obj, stl, gltf
    loadModel(str: string, url: string | Blob) {
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
                                reject(err)
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
                                reject(err)
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
                                reject(err)
                            }
                    })
                    break;
                default:
                    reject('Unknown Model')
                    break;
            }
        })
    }
    //load text, can load font or use default font
    loadFont(param: Partial<param>, str?: string | Blob) {
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
                        reject(err)
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
                            reject(result)
                        }

                    }
                    reader.onerror = err => {
                        reject(err)
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
                this.objLoader = new OBJExporter()
                result = new Blob([this.objLoader.parse(group)], { type: 'application/octet-stream' })
                return result
            case 'stl':
                this.stlLoader = new STLExporter()
                result = new Blob([this.stlLoader.parse(group, { binary: true })], { type: 'application/octet-stream' })
                return result
            case 'gltf':
                this.gltfLoader = new GLTFExporter()
                this.gltfLoader.parse(
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