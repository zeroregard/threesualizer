import './src/style.css';
import * as THREE from 'three';
import { AudioAnalyzer, SongPlayer } from './src/audio-analyzer';
import { MainScene } from './src/main-scene';


const audio = new AudioAnalyzer();
audio.init('./genesis.mp3');

const songPlayer = new SongPlayer('./genesis.mp3', 1, false);
songPlayer.start();

const scene = new MainScene();

const clock = new THREE.Clock();
let time = 0;
let dt = 0;
let analysis3D: number[][] = [];

function drawAnalysis(analysis: number[], time: number, dt: number) {
    if(analysis3D.length == 0) {
        analysis3D = new Array(analysis.length).fill([]);
    }

    analysis3D = (analysis3D.slice(1, analysis3D.length)).concat([analysis]);
    console.log(analysis3D);
    scene.visualizeAudioAnalysis(analysis3D, time, dt);
}

audio.analysis$.subscribe(analysis => drawAnalysis(analysis, time, dt));


function mainLoop() {
    requestAnimationFrame(mainLoop);
    dt = clock.getDelta();
    time += dt;
    scene.render(time);
    audio.analyzeAtTime(time);
}
  
mainLoop();