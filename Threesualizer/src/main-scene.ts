import * as THREE from 'three';
import { Color, OneMinusDstAlphaFactor } from 'three';
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
    cubes: THREE.Mesh[][] = [];
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

        const ambientLight = new THREE.AmbientLight(0x222222);
        this.scene.add(ambientLight);

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

    private materials: THREE.MeshStandardMaterial[][] = [];

    visualizeAudioAnalysis(analysis: number[][], time: number) {
        const widthSpacing = 2;
        if(this.cubes.length == 0) {
            this.setupGrid(analysis, widthSpacing);
        }

     
        const heightMultiplier = 1; // 0.05;
        for(let z = 0; z < analysis.length; z++) {
            for (let x = 0; x < analysis.length; x++) {
                let height = (analysis[x][z] ? -400 + analysis[x][z] * heightMultiplier : 0);
                const cube = this.cubes[x][z];
                if(this.materials[x][z]) {
                    const hue = (x/analysis.length)*90+time*45;
                    const color = new THREE.Color(`hsl(${hue}, 50%, 50%)`);
                    const emissive = new THREE.Color(0x000000).lerp(color, 0.001*height/heightMultiplier);
                    this.materials[x][z].emissive.set(emissive);
                    this.materials[x][z].color.set(color);
                }
                cube.scale.lerp(new THREE.Vector3(1, height, 1), 0.01);
            }
        } 
    }

    setupGrid(analysis: number[][], widthSpacing: number) {
        // this.cubes = analysis.map
        for (let i = 0; i < analysis.length; i++) {
            this.cubes[i] = []
            this.materials[i] = [];
        }               
        for(let z = 0; z < analysis.length; z++) {
            for (let x = 0; x < analysis.length; x++) {
                const geometry = new THREE.BoxGeometry(1, 1, 1);


                const material = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0x000000 });
                this.materials[x][z] = material;
                const cube = new THREE.Mesh(geometry, material);
                // set this.cubes at center of scene, extruding each new line of cubes in the z-axis
                cube.position.set(x * widthSpacing - ((analysis.length*widthSpacing)/2), 0, z * widthSpacing);
                this.cubes[x][z] = cube;
                this.scene.add(cube);
            }
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