import * as THREE from 'three';
import { OneMinusDstAlphaFactor } from 'three';
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

    visualizeAudioAnalysis(analysis: number[], time: number, deltaTime: number) {
        const skip = 1;
        const widthSpacing = 2;
        const intensityNormalized =  Math.max(analysis.reduce((a, b) => a + b, 0) / 100000 - 1, 0);
        const intensityMultiplier = Math.pow(intensityNormalized, 2);   
        const emissive = new THREE.Color(0x00000020).lerp(new THREE.Color(0x00ff0050), intensityNormalized*3);
        if(this.cubes.length == 0) {
            for (let i = skip; i < analysis.length; i++) {
                const geometry = new THREE.BoxGeometry(1, 1, 1);
                const material = new THREE.MeshStandardMaterial({ color: 0xffff00, emissive: emissive });
                const cube = new THREE.Mesh(geometry, material);
                // set this.cubes at center of scene
                cube.position.set(i * widthSpacing - ((analysis.length*widthSpacing)/2), 0, 0);
                this.cubes[i] = cube;
                this.scene.add(cube);
            }
        }

        
        
        const heightMultiplier = 0.005;
        for (let i = skip; i < analysis.length; i++) {
            const height = analysis[i] * heightMultiplier;
            const cube = this.cubes[i];
            cube.scale.lerp(new THREE.Vector3(1, 1+ intensityMultiplier*2 + height, 1), 0.25);
            cube.rotation.y = Math.sin(time*intensityMultiplier/1000);
            cube.rotation.x = 0.1*Math.sin(time*0.01*intensityMultiplier);
            const pos = this.cubes[i].position; 
            const zigZagX = 2*intensityMultiplier*Math.sin(i*0.05+time)*0.25;
            const zigZagY = 0.5*intensityMultiplier*Math.cos(i*0.05+5*time) * 4 +  0.5*intensityMultiplier*Math.cos(i*0.05+2*time) * 4
            const zigZagZ = 10*intensityMultiplier*0.5*Math.sin(intensityMultiplier*i*0.05+time);
            
            const x = pos.x + Math.sin(time*8) + 0.25 * Math.cos(time*2);
            const y = analysis[i] * heightMultiplier - intensityMultiplier;
            const z = pos.z + Math.cos(time) + 0.25 * Math.sin(time * 0.5);

            cube.position.lerp(new THREE.Vector3(x + zigZagX, 15 + y + zigZagY, z+ zigZagZ), 0.1);
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

    render(time: number) {
        this._effects.render();

    }
}