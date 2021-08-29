/* eslint-disable */
import * as THREE from 'three'
import React, { useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Visualization } from './scene-elements/visualization'
import { Box } from './scene-elements/box'

export default function App() {
  return (
    <Canvas>
      <Visualization analysis="[][]" />
      <ambientLight />
      <pointLight position={[10, 10, 10]} />
      <Box position={[-1.2, 0, 0]} />
      <Box position={[1.2, 0, 0]} />
    </Canvas>
  )
}