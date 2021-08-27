import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';


import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { SSAARenderPass } from 'three/examples/jsm/postprocessing/SSAARenderPass';
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass';
import { BokehPass } from 'three/examples/jsm/postprocessing/BokehPass';

import  * as THREE from 'three';
import { WebGLRenderer } from 'three';

export class RenderEngine {
    private _composer: EffectComposer;
    private _renderPass: RenderPass;
    private _renderer: WebGLRenderer;

    public get renderer(): WebGLRenderer {
        return this._renderer;
    }

    constructor(canvas: HTMLCanvasElement, scene: THREE.Scene, camera: THREE.Camera) {
        this._renderer = new THREE.WebGLRenderer({
            canvas
        });
        this._renderer.setPixelRatio(window.devicePixelRatio);
        this._renderer.setSize(window.innerWidth, window.innerHeight);
        this._renderer.shadowMap.enabled = true;
        this._renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        this._renderPass = new RenderPass( scene, camera );
        this._composer = new EffectComposer( this._renderer);
        const w = window.innerWidth || 1
        const h = window.innerHeight || 1
        this._composer.setSize(w, h);
        this._composer.addPass( this._renderPass );

        this.addAntiAliasing(scene, camera);
        this.addBloom();
        // this.addDepthOfFieldEffect(scene, camera, w, h); // TODO: no proper focus here
    }

    private addAntiAliasing(scene, camera, cheap = false) {
        // SSAA looks better, at the price of less performance
        if(cheap) {
            const smaaPass = new SMAAPass( window.innerWidth * this._renderer.getPixelRatio(), window.innerHeight * this._renderer.getPixelRatio() );
            this._composer.addPass( smaaPass );
        } else {
            const ssaaPass = new SSAARenderPass(scene, camera, 0x000000, 0);
            ssaaPass.sampleLevel = 1;
            ssaaPass.unbiased = true;
            this._composer.addPass( ssaaPass );
        }
    }

    private addBloom() {
        const bloomPass = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 0.7, 0.6, 0.85 );
        bloomPass.resolution.set(1024, 1024);
        this._composer.addPass(bloomPass);
    }

    private addDepthOfFieldEffect(scene, camera, width, height) {
        const bokehPass = new BokehPass( scene, camera, {
            focus: 0.1,
            aperture: 0.025,
            maxblur: 0.01,
            width: width,
            height: height
        });
        this._composer.addPass(bokehPass);
    }

    public onWindowResize(width: number, height: number) {
        this._renderer.setSize(width, height);
        this._composer.setSize(width, height);
    }

    public render() {
        this._composer.render();
    }
}