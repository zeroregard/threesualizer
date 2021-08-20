import * as THREE from 'three';
import { Color } from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Effects } from './effects';
import { timer } from 'rxjs';

export class MainScene {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, innerWidth / window.innerHeight, 0.1, 1000);
    canvas = document.querySelector('#bg') as HTMLCanvasElement;
    renderer = new THREE.WebGLRenderer({
        antialias: true,
        canvas: this.canvas
    });
    cubes: THREE.Mesh[] = [];
    lights: THREE.Light[] = [];

    controls = new OrbitControls(this.camera, this.renderer.domElement);

    constructor() {
        const planeGeometry = new THREE.BoxGeometry();
        const planeMaterial = new THREE.MeshStandardMaterial({ color: 0x222222 });
        const plane = new THREE.Mesh(planeGeometry, planeMaterial);
        plane.scale.set(5000, 0.1, 5000);
        this.scene.add(plane);

        const light = new THREE.DirectionalLight(0xffffff);
        light.position.set(0, 0.5, 1);
        this.scene.add(light);

        //const gridHelper = new THREE.GridHelper(200, 50);
        //this.scene.add(gridHelper);

        
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.camera.position.setZ(30);

        const spaceTexture = new THREE.TextureLoader().load('space.jpg');
        this.scene.background = spaceTexture;

        this.camera.position.set(30, 6.44, 20);
        this.camera.lookAt(new THREE.Vector3(0, 0, 0));
        window.addEventListener( 'resize', () => this.onWindowResize() );
    }

    visualizeAudioAnalysis(analysis: number[], time: number) {
        const skip = 1;
        const widthSpacing = 2;
        if(this.cubes.length == 0) {
            for (let i = skip; i < analysis.length; i++) {
                const geometry = new THREE.BoxGeometry(1, 1, 1);
                const material = new THREE.MeshStandardMaterial({ color: 0x00ff00, emissive: 0x00ff0050 });
                const cube = new THREE.Mesh(geometry, material);
                // set this.cubes at center of scene
                cube.position.set(i * widthSpacing - ((analysis.length*widthSpacing)/2), 0, 0);
                this.cubes[i] = cube;
                this.scene.add(cube);
                const lerp = i/analysis.length;
                const color1 = new THREE.Color(0xffffaa);
                const color2 = new THREE.Color(0xff0000);
                const color = color1.lerp(color2, lerp)
                console.log(color);
                const light = new THREE.PointLight(color);
                light.intensity = 0.03;
                light.parent = cube;
                light.position.set(cube.position.x, cube.position.y, cube.position.z);
                this.lights[i] = light;
                this.scene.add(light);
            }
        }
        
        const heightMultiplier = 0.01;
        for (let i = skip; i < analysis.length; i++) {
            const height = analysis[i] * heightMultiplier;
            this.cubes[i].scale.lerp(new THREE.Vector3(1, height, 1), 0.25);
            const pos = this.cubes[i].position; 
            
            const x = pos.x + Math.sin(time*8) + 0.25 * Math.cos(time*2);
            const y = analysis[i] * heightMultiplier;
            const z = pos.z + Math.cos(time) + 0.25 * Math.sin(time * 0.5);

            this.cubes[i].position.lerp(new THREE.Vector3(x, 10 + y, z), 0.1);
            //this.cubes[i].position.set(targetPos.x, targetPos.y, targetPos.z);
            this.lights[i].position.set(pos.x, pos.y, pos.z);
        } 
    }



    onWindowResize() {

        const width = window.innerWidth;
        const height = window.innerHeight;
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize( width, height );
        this.renderer.setSize( width, height );

    }

    private _effects: Effects = new Effects(this.renderer, this.scene, this.camera);

    private _previous = new THREE.Vector3(0, 0, 0);

    render(time: number) {
        const timeMulti = time * 0.05;
        const averagePostion = this.cubes[this.cubes.length/2]?.position;
        if(averagePostion) {
            // this.camera.lookAt(this._previous.lerp(averagePostion, 0.0001));
            this._previous = averagePostion;
        }
        this._effects.render();
        if(this.lights) {
            for (let i = 0; i < this.lights.length; i++) {
                const odd = i % 2 == 0;
                if(this.lights[i]) {
                    this.lights[i].intensity = (1 + (odd ? Math.sin(timeMulti) : Math.cos(timeMulti)))/16 + 0.10;
                }
            }
        }

    }
}