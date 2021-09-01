/* eslint-disable */
import * as THREE from 'three'
import React, { useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Visualization } from './scene-elements/visualization'
import { Box } from './scene-elements/box'
import { AudioAnalyzer } from './helpers/audio-analyzer'

export default function App() {

  const scene = new THREE.Scene();
  const audioAnalyser = new AudioAnalyzer();
  const songDir = './song.mp3'
  audioAnalyser.init(songDir);


  return (
    <Canvas>
      <Visualization analysis$={audioAnalyser.analysis$} scene={scene} cubeLength={2} spacingWidthMultiplier={1.25} widthSpacing = {2}/>
      <ambientLight />
      <pointLight position={[10, 10, 10]} />
      <Box position={[-1.2, 0, 0]} />
      <Box position={[1.2, 0, 0]} />
    </Canvas>
  )
}