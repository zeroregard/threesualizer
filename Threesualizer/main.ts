import './src/style.css';
import * as THREE from 'three';
import { AudioAnalyzer, SongPlayer } from './src/audio-analyzer';
import { MainScene } from './src/main-scene';
import { delay } from 'rxjs/operators';
import { combineLatest } from 'rxjs';


const audio = new AudioAnalyzer();
audio.init('./song.mp3');




const scene = new MainScene();


let analysis3D: number[][] = [];



const songPlayer = new SongPlayer('./song.mp3', 1, false);
songPlayer.init();

function drawAnalysis(analysis: number[]) {
    if(analysis3D.length == 0) {
        analysis3D = new Array(analysis.length).fill([]);
    }

    analysis3D = (analysis3D.slice(1, analysis3D.length)).concat([analysis]);
    scene.visualizeAudioAnalysis(analysis3D, songPlayer.currentTime);
}

//songPlayer.onPlay$.subscribe(() => console.log('hello'));
//audio.analysis$.subscribe(() => console.log('world'));

combineLatest([songPlayer.onPlay$, audio.analysis$]).subscribe(([onPlay, analysis]) => {
    drawAnalysis(analysis)
})

window.onclick = () => songPlayer.start();


function mainLoop() {
    requestAnimationFrame(mainLoop);
    scene.render();
    audio.analyzeAtTime(songPlayer.currentTime);
}
  
mainLoop();