import * as Three from 'three';
import React from 'react';

const HEIGHT = 300; // Total height for ground to first floor
const STEP_HEIGHT = 17; // Standard step height in cm
const STEP_DEPTH = 28; // Standard step depth in cm
const RAILING_HEIGHT = 90; // Standard railing height in cm

const woodMaterial = new Three.MeshLambertMaterial({color: 0x8B4513});
const metalMaterial = new Three.MeshLambertMaterial({color: 0x808080});

function createRailing(xOffset, numSteps, withPosts = true) {
  let railing = new Three.Object3D();
  
  // Calculate stair angle and lengths
  const stairAngle = Math.atan2(HEIGHT, numSteps * STEP_DEPTH);
  const railLength = Math.sqrt(Math.pow(numSteps * STEP_DEPTH, 2) + Math.pow(HEIGHT, 2));
  
  // Create the main handrail path
  const points = [];
  for (let i = 0; i <= numSteps; i++) {
    points.push(new Three.Vector3(
      xOffset,
      i * STEP_HEIGHT + RAILING_HEIGHT,
      i * STEP_DEPTH
    ));
  }
  
  // Create smooth curve for handrail
  const curve = new Three.CatmullRomCurve3(points);
  const railGeometry = new Three.TubeGeometry(curve, numSteps * 2, 2, 8, false);
  const handrail = new Three.Mesh(railGeometry, metalMaterial);
  railing.add(handrail);

  if (withPosts) {
    // Add posts that connect properly to steps and handrail
    for (let i = 0; i <= numSteps; i += 2) {
      // Calculate post height based on position
      const postHeight = RAILING_HEIGHT;
      const postGeometry = new Three.CylinderGeometry(1, 1, postHeight, 8);
      const post = new Three.Mesh(postGeometry, metalMaterial);
      
      // Position post at step and adjust height
      post.position.set(
        xOffset,
        i * STEP_HEIGHT + postHeight/2,
        i * STEP_DEPTH
      );
      railing.add(post);

      // Add balusters between posts
      if (i < numSteps - 2) {
        const balusterHeight = RAILING_HEIGHT - 10;
        const balusterGeometry = new Three.CylinderGeometry(0.5, 0.5, balusterHeight, 8);
        const baluster = new Three.Mesh(balusterGeometry, metalMaterial);
        
        // Position baluster halfway between posts
        baluster.position.set(
          xOffset,
          (i + 1) * STEP_HEIGHT + balusterHeight/2,
          (i + 1) * STEP_DEPTH
        );
        railing.add(baluster);
      }
    }
  }
  
  return railing;
}

function makeObjectMaxLOD(totalWidth, totalLength) {
  let stairs = new Three.Object3D();
  
  // Calculate number of steps
  const numSteps = Math.ceil(HEIGHT / STEP_HEIGHT);
  
  // Create steps
  for (let i = 0; i < numSteps; i++) {
    // Tread (horizontal part)
    const stepGeometry = new Three.BoxGeometry(totalWidth, STEP_HEIGHT/2, STEP_DEPTH);
    const step = new Three.Mesh(stepGeometry, woodMaterial);
    step.position.set(0, i * STEP_HEIGHT, i * STEP_DEPTH);
    stairs.add(step);
    
    // Riser (vertical part)
    const riserGeometry = new Three.BoxGeometry(totalWidth, STEP_HEIGHT, 2);
    const riser = new Three.Mesh(riserGeometry, woodMaterial);
    riser.position.set(0, i * STEP_HEIGHT - STEP_HEIGHT/2, i * STEP_DEPTH - STEP_DEPTH/2);
    stairs.add(riser);
  }
  
  // Add railings on both sides
  const leftRailing = createRailing(totalWidth/2 - 2, numSteps, true);
  const rightRailing = createRailing(-totalWidth/2 + 2, numSteps, true);
  stairs.add(leftRailing);
  stairs.add(rightRailing);
  
  return stairs;
}

