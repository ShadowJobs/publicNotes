import { useEffect } from "react";
import * as THREE from "three"
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import './style.css'
import * as dat from 'dat.gui'
import CityClass from './city';
function init(){
    // Debug
    const gui = new dat.GUI()
    const canvas = document.querySelector('canvas.webgl')
    const scene = new THREE.Scene()
    const textureLoader = new THREE.TextureLoader()

    // 环境光
    const light = new THREE.AmbientLight(0xadadad); // soft white light
    scene.add(light);
    // 平行光源
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(100, 100, 0);
    scene.add(directionalLight);

    const sizes = {
        width: window.innerWidth,
        height: window.innerHeight
    }

    // 用来调整当浏览器尺寸发生改变，及时进行调整摄像机和渲染器
    window.addEventListener('resize', () => {
        // Update sizes
        sizes.width = window.innerWidth
        sizes.height = window.innerHeight

        camera.aspect = sizes.width / sizes.height
        // 更新投影的变换矩阵
        camera.updateProjectionMatrix()
        renderer.setSize(sizes.width, sizes.height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    })

    // Base camera
    const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 1, 10000)
    camera.position.set(1200, 700, 121)
    scene.add(camera)

    const controls = new OrbitControls(camera, canvas)
    // 是否启用控制器阻尼（惯性）
    controls.enableDamping = true

    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        // 是否执行抗锯齿。默认为false.
        antialias: true,
        //  canvas是否包含alpha (透明度)。默认为 false
        alpha: true
    })
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(new THREE.Color('#32373E'), 1);

    const city = new CityClass({});
    scene.add(city.group);
    const clock = new THREE.Clock()
    const tick = () => {
        const dt = clock.getDelta();
        city.animate(dt);
        controls.update()
        renderer.render(scene, camera)
        // Call tick again on the next frame
        window.requestAnimationFrame(tick)
    }
    tick()
}
 const City: React.FC = () => {
    useEffect(()=>{ 
        init()
    },[])
    return <div > 城市
        <canvas className="webgl"></canvas>
    </div>
}
export default City;