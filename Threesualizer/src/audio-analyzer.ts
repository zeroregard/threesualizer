import { BehaviorSubject, Subject } from 'rxjs';

export function bitCrush(rawData: Float32Array, samples = 48) {
    const blockSize = Math.floor(rawData.length / samples); // the number of samples in each subdivision
    const filteredData: number[] = [];
    for (let i = 0; i < samples; i++) {
        let blockStart = blockSize * i; // the location of the first sample in the block
        let sum = 0;
        for (let j = 0; j < blockSize; j++) {
            sum = sum + Math.abs(rawData[blockStart + j]) // find the sum of all the samples in the block
        }
        filteredData.push(sum / blockSize); // divide the sum by the block size to get the average
    }
    return filteredData;
}

var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
var analyser = audioCtx.createAnalyser();
analyser.fftSize = 2048;

var bufferLength = analyser.frequencyBinCount;
var dataArray = new Uint8Array(bufferLength);
analyser.getByteTimeDomainData(dataArray);




export class SongPlayer {
    _songPlayer: HTMLAudioElement | undefined;
    _finish = false;
    public onPlay$ = new Subject();
    public time$: BehaviorSubject<number> = new BehaviorSubject(0);
    public get currentTime() { return this._songPlayer.currentTime; };

    constructor(private _source: string, private _volume = 1, private _loop: boolean = false) {
    }

    stop() {
        document.body.removeChild(this._songPlayer);
    }

    init() {
        this._finish = false;
        this._songPlayer = document.createElement("audio");
        this._songPlayer.onplay = (event) => this.onPlay$.next(event);
        this._songPlayer.src = this._source;
        document.body.appendChild(this._songPlayer);
        return true;
    }

    public start() {
        this._songPlayer.play();
    }

    remove() {
        document.body.removeChild(this._songPlayer);
        this._finish = true;
    }
}