import './src/style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { AudioHelper, SongPlayer } from './audio';














const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, innerWidth / window.innerHeight, 0.1, 1000);
const canvas = document.querySelector('#bg') as HTMLCanvasElement;
const renderer = new THREE.WebGLRenderer({
    canvas
});
const controls = new OrbitControls(camera, renderer.domElement);


//
// 3D stuff
//

{
    const gridHelper = new THREE.GridHelper(200, 50);
    scene.add(gridHelper);

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.position.setZ(30);


    const spaceTexture = new THREE.TextureLoader().load('space.jpg');
    scene.background = spaceTexture;
}


const audio = new AudioHelper();
audio.init('./genesis.mp3');
const songPlayer = new SongPlayer('./genesis.mp3', 1, false);
songPlayer.start();

var clock = new THREE.Clock();
var time = 0;

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
    time += clock.getDelta();
    audio.drawAtTime(time);
}
  
animate();