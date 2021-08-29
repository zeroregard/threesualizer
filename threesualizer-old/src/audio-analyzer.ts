import { transform } from '../fft';
import { BehaviorSubject, Subject } from 'rxjs';

export class AudioAnalyzer {
    private _audioContext = new AudioContext();
    private _rawBuffer: AudioBuffer | undefined;
    public analysis$: Subject<number[]> = new Subject();

    constructor() {
        window.AudioContext = window.AudioContext;
        this._audioContext = new AudioContext();
        this._audioContext.resume();

    }

    init(url: RequestInfo) {
        fetch(url)
            .then(response => response.arrayBuffer())
            .then(arrayBuffer => this._audioContext.decodeAudioData(arrayBuffer))
            .then(audioBuffer => {
                this._rawBuffer = audioBuffer;
            });
    }

    analyzeAtTime(time: number, dt: number) {
        if (this._rawBuffer?.sampleRate) {
            const samples = this.samplesAtTime(time, dt).map(sample => sample * 2 - 1) // 0..1 -> -1..1
            let realData = Float64Array.from(samples);
            let imaginaryData = Float64Array.from(Array.of(...samples).fill(0));
            transform(realData, imaginaryData);
            let normalizedRealData = this.normalizeData(Array.from(realData));
            // this.drawData(normalizedRealData);
            this.drawData(samples);
        }
    }

    private samplesAtTime(time: number, dt: number) {
        const sampleRate = this._rawBuffer?.sampleRate as number;
        const index = Math.max(sampleRate * (time), 0);
        const samples = this._rawBuffer?.getChannelData(0).slice(index, index + sampleRate) as Float32Array;
        const filtered = this.filterData(samples);
        const normalized = this.normalizeData(filtered);
        return normalized;
    }

    private drawData(normalizedData: number[] | Float64Array) {
        // Set up the canvas
        const canvas = document.querySelector("#audiotest") as HTMLCanvasElement;
        const dpr = window.devicePixelRatio || 1;
        const padding = 20;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
        ctx.scale(dpr, dpr);
        ctx.translate(0, canvas.offsetHeight / 2 + padding); // Set Y = 0 to be in the middle of the canvas

        // draw the line segments
        const width = canvas.offsetWidth / normalizedData.length;
        const map = [];
        for (let i = 0; i < normalizedData.length; i++) {
            const x = width * i;
            let height = normalizedData[i] * canvas.offsetHeight - padding;
            if (height < 0) {
                height = 0;
            } else if (height > canvas.offsetHeight / 2) {
                height = height - canvas.offsetHeight / 2;
            }
            map.push(height);
        }
        this.analysis$.next(map);
    };

    private filterData(rawData: Float32Array, samples = 48) {
        const blockSize = Math.floor(rawData.length / samples); // the number of samples in each subdivision
        const filteredData = [];
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

    private normalizeData(filteredData: number[]) {
        const multiplier = Math.pow(Math.max(...filteredData), -1);
        return filteredData.map(n => n * multiplier);
    }

}




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