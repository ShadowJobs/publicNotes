import { useEffect } from "react";
import * as THREE from "three"
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
function drawSegment(scene,renderer,camera){
    var material = new THREE.LineBasicMaterial({ color: 0x0000ff });
    const points = [];
    points.push( new THREE.Vector3( - 5, 0, 0 ) );
    points.push( new THREE.Vector3( -5, 0, -5 ) );
    points.push( new THREE.Vector3( 5, 5,-5 ) );
    points.push( new THREE.Vector3( 5, 5, 5 ) );
    points.push( new THREE.Vector3( -2.5, 5, 5 ) );
    points.push( new THREE.Vector3( -2.5, 5, -2.5 ) );

    for ( var i = 0; i < 200; i ++ ) {
        points.push( new THREE.Vector3(
            Math.cos(i/100*2*Math.PI)*10,
            i/100+10,
            Math.sin( i / 100 * Math.PI * 2 ) * 10,
        ) );
    }

    const geometry = new THREE.BufferGeometry().setFromPoints( points );
    var line = new THREE.Line(geometry, material);
    scene.add(line);
    renderer.render(scene, camera)
}
function init() {
    // 创建场景
    var scene = new THREE.Scene();
    // 设置摄像机
    var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 2000)
    // 创建渲染器
    var renderer = new THREE.WebGLRenderer();
    // 设置渲染器的初始颜色
    renderer.setClearColor(new THREE.Color(0xeeeeee));
    // 设置输出canvas画面的大小
    renderer.setSize(window.innerWidth, window.innerHeight)
    // 设置渲染物体阴影
    renderer.shadowMapEnabled = true;
    // 显示三维坐标系
    // var axes = new THREE.AxisHelper(20)
    var axes = new THREE.AxesHelper(20)
    // 添加坐标系到场景中
    scene.add(axes);
    // 创建地面的几何体
    var planeGeometry = new THREE.PlaneGeometry(60, 20);
    // 给地面物体上色
    var planeMaterial = new THREE.MeshBasicMaterial({ color: 0xcccccc });
    // 创建地面
    var plane = new THREE.Mesh(planeGeometry, planeMaterial)
    // 物体移动位置
    // plane.rotation.x = -0.5 * Math.PI;
    // plane.position.x = 15;
    plane.rotation.x = -0.5 * Math.PI;
    plane.position.x = 0;
    plane.position.y = 0;
    plane.position.z = 0;
    plane.castShadow = true;
    // 接收阴影
    plane.receiveShadow = true;

    // 将地面添加到场景中
    scene.add(plane);

    // 创建聚光灯
    var spotLight = new THREE.SpotLight(0xFFFFFF);
    spotLight.position.set(130, 130, -130);
    spotLight.castShadow = true;
    // 添加聚光灯
    scene.add(spotLight)

    // 定位相机，并且指向场景中心
    camera.position.x = 30;
    camera.position.y = 30;
    camera.position.z = 30;
    camera.lookAt(scene.position)

    drawSegment(scene,renderer,camera)

    // 将渲染器输出添加html元素中
    document.getElementById('webgl-output').appendChild(renderer.domElement);
    renderer.render(scene, camera)

    // 创建controls对象;  支持鼠标操作
    var controls = new OrbitControls(camera, renderer.domElement)
    // 监听控制器的鼠标事件，执行渲染内容
    controls.addEventListener('change', () => {
        renderer.render(scene, camera)
    })
}
 const Three1: React.FC = () => {
    useEffect(()=>{ init() },[])
    return <div>
        汽车轨迹
	    <div id="webgl-output"></div>
    </div>
}
export default Three1;