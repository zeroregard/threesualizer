import './src/style.css';
import { AudioAnalyzer, SongPlayer } from '../threesualizer-react/src/helpers/audio-analyzer';
import { MainScene } from './src/main-scene';
import { combineLatest } from 'rxjs';


const audio = new AudioAnalyzer();
const songDir = './song.mp3'
audio.init(songDir);




const scene = new MainScene();


let analysis3D: number[][] = [];



const songPlayer = new SongPlayer(songDir, 1, false);
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

combineLatest([songPlayer.onPlay$, audio.analysis$]).subscribe(([, analysis]) => {
    drawAnalysis(analysis)
})

window.onclick = () => songPlayer.start();


let oldTime = 0
function mainLoop() {
    requestAnimationFrame(mainLoop);
    scene.render();
    const dt = songPlayer.currentTime - oldTime;
    audio.analyzeAtTime(songPlayer.currentTime, dt);
    oldTime = songPlayer.currentTime
}
  
mainLoop();