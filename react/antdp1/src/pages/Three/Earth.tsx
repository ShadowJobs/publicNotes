import { FrontendPre } from "@/global";
import { useEffect } from "react";
import * as THREE from "three"
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js'

// 声明全局变量
let camera, scene, renderer, labelRenderer;
let moon, earth;
let clock = new THREE.Clock();
// 实例化纹理加载器
const textureLoader = new THREE.TextureLoader();
function init() {
    // 地球和月球半径大小
    const EARTH_RADIUS = 2.5;
    const MOON_RADIUS = 0.27;
    // 实例化相机
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 200);
    camera.position.set(10, 5, 20);

    // 实例化场景
    scene = new THREE.Scene();
    // 创建聚光灯光源创建添加
    const dirLight = new THREE.SpotLight(0xffffff);
    dirLight.position.set(0, 0, 10);
    dirLight.intensity = 2;
    dirLight.castShadow = true;
    scene.add(dirLight)
    // 添加环境光
    const aLight = new THREE.AmbientLight(0xffffff)
    aLight.intensity = 0.3
    scene.add(aLight)

    // 创建月球
    const moonGeometry = new THREE.SphereGeometry(MOON_RADIUS, 16, 16);
    const moonMaterial = new THREE.MeshPhongMaterial({
        map: textureLoader.load(`${FrontendPre}/threeres/textures/planets/moon_1024.jpg`)
    })
    moon = new THREE.Mesh(moonGeometry, moonMaterial)
    moon.receiveShadow = true;
    moon.castShadow = true;
    scene.add(moon)
    // 创建地球
    const earthGeometry = new THREE.SphereGeometry(EARTH_RADIUS, 16, 16);
    const earthMaterial = new THREE.MeshPhongMaterial({
        shininess: 5,
        map: textureLoader.load(`${FrontendPre}/threeres/textures/planets/earth_atmos_2048.jpg`),
        specularMap: textureLoader.load(`${FrontendPre}/threeres/textures/planets/earth_specular_2048.jpg`),
        normalMap: textureLoader.load(`${FrontendPre}/threeres/textures/planets/earth_normal_2048.jpg`)
    })

    earth = new THREE.Mesh(earthGeometry, earthMaterial);
    earth.receiveShadow = true;
    earth.castShadow = true;
    scene.add(earth)

    const earthDiv = document.createElement('div');
    earthDiv.className = 'label';
    earthDiv.textContent = 'Earch';

    const eartchLabel = new CSS2DObject(earthDiv)
    eartchLabel.position.set(0, EARTH_RADIUS + 0.5, 0);
    earth.add(eartchLabel)

    const moonDiv = document.createElement('div');
    moonDiv.className = 'label';
    moonDiv.textContent = 'Moon';
    const moonLabel = new CSS2DObject(moonDiv)
    moonLabel.position.set(0, MOON_RADIUS + 0.5, 0);
    moon.add(moonLabel)

    renderer = new THREE.WebGLRenderer({
        alpha: true
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    // 渲染阴影
    renderer.shadowMap.enabled = true;
    document.getElementById("webgl-output").appendChild(renderer.domElement)

    // 标签渲染器
    labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize(window.innerWidth, window.innerHeight)
    labelRenderer.domElement.style.position = 'absolute';
    labelRenderer.domElement.style.top = '0px';
    document.getElementById("webgl-output").appendChild(labelRenderer.domElement)

    // 绑定控制和摄像头
    const controls = new OrbitControls(camera, renderer.domElement)
}
var oldtime = 0;
function animate() {
    const elapsed = clock.getElapsedTime();
    moon.position.set(Math.sin(elapsed) * 5, 0, Math.cos(elapsed) * 5);
    // 地球自转
    var axis = new THREE.Vector3(0, 1, 0);
    earth.rotateOnAxis(axis, (elapsed - oldtime) * Math.PI / 10);
    renderer.render(scene, camera)
    labelRenderer.render(scene, camera)
    oldtime = elapsed;
    requestAnimationFrame(animate)
}

// 调整尺寸
window.onresize = function () {
    if(!camera) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight)
}
 const Earth: React.FC = () => {
    useEffect(()=>{ init();
        animate() },[])
    return <div style={{backgroundColor:"#0"}}>
        地球
	    <div id="webgl-output"></div>
    </div>
}
export default Earth;