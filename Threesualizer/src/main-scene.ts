import * as THREE from 'three';
import { DirectionalLight, Vector3 } from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { RenderEngine } from './renderEngine';

export class MainScene {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(85, innerWidth / window.innerHeight, 0.1, 1000);
    canvas = document.querySelector('#bg') as HTMLCanvasElement;
    private _renderEngine: RenderEngine = new RenderEngine(this.canvas, this.scene, this.camera);
    ambientLightStrength = 0.5;
    directionalLightStrength = 1.5;
    widthSpacing = 2;
    cubeLength = 2;
    spacingWidthMultiplier = 1.25;

    cubes: THREE.Mesh[][] = [];
    directionalLight : DirectionalLight;
    newLightPosition: Vector3;
    gridHelper = new THREE.GridHelper(1000, 50, 0xff33aa, 0xff33aa);
    controls = new OrbitControls(this.camera, this._renderEngine.renderer.domElement);

    constructor() {
        this.directionalLight = new THREE.DirectionalLight(0xffffff, this.directionalLightStrength);
        this.newLightPosition = this.camera.position;
        this.controls.addEventListener('change', () => this.newLightPosition = this.camera.position);
        this.scene.add(this.directionalLight);

        const ambientLight = new THREE.AmbientLight(0x222222, this.ambientLightStrength);
        this.scene.add(ambientLight);

        // this.scene.add(this.gridHelper);
        this.camera.position.setZ(30);

        const spaceTexture = new THREE.TextureLoader().load('space.jpg');
        this.scene.background = spaceTexture;

        this.camera.position.set(30, 6.44, 20);
        this.camera.lookAt(new THREE.Vector3(0, 0, 0));
        window.addEventListener( 'resize', () => this.onWindowResize() );
    }

    private materials: THREE.MeshStandardMaterial[][] = [];

    visualizeAudioAnalysis(analysis: number[][], time: number) {
        if(this.cubes.length == 0) {
            this.setupGrid(analysis);
        }

        // TODO: set new grid color here
     
        const heightMultiplier = 5; // 0.05;
        for(let z = 0; z < analysis.length; z++) {
            for (let x = 0; x < analysis.length; x++) {
                let height = (analysis[x][z] ? (analysis[x][z] - 128) * heightMultiplier : 0) * 0.5;
                this.setColor(height, heightMultiplier, analysis, time, x, z);
                this.setTransform(height, analysis, time, x, z);  

            }
        } 
    }

    private setColor(height, heightMultiplier, analysis, time, x, z) {
        if(!this.materials[x][z]) {
            return;
        }
        const hue = ((x/analysis.length)*360+time*360)%360; // TODO: make colors change depending on height
        const color = new THREE.Color(`hsl(${hue}, 50%, 50%)`);
        const emissive = new THREE.Color(0x000000).lerp(color, 0.001*height/heightMultiplier);
        this.materials[x][z].emissive.set(emissive);
        this.materials[x][z].color.set(color);
    }

    private setTransform(height, analysis, time, x, z) {
        const cube = this.cubes[x][z];
        cube.scale.lerp(new THREE.Vector3(this.cubeLength, height, 1), 0.1);



        const staticPosition = new Vector3(
            x * this.spacingWidthMultiplier * this.cubeLength - ((analysis.length*this.widthSpacing)/2), 
            0, 
            z * this.widthSpacing - ((analysis.length*this.widthSpacing)/2));
        
        // TODO: make this zig-zag along to the beat, so find the BPM of the song initially
        const zigZaggedPosition = new Vector3(
            staticPosition.x,
            0,
            staticPosition.z + 5 * Math.sin(8*time)
        );
        
        cube.position.set(staticPosition.x, staticPosition.y, staticPosition.z);
    }

    setupGrid(analysis: number[][]) {
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
                this.cubes[x][z] = cube;
                this.setTransform(1, analysis, 0, x, z);
                this.scene.add(cube);
            }
        }
    }



    onWindowResize() {

        const width = window.innerWidth;
        const height = window.innerHeight;
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this._renderEngine.onWindowResize(width, height);

    }

    render() {
        this.directionalLight.position.lerp(this.newLightPosition, 0.5);
        this._renderEngine.render();
    }
}