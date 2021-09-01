import { Canvas, RootState } from '@react-three/fiber';
import React, { useRef, useState } from 'react'
import { map, skip, take } from 'rxjs';

import * as THREE from 'three';
import { Vector3 } from 'three';

export function Visualization(props: any) {
    const materials = useRef<THREE.MeshStandardMaterial[][]>([]);
    const cubeMeshes = useRef<THREE.Mesh[][]>([]);
    initialize();

    function initialize() {
        props.analysis$.pipe(take(1)).subscribe((analysis: number[][]) => {
            console.log(analysis);
            setupGrid(analysis);
        });
        props.analysis$.pipe(skip(1)).subscribe((analysis: number[][]) => {
            visualizeAudioAnalysis(analysis);
        });
    }

    function visualizeAudioAnalysis(analysisGrid: number[][]) {
        const heightMultiplier = 1; // 0.05;
        for(let z = 0; z < analysisGrid.length; z++) {
            for (let x = 0; x < analysisGrid[z].length; x++) {
                let height = (analysisGrid[x][z] ? -400 + analysisGrid[x][z] * heightMultiplier : 0) * 0.4;
                setColor(height, heightMultiplier, analysisGrid, props.time, x, z);
                setTransform(height, props.analysis, props.time, x, z);  
            }
        } 
    }

    function setColor(height: number, heightMultiplier: number, analysis: number[][], time: number, x: number, z: number) {
    
        if(!materials.current[x][z]) {
            return;
        }
        const hue = ((x/analysis.length)*360+time*360)%360; // TODO: make colors change depending on height
        const color = new THREE.Color(`hsl(${hue}, 50%, 50%)`);
        const emissive = new THREE.Color(0x000000).lerp(color, 0.001*height/heightMultiplier);
        materials.current[x][z].emissive.set(emissive);
        materials.current[x][z].color.set(color);
    }

    function setTransform(height: number, analysis: number[][], time: number, x: number, z: number) {
        const cube = cubeMeshes.current[x][z];
        cube.scale.lerp(new THREE.Vector3(props.cubeLength, height, 1), 0.1);

        const staticPosition = new Vector3(
            x * props.spacingWidthMultiplier * props.cubeLength - ((analysis.length*props.widthSpacing)/2), 
            0, 
            z * props.widthSpacing - ((analysis.length*props.widthSpacing)/2));
        
        cube.position.set(staticPosition.x, staticPosition.y, staticPosition.z);
    }
    
    function setupGrid(analysis: number[][]) {
        if(!analysis)
        return;
        for (let i = 0; i < analysis.length; i++) {
            cubeMeshes.current[i] = []
            materials.current[i] = [];
        }               
        for(let z = 0; z < analysis.length; z++) {
            for (let x = 0; x < analysis.length; x++) {
                const geometry = new THREE.BoxGeometry(1, 1, 1);


                const material = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0x000000 });
                materials.current[x][z] = material;
                const cube = new THREE.Mesh(geometry, material);
                // set this.cubes at center of scene, extruding each new line of cubes in the z-axis
                cubeMeshes.current[x][z] = cube;
                setTransform(1, analysis, 0, x, z);
                props.scene.add(cube);
            }
        }
    }
    
    console.log(cubeMeshes);

    /*cubeMeshes.currentmap((el, x) => {
        const z = x/cubeMeshes.current[x].length;
        const mesh = cubeMeshes.current[x][z];
        return  <mesh
            {...props}
            ref={mesh}
            scale={1}>
                <boxGeometry args={[1, 1, 1]} />
                <meshStandardMaterial color={'orange'} />
            r</mesh>
      }); */


    return (
        
        <group ref={cubeMeshes}>
        </group >

      )
  }
  









