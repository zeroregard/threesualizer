import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import  * as THREE from 'three';

export class Effects {
    private _composer: EffectComposer;
    private _renderPass: RenderPass;
    private _shader;



    constructor(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera) {
        this._renderPass = new RenderPass( scene, camera );
        this._composer = new EffectComposer(renderer);
        const w = window.innerWidth || 1
        const h = window.innerHeight || 1
        this._composer.setSize(w, h);
        this._shader  = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 );
        this._shader.resolution.set(1024, 1024);
        this._composer.addPass( this._renderPass );
        this._composer.addPass( this._shader );
    }

    public render() {
        this._composer.render();
    }
}