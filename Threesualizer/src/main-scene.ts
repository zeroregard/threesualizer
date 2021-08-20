import * as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Effects } from './effects';

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
        const planeMaterial = new THREE.MeshLambertMaterial({ color: 0x222222 });
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

    visualizeAudioAnalysis(analysis: number[]) {
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
    
                const light = new THREE.PointLight(0xffaaaa);
                light.color.set(0xffaaaa);
                light.intensity = 1;
                light.parent = cube;
                light.position.set(cube.position.x, cube.position.y, cube.position.z);
                this.lights[i] = light;
                this.scene.add(light);
            }
        }
        
        const heightMultiplier = 0.01;
        for (let i = skip; i < analysis.length; i++) {
            const height = analysis[i];
            const targetSize = this.cubes[i].scale.lerp(new THREE.Vector3(1, height * heightMultiplier, 1), 0.25);
            this.cubes[i].scale.set(targetSize.x, targetSize.y, targetSize.z);
            const pos = this.cubes[i].position; 
            this.lights[i].position.set(pos.x, pos.y, pos.z); // why can't i just pass a Vector3?
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

    render() {
        this._effects.render();
    }
}