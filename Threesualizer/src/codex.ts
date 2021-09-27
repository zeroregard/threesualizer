/* write a function that returns a media stream of the user's microphone */
function getUserMedia() {
    return navigator.mediaDevices.getUserMedia({ audio: true });
}

/* write a function that reads a buffer array of an audio stream */
function readAudioBuffer(stream) {
    return new Promise(function (resolve, reject) {
        var context = new AudioContext();
        var source = context.createMediaStreamSource(stream);
        var processor = context.createScriptProcessor(4096, 1, 1);
        source.connect(processor);
        processor.connect(context.destination);
        processor.onaudioprocess = function (e) {
            var left = e.inputBuffer.getChannelData(0);
            resolve(left);
        };
    });
}

/* write a function that uses the getUserMedia function to read the audio stream from the microphone, and then returns a buffer array from that */
function getAudioBuffer() {
    return getUserMedia().then(readAudioBuffer);
}