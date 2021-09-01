import { BehaviorSubject, Subject } from "rxjs";

export class SongPlayer {
    _songPlayer: HTMLAudioElement | undefined;
    _finish = false;
    public onPlay$ = new Subject();
    public time$: BehaviorSubject<number> = new BehaviorSubject(0);
    public get currentTime() { return this._songPlayer?.currentTime; };

    constructor(private _source: string, private _volume = 1, private _loop: boolean = false) {
    }

    stop() {
        if(this._songPlayer) {
            document.body.removeChild(this._songPlayer);
        }
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
        if(this._songPlayer) {
            this._songPlayer.play();
        }
    }

    remove() {
        if(this._songPlayer) {
            document.body.removeChild(this._songPlayer);
        }
        this._finish = true;
    }
}