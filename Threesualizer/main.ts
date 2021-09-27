import './src/style.css';
import { MainScene } from './src/main-scene';
import { fromEvent, take } from 'rxjs';

const scene = new MainScene();

let analysis3D: number[][] = [];

function drawAnalysis(analysis: number[]) {
    if(!analysis) {
        return;
    }
    if(analysis3D.length == 0) {
        analysis3D = new Array(analysis.length).fill([]);
    }
    analysis3D = (analysis3D.slice(1, analysis3D.length)).concat([analysis]);
    scene.visualizeAudioAnalysis(analysis3D, 0);
}

async function fftFactory(size = 2048): Promise<any> {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const audioCtx = new AudioContext();
    const source = audioCtx.createMediaStreamSource(stream);
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = size;
    var bufferLength = analyser.frequencyBinCount;
    source.connect(analyser);
    const convolver = audioCtx.createConvolver();
    convolver.normalize = true;
    // source.connect(convolver);
    // convolver.connect(analyser);
    var dataArray = new Uint8Array(bufferLength);
    return () => {
        analyser.getByteTimeDomainData(dataArray);
        return dataArray;
    };
}

function mainLoop(getFFT: Function) {
    requestAnimationFrame(() => mainLoop(getFFT));
    scene.render();
    drawAnalysis(getFFT());
    // drawAnalysis(getFFT());
    // drawAnalysis(Array.from(mic.getChannelData(0)));
}


fromEvent(document, 'click').pipe(take(1)).subscribe(async () => {
    mainLoop(await fftFactory(64));
});