function makeObjectMinLOD(totalWidth, totalLength) {
  let stairs = new Three.Object3D();
  
  const numSteps = Math.ceil(HEIGHT / STEP_HEIGHT);
  
  // Create simplified stairs body
  const stairsGeometry = new Three.BoxGeometry(totalWidth, HEIGHT/2, totalLength);
  const stairsBody = new Three.Mesh(stairsGeometry, woodMaterial);
  stairsBody.position.set(0, HEIGHT/4, totalLength/2);
  stairs.add(stairsBody);
  
  // Add simplified railings
  const leftRailing = createRailing(totalWidth/2 - 2, numSteps, false);
  const rightRailing = createRailing(-totalWidth/2 + 2, numSteps, false);
  stairs.add(leftRailing);
  stairs.add(rightRailing);
  
  return stairs;
}

export default {
  name: "stairs",
  prototype: "items",

  info: {
    tag: ['furnishings', 'stairs'],
    title: "Stairs",
    description: "Standard stairs from ground to first floor",
    image: require('./stairs.png')
  },
  
  properties: {
    width: {
      label: "width",
      type: "length-measure",
      defaultValue: {
        length: 100,
        unit: 'cm'
      }
    },
    length: {
      label: "length",
      type: "length-measure",
      defaultValue: {
        length: 280,
        unit: 'cm'
      }
    },
    altitude: {
      label: "altitude",
      type: "length-measure",
      defaultValue: {
        length: 0,
        unit: 'cm'
      }
    }
  },

  render2D: function (element, layer, scene) {
    let width = element.properties.get('width').get('length');
    let length = element.properties.get('length').get('length');
    let angle = element.rotation + 90;

    let textRotation = 0;
    if (Math.sin(angle * Math.PI / 180) < 0) {
      textRotation = 180;
    }

    let style = {
      stroke: element.selected ? '#0096fd' : '#000',
      strokeWidth: "2px",
      fill: "#84e1ce"
    };

    return (
      <g transform={`translate(${-width / 2},${-length / 2})`}>
        <rect key="1" x="0" y="0" width={width} height={length} style={style}/>
        <line key="2" x1={width/2} y1={length/4} x2={width/2} y2={length*3/4} 
              style={{stroke: "#000", strokeWidth: "1px", markerEnd: "url(#arrow)"}}/>
        <text key="3" x="0" y="0"
              transform={`translate(${width / 2}, ${length / 2}) scale(1,-1) rotate(${textRotation})`}
              style={{textAnchor: "middle", fontSize: "11px"}}>
          {element.type}
        </text>
        <defs>
          <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3"
                  orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L9,3 z" fill="#000"/>
          </marker>
        </defs>
      </g>
    );
  },

  render3D: function (element, layer, scene) {
    let width = element.properties.get('width').get('length');
    let length = element.properties.get('length').get('length');
    let altitude = element.properties.get('altitude').get('length');

    let stairsMaxLOD = new Three.Object3D();
    stairsMaxLOD.add(makeObjectMaxLOD(width, length).clone());

    let stairsMinLOD = new Three.Object3D();
    stairsMinLOD.add(makeObjectMinLOD(width, length).clone());

    let value = new Three.Box3().setFromObject(stairsMaxLOD);
    
    let deltaX = Math.abs(value.max.x - value.min.x);
    let deltaY = Math.abs(value.max.y - value.min.y);
    let deltaZ = Math.abs(value.max.z - value.min.z);

    let scale = new Three.Vector3(width / deltaX, HEIGHT / deltaY, length / deltaZ);
    
    stairsMaxLOD.scale.set(scale.x, scale.y, scale.z);
    stairsMinLOD.scale.set(scale.x, scale.y, scale.z);

    stairsMaxLOD.position.y += altitude;
    stairsMinLOD.position.y += altitude;

    let lod = new Three.LOD();
    lod.addLevel(stairsMaxLOD, 400);
    lod.addLevel(stairsMinLOD, 1500);
    lod.updateMatrix();
    lod.matrixAutoUpdate = false;

    if (element.selected) {
      let bbox = new Three.BoxHelper(lod, 0x99c3fb);
      bbox.material.linewidth = 5;
      bbox.renderOrder = 1000;
      bbox.material.depthTest = false;
      lod.add(bbox);
    }

    return Promise.resolve(lod);
  }
};