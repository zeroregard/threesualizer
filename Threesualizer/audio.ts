import { transform } from './fft';

export class AudioHelper {
    private _audioContext = new AudioContext();
    private _rawBuffer: AudioBuffer | undefined;

    constructor() {
        window.AudioContext = window.AudioContext;
        this._audioContext = new AudioContext();

    }

    init(url: RequestInfo) {
        fetch(url)
            .then(response => response.arrayBuffer())
            .then(arrayBuffer => this._audioContext.decodeAudioData(arrayBuffer))
            .then(audioBuffer => {
                this._rawBuffer = audioBuffer;
            });
    }

    drawAtTime(time: number) {
        if (this._rawBuffer?.sampleRate) {
            const samples = this.samplesAtTime(time).map(sample => sample * 2 - 1) // 0..1 -> -1..1
            let realData = Float64Array.from(samples);
            let imaginaryData = Float64Array.from(Array.of(...samples).fill(0));
            transform(realData, imaginaryData);
            this.drawData(samples);
        }
    }

    private samplesAtTime(time: number) {
        const sampleRate = this._rawBuffer?.sampleRate as number;
        const index = Math.max(sampleRate * (time - 1), 0);
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
        for (let i = 0; i < normalizedData.length; i++) {
            const x = width * i;
            let height = normalizedData[i] * canvas.offsetHeight - padding;
            if (height < 0) {
                height = 0;
            } else if (height > canvas.offsetHeight / 2) {
                height = height - canvas.offsetHeight / 2;
            }
            this.drawLineSegment(ctx, x, height * 0.5, width, (i + 1) % 2 ? true : false);
        }
    };

    private filterData(rawData: Float32Array, samples = 32) {
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

    private drawLineSegment(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, isEven: boolean) {
        ctx.lineWidth = 4; // how thick the line is
        ctx.strokeStyle = "#00FF00"; // what color our line is
        ctx.beginPath();
        y = isEven ? y : -y;
        ctx.moveTo(x, 0);
        ctx.lineTo(x, y);
        ctx.arc(x + width / 2, y, width / 2, Math.PI, 0, isEven);
        ctx.lineTo(x + width, 0);
        ctx.stroke();
    };

}




export class SongPlayer {
    _songPlayer: HTMLEmbedElement | undefined;
    _finish = false;

    constructor(private _source: string, private _volume = 1, private _loop: boolean = false) {

    }

    stop() {
        document.body.removeChild(this._songPlayer as HTMLEmbedElement);
    }

    start() {
        this._finish = false;
        this._songPlayer = document.createElement("embed");
        this._songPlayer.setAttribute("src", this._source);
        this._songPlayer.setAttribute("hidden", "true");
        this._songPlayer.setAttribute("volume", this._volume.toString());
        this._songPlayer.setAttribute("autostart", "true");
        this._songPlayer.setAttribute("loop", this._loop ? "true" : "false");
        document.body.appendChild(this._songPlayer);
        return true;
    }

    remove() {
        document.body.removeChild(this._songPlayer as HTMLEmbedElement);
        this._finish = true;
    }
}