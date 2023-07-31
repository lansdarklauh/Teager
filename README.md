# Teager-3d：基于Threejs与相关项目封装的个人使用的3D模型编辑库

## 1.初始化函数 Teager

### constructor(container?: HTMLElement, material?: THREE.Material, selectedMaterial?: THREE.Material | boolean);
构造函数：传入要生成canvas的父元素，材料，选中时材料

### init(container?: HTMLElement, material?: THREE.Material, selectedMaterial?: THREE.Material, grid?: number[] | boolean, axes?:number | boolean): void;
初始化函数：传入要生成canvas的父元素，材料，选中时材料，平台尺寸（大小，行数/列数，中线颜色，线颜色），坐标轴长度

### initClickEvent(cb?: Function): void;
初始化点击模型事件，传入点击后的回调事件

### removeClickEvent(): void;
去除点击模型事件执行方法

### resetScene(clearModels?: Boolean): void;
重置场景

### changeCameraDirection: (direction: string, callBack: Function, time?: number) => void;
改变相机方向，传入方向（六个方向，小写），回调函数与回调延迟

### changeCameraDistance: (distance: number, callBack: Function, time?: number) => void;
改变相机距离，传入距离，回调函数与回调延迟

### addModels(models: Model, material?: THREE.Material, center?: boolean, computePositon?: boolean): any[];
添加模型，可传入mesh/geometry/mesh数组/geometry数组，材料，并可决定是否居中和使用装箱算法，返回mesh数组

### computeModelsPosition(modelsMesh: THREE.Mesh[], computeBox?: boolean): THREE.Mesh[];
对指定模型使用装箱算法，可决定是否重新算盒子

### removeModels(models: Model): boolean;
移除模型，可传入mesh/字符串/mesh数组/字符串数组

### destory(): void;
清除场景与模型


## 2.移动控件 TransformLoader

### constructor(scene: THREE.Scene, camera: THREE.Camera, renderer: THREE.WebGLRenderer, control: any);
构造函数：场景、相机、渲染器、控制器，初始化控制器

### attachModel(model: THREE.Mesh | string): void;
绑定模型，将控制器与指定模型绑定

### detachModel(): void;
解除绑定，将控制器与模型解绑

### checkCollisions(): THREE.Mesh[];
检测碰撞（使用three-mesh-bvh），检测控制器模型是否与指定模型碰撞

### changeMode(str: Mode): void;
修改控制器模式（translate:移动，rotate：旋转，scale：缩放）

### changeLocation(mode: 0 | 1): void;
修改控制器坐标模式（可理解为是否让控制器跟着模型旋转）

### changeSnap(mode: Mode, number: number): void;
修改控制器移动步幅，注意缩放需要用小数

### changeSize(num: number): void;
修改控制器的大小

### showDirection(direction: 'x' | 'y' | 'z', flag?: boolean): {direction: string，result: boolean};
修改控制器规定轴的显示状态，返回对象为轴与显示状态

### enabledTransform(flag: any): any;
修改控制器是否可用

### dispose(): void;
销毁控制器

## 3.加载模型 ModelLoader

### constructor();
初始化导入导出器

### loadModel(str: string, url: string | Blob): Promise<Result>;
加载模型，传入类型与模型的url或数据流

### loadFont(param: Partial<param>, str?: string | Blob): Promise<Result>;
加载字体，传入字体内容与所需参数（参考threejs中的textgeometry参数需求，字体内容为param.content）和字体模型

### exportModels(models: THREE.Mesh[], format: 'obj' | 'stl' | 'gltf', name?: string): Blob;
导出模型，传入需导出为一个模型文件的模型（可多个，结果合并为一个），模型的类型与模型名字（无需拓展名）