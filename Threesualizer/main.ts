import './src/style.css';
import * as THREE from 'three';
import { AudioAnalyzer, SongPlayer } from './src/audio-analyzer';
import { MainScene } from './src/main-scene';


const audio = new AudioAnalyzer();
audio.init('./genesis.mp3');

// const songPlayer = new SongPlayer('./genesis.mp3', 1, false);
// songPlayer.start();

const scene = new MainScene();

const clock = new THREE.Clock();
let time = 0;


audio.analysis$.subscribe(analysis => scene.visualizeAudioAnalysis(analysis, time));

function mainLoop() {
    requestAnimationFrame(mainLoop);
    time += clock.getDelta();
    scene.render(time);
    audio.analyzeAtTime(time);
}
  
mainLoop();