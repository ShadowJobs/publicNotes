//本例不要求运行起来，只是为了演示

import * as THREE from "three"
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import React, { useRef, useEffect, useLayoutEffect, Suspense, useState, useMemo } from 'react';
import { Canvas, useLoader, useThree } from '@react-three/fiber';
import { PCDLoader } from './PCDLoader';

import {
  usePCD,
  useMCircle,
  useMInstances,
  useMInstanceGTConfig,
  useMInstanceDTConfig,
  useMInstanceGTFilter,
  useMInstanceDTFilter,
  MInstanceFilterState,
} from './store';
import { MInstanceColorMap, MPolylineColorMap } from './config';
import { UseStore } from 'zustand';

const LidarPC: React.FC<{
  pcdURL: string;
  GTInstances?: PCDATA.PCDInstance[];
  DTInstances?: PCDATA.PCDInstance[];
  HLInstance?: PCDATA.PCDInstance | null;
  polylineInstances?: MDI_TYPING.PolylineInstance[];
  colorMap?: object;
  useFilter?: UseStore<MInstanceFilterState>;
  style?: React.CSSProperties;
  setClickBox?: (box: {}) => void;
}> = ({
  pcdURL,
  GTInstances = [],
  DTInstances = [],
  HLInstance = null,
  polylineInstances = [],
  colorMap = MInstanceColorMap,
  useFilter = useMInstanceGTFilter,
  style,
  setClickBox
}) => {
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const [pcd, setPcd] = useState<THREE.Points<THREE.BufferGeometry, THREE.PointsMaterial>>();

  const CAMERA_S = 40;

  const PCD: React.FC<{ pcdURL: string }> = ({ pcdURL }) => {
    const pcd = useLoader(PCDLoader, pcdURL) as THREE.Points<
      THREE.BufferGeometry,
      THREE.PointsMaterial
    >;
    const copiedPCD = useMemo(() => pcd.clone(true), [pcd]); //memo局部刷新时，不触发函数调用

    useEffect(() => {
      setPcd(pcd);
    }, []);

    return <primitive object={copiedPCD} />;
  };

  const PCDController: React.FC = () => {
    const [size, brightness] = usePCD((state) => [state.size, state.brightness]);

    useEffect(() => {
      if (pcd) {
        pcd.material.size = size;
        pcd.material.needsUpdate = true;
      }
    }, [size]);

    useEffect(() => {
      if (pcd) {
        const singleColor = new Float32Array(pcd.geometry.attributes.position.array.length).fill(
          brightness,
        );
        pcd.geometry.setAttribute('color', new THREE.Float32BufferAttribute(singleColor, 3));
      }
    }, [brightness]);

    return null;
  };

  const MCanvas: React.FC = () => {
    const { camera, gl, size } = useThree();

    // update camera on canvas resizing
    useEffect(() => {
      const ratio = size.width / size.height;
      const mCamera = camera as THREE.OrthographicCamera;
      mCamera.left = -CAMERA_S * ratio;
      mCamera.right = CAMERA_S * ratio;
      mCamera.top = CAMERA_S;
      mCamera.bottom = -CAMERA_S;
      mCamera.updateProjectionMatrix();
    }, [size]);

    // update orbit control on camera change
    useEffect(() => {
      const controls = new OrbitControls(camera, gl.domElement);
      controls.enableDamping = false; // an animation loop is required when either damping or auto-rotation are enabled
      controls.enableKeys = false;
      controls.screenSpacePanning = false;
      controls.maxPolarAngle = Math.PI / 2;
      controls.minPolarAngle = 0;
      controls.rotateSpeed = 0.5;
      controls.zoomSpeed = 1.5;
      controls.panSpeed = 1.5;
      return () => {
        controls.dispose();
      };
    }, [camera, gl]);

    return <axesHelper args={[10]} />;
  };

  const MCamera: React.FC<{ canvasRef: React.MutableRefObject<HTMLDivElement | null> }> = ({
    canvasRef,
  }) => {
    const { set } = useThree();

    useLayoutEffect(() => {
      const { current } = canvasRef;
      if (current) {
        const ratio = current.offsetWidth / current.offsetHeight;
        const nCamera = new THREE.OrthographicCamera(
          -CAMERA_S * ratio,
          CAMERA_S * ratio,
          CAMERA_S,
          -CAMERA_S,
          1,
          1000,
        );
        nCamera.position.set(0, -3, 60);
        nCamera.up.set(0, 0, 1);
        set({ camera: nCamera });
      }
    }, []);

    return null;
  };

  const MCircle: React.FC<{ color: string; isFilled?: boolean }> = ({ color, isFilled }) => {
    const segments = 64;
    const opacity = 0.2;
    const radius = useMCircle((state) => state.radius);
    const circleGeometry = new THREE.CircleGeometry(radius, segments);

    return isFilled ? (
      <mesh>
        <circleGeometry args={[radius, segments]} />
        <meshBasicMaterial color={color} opacity={opacity} transparent />
      </mesh>
    ) : (
      <lineSegments>
        <edgesGeometry args={[circleGeometry]} />
        <lineBasicMaterial color={color} />
      </lineSegments>
    );
  };

  const MPolyline: React.FC<{ object: MDI_TYPING.PolylineInstance }> = ({ object }) => {
    const ref = useRef<THREE.LineSegments>();
    const color = MPolylineColorMap[object.type];

    useEffect(() => {
      const points: THREE.Vector3[] = [];
      object.points.map((point, index: number) => {
        points.push(new THREE.Vector3(...point));
        if (index != 0 && index != object.points.length - 1) {
          points.push(new THREE.Vector3(...point));
        }
      });

      ref.current && ref.current.geometry.setFromPoints(points);
    }, [object]);

    return (
      <lineSegments ref={ref}>
        <bufferGeometry />
        <lineBasicMaterial color={color} />
      </lineSegments>
    );
  };

  const MPolylineGroup: React.FC<{ instances: MDI_TYPING.PolylineInstance[] }> = ({
    instances,
  }) => {
    return (
      <group>
        {instances.map((instance) => (
          <MPolyline object={instance} />
        ))}
      </group>
    );
  };

  const MInstance: React.FC<{
    object: any;
    type: 'gt' | 'dt';
    proper: string;
    isHightlight?: boolean;
  }> = ({ object, type, proper, isHightlight = false }) => {
    const instanceRef = useRef<THREE.Mesh>();
    const boxRef = useRef<THREE.Mesh>();
    const boxGeometryRef = useRef<THREE.BoxGeometry>();
    const arrowRef = useRef<THREE.ArrowHelper>();

    const setInstances = useMInstances((state) => state.setInstances);
    const [brightness, setBrightness] = usePCD((state) => [state.brightness, state.setBrightness]);
    const [visible, coloring] =
      type == 'gt'
        ? useMInstanceGTConfig((state) => [state.visible, state.coloring])
        : useMInstanceDTConfig((state) => [state.visible, state.coloring]);
    const filter =
      type == 'gt'
        ? useFilter((state) => state.filter)
        : useMInstanceDTFilter((state) => state.filter);

    let color = colorMap[proper]['default'];

    if (coloring == 'obj_type') {
      color = colorMap[proper][coloring][object.info.obj_type];
    } else if (coloring == 'detection' && object.info.detection) {
      color = colorMap[proper][coloring][object.info.detection];
    } else if (coloring == 'priority' && colorMap[proper][coloring][object.info.priority]) {
      color = colorMap[proper][coloring][object.info.priority];
    }

    const geometry = useMemo(() => {
      const geometry = new THREE.BoxGeometry(object.length, object.width, object.height);
      geometry.rotateZ(object.yaw);
      geometry.translate(object.x, object.y, object.z);
      return geometry;
    }, [object]);

    const { dir, origin } = useMemo(() => {
      const dir = new THREE.Vector3(10, 0, 0);
      dir.normalize();
      const origin = new THREE.Vector3(object.x, object.y, object.z);
      return { dir, origin };
    }, [object]);

    const highlightPoints = (object: any) => {
      if (!pcd) {
        return;
      }
      const box = object.geometry;
      box.computeBoundingBox();

      const total = pcd.geometry.attributes.position.count;
      const ps = pcd.geometry.attributes.position.array;
      const colors = new Float32Array(pcd.geometry.attributes.position.array.length).fill(
        brightness,
      );

      [...Array(total).keys()].map((i) => {
        const point_x = 3 * i;
        const point_y = 3 * i + 1;
        const point_z = 3 * i + 2;
        const p = new THREE.Vector3(ps[point_x], ps[point_y], ps[point_z]);
        if (box.boundingBox.containsPoint(p)) {
          colors[point_x] = brightness + 1;
          colors[point_y] = brightness + 1;
          colors[point_z] = brightness + 1;
        } else {
          colors[point_x] = brightness;
          colors[point_y] = brightness;
          colors[point_z] = brightness;
        }
      });

      pcd.geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
      pcd.material.needsUpdate = true;
    };

    useEffect(() => {
      boxGeometryRef?.current?.rotateZ(object.yaw);
      boxGeometryRef?.current?.translate(object.x, object.y, object.z);
      arrowRef?.current?.rotateZ(object.yaw);
      if (isHightlight && boxRef.current) {
        setBrightness(0.1);
        setInstances([boxRef.current]);
        highlightPoints(boxRef.current);
      }
    }, []);

    useEffect(() => {
      const allTypes = Object.keys(filter.obj_type).reduce(
        (acc, val) => acc && !filter.obj_type[val],
        true,
      );
      const allDetection = filter.detection
        ? Object.keys(filter.detection).reduce((acc, val) => acc && !filter.detection[val], true)
        : true;
      const allPriority = filter.priority
        ? Object.keys(filter.priority).reduce((acc, val) => acc && !filter.priority[val], true)
        : true;

      if (instanceRef && instanceRef.current) {
        if (coloring !== 'default' && color === colorMap[proper]['default']) {
          instanceRef.current.visible = false;
        } else if (!allTypes && !filter.obj_type[object.info.obj_type]) {
          instanceRef.current.visible = false;
        } else if (!allDetection && !filter.detection[object.info.detection]) {
          instanceRef.current.visible = false;
        } else if (!allPriority && !filter.priority[object.info.priority]) {
          instanceRef.current.visible = false;
        } else {
          instanceRef.current.visible = true && visible;
        }
      }
    }, [visible, coloring, filter]);

    useEffect(() => {
      arrowRef?.current?.setColor(color);
    }, [coloring]);

    return (
      <mesh ref={instanceRef}>
        <mesh
          ref={boxRef}
          onClick={(e) => {
            const objects = e.intersections.map((data) => data.eventObject);
            setInstances(objects);
            objects.map((object) => {
              highlightPoints(object);
              if(setClickBox) setClickBox(object.userData.lidar2cam)
            });
            e.stopPropagation();
          }}
          userData={object}
        >
          <boxGeometry ref={boxGeometryRef} args={[object.length, object.width, object.height]} />
          <meshBasicMaterial color={color} opacity={0.25} transparent />
        </mesh>
        <lineSegments>
          <edgesGeometry args={[geometry]} />
          <lineBasicMaterial color={color} opacity={0.5} transparent />
        </lineSegments>
        <arrowHelper ref={arrowRef} args={[dir, origin, object.length]}></arrowHelper>
      </mesh>
    );
  };

  const MInstanceGroup: React.FC<{ instances: PCDATA.PCDInstance[]; objDomain: string }> = ({
    instances,
    objDomain,
  }) => {
    return (
      <group>
        {instances.map((instance) => (
          <MInstance
            object={instance.vis_info}
            type={instance.source}
            proper={objDomain}
            key={instance.source + instance.de_id}
          />
        ))}
      </group>
    );
  };

  return (
    <div style={style ? style : { background: 'black', height: '85vh' }} ref={canvasRef}>
      <Canvas orthographic={true}>
        <MCanvas />
        <PCDController />
        <MCamera canvasRef={canvasRef} />
        <Suspense fallback={null}>
          <PCD pcdURL={pcdURL} />
        </Suspense>
        <MCircle color="white" />

        <MInstanceGroup instances={GTInstances} objDomain="gt" />
        <MPolylineGroup instances={polylineInstances} />
      </Canvas>
    </div>
  );
};

export default LidarPC;
