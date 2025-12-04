import * as Three from 'three';
import React from 'react';

const WIDTH = 160;     // Queen bed width in cm
const DEPTH = 210;     // Queen bed length in cm
const HEIGHT = 120;    // Total height including headboard

// Enhanced materials with better colors
const materials = {
  frame: new Three.MeshPhongMaterial({ color: 0x4a3c2b }), // Darker wood
  mattress: new Three.MeshPhongMaterial({ color: 0xE0E0E0 }), // Off-white
  blanket: new Three.MeshPhongMaterial({ color: 0x2c4870 }), // Navy blue
  pillow: new Three.MeshPhongMaterial({ color: 0xFFFFFF }), // White
  legs: new Three.MeshPhongMaterial({ color: 0x3a2c1b }) // Darker wood for legs
};

function createRoundedRectShape(width, depth, radius) {
  let shape = new Three.Shape();
  
  shape.moveTo(-width/2 + radius, -depth/2);
  shape.lineTo(width/2 - radius, -depth/2);
  shape.quadraticCurveTo(width/2, -depth/2, width/2, -depth/2 + radius);
  shape.lineTo(width/2, depth/2 - radius);
  shape.quadraticCurveTo(width/2, depth/2, width/2 - radius, depth/2);
  shape.lineTo(-width/2 + radius, depth/2);
  shape.quadraticCurveTo(-width/2, depth/2, -width/2, depth/2 - radius);
  shape.lineTo(-width/2, -depth/2 + radius);
  shape.quadraticCurveTo(-width/2, -depth/2, -width/2 + radius, -depth/2);
  
  return shape;
}

function createPillow() {
  const pillowGeometry = new Three.BoxGeometry(60, 10, 40);
  const pillow = new Three.Mesh(pillowGeometry, materials.pillow);
  
  // Add simple deformation to make it look softer
  pillowGeometry.vertices.forEach(vertex => {
    const distance = vertex.length();
    vertex.y += Math.sin(distance) * 2;
  });
  pillowGeometry.computeVertexNormals();
  
  return pillow;
}

function makeObjectMaxLOD() {
  let bed = new Three.Object3D();

  // Headboard with rounded corners
  const headboardShape = createRoundedRectShape(WIDTH, 60, 10);
  const headboardExtrudeSettings = {
    steps: 1,
    depth: 8,
    bevelEnabled: true,
    bevelThickness: 2,
    bevelSize: 2,
    bevelSegments: 3
  };
  const headboardGeometry = new Three.ExtrudeGeometry(headboardShape, headboardExtrudeSettings);
  const headboard = new Three.Mesh(headboardGeometry, materials.frame);
  headboard.position.set(0, 50, -DEPTH/2 + 4);
  headboard.rotation.x = Math.PI / 2;
  bed.add(headboard);

  // Bed frame with rounded corners
  const frameShape = createRoundedRectShape(WIDTH, DEPTH, 15);
  const frameExtrudeSettings = {
    steps: 1,
    depth: 30,
    bevelEnabled: true,
    bevelThickness: 2,
    bevelSize: 2,
    bevelSegments: 3
  };
  const frameGeometry = new Three.ExtrudeGeometry(frameShape, frameExtrudeSettings);
  const frame = new Three.Mesh(frameGeometry, materials.frame);
  frame.position.set(0, 15, 0);
  bed.add(frame);

  // Mattress with slight rounded top
  const mattressShape = createRoundedRectShape(WIDTH - 10, DEPTH - 10, 10);
  const mattressExtrudeSettings = {
    steps: 1,
    depth: 20,
    bevelEnabled: true,
    bevelThickness: 2,
    bevelSize: 2,
    bevelSegments: 3
  };
  const mattressGeometry = new Three.ExtrudeGeometry(mattressShape, mattressExtrudeSettings);
  const mattress = new Three.Mesh(mattressGeometry, materials.mattress);
  mattress.position.set(0, 30, 0);
  bed.add(mattress);

  // Blanket with wrinkles
  const blanketGeometry = new Three.PlaneGeometry(WIDTH - 20, DEPTH - 60, 20, 20);
  // Add wrinkles to the blanket
  const vertices = blanketGeometry.vertices;
  for (let i = 0; i < vertices.length; i++) {
    vertices[i].z = Math.sin(vertices[i].x / 10) * 2 + Math.cos(vertices[i].y / 10) * 2;
  }
  blanketGeometry.computeVertexNormals();
  const blanket = new Three.Mesh(blanketGeometry, materials.blanket);
  blanket.position.set(0, 51, 20);
  blanket.rotation.x = -Math.PI / 2;
  bed.add(blanket);

  // Add pillows
  const pillow1 = createPillow();
  pillow1.position.set(-WIDTH/4 + 10, 52, -DEPTH/2 + 30);
  bed.add(pillow1);

  const pillow2 = createPillow();
  pillow2.position.set(WIDTH/4 - 10, 52, -DEPTH/2 + 30);
  bed.add(pillow2);

  // Decorative trim on headboard
  const trimGeometry = new Three.BoxGeometry(WIDTH - 20, 2, 2);
  const trim = new Three.Mesh(trimGeometry, materials.frame);
  trim.position.set(0, 70, -DEPTH/2 + 8);
  bed.add(trim);

  // Legs with rounded edges
  const legRadius = 5;
  const legHeight = 15;
  const legGeometry = new Three.CylinderGeometry(legRadius, legRadius, legHeight, 8);
  const legPositions = [
    [-WIDTH/2 + 20, -7.5, -DEPTH/2 + 20],
    [WIDTH/2 - 20, -7.5, -DEPTH/2 + 20],
    [-WIDTH/2 + 20, -7.5, DEPTH/2 - 20],
    [WIDTH/2 - 20, -7.5, DEPTH/2 - 20]
  ];

  legPositions.forEach(position => {
    const leg = new Three.Mesh(legGeometry, materials.legs);
    leg.position.set(...position);
    bed.add(leg);
  });

  return bed;
}

function makeObjectMinLOD() {
  // Simplified version for far viewing
  let bed = new Three.Object3D();

  // Basic frame
  const frameGeometry = new Three.BoxGeometry(WIDTH, 30, DEPTH);
  const frame = new Three.Mesh(frameGeometry, materials.frame);
  frame.position.set(0, 15, 0);
  bed.add(frame);

  // Basic headboard
  const headboardGeometry = new Three.BoxGeometry(WIDTH, 60, 8);
  const headboard = new Three.Mesh(headboardGeometry, materials.frame);
  headboard.position.set(0, 50, -DEPTH/2 + 4);
  bed.add(headboard);

  // Basic mattress
  const mattressGeometry = new Three.BoxGeometry(WIDTH - 10, 20, DEPTH - 10);
  const mattress = new Three.Mesh(mattressGeometry, materials.mattress);
  mattress.position.set(0, 40, 0);
  bed.add(mattress);

  return bed;
}

const objectMaxLOD = makeObjectMaxLOD();
const objectMinLOD = makeObjectMinLOD();

export default {
  name: "queen-bed",
  prototype: "items",

  info: {
    tag: ['furnishings', 'bedroom'],
    title: "Queen Bed",
    description: "Queen size bed with detailed features",
    image: require('./bed.png')
  },

  properties: {
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
    let angle = element.rotation + 90;
    let textRotation = 0;
    if (Math.sin(angle * Math.PI / 180) < 0) {
      textRotation = 180;
    }

    return (
      <g transform={`translate(${-WIDTH / 2},${-DEPTH / 2})`}>
        <rect key="1" x="0" y="0" width={WIDTH} height={DEPTH}
          style={{
            stroke: element.selected ? '#0096fd' : '#000',
            strokeWidth: "2px",
            fill: "#4a3c2b",
            fillOpacity: 0.3
          }}/>
        <text key="2" x="0" y="0"
          transform={`translate(${WIDTH / 2}, ${DEPTH / 2}) scale(1,-1) rotate(${textRotation})`}
          style={{textAnchor: "middle", fontSize: "11px"}}>
          {element.type}
        </text>
      </g>
    )
  },

  render3D: function (element, layer, scene) {
    let newAltitude = element.properties.get('altitude').get('length');

    let bedMaxLOD = new Three.Object3D();
    bedMaxLOD.add(objectMaxLOD.clone());
    
    bedMaxLOD.position.y += newAltitude;
    bedMaxLOD.rotation.y += Math.PI;

    let bedMinLOD = new Three.Object3D();
    bedMinLOD.add(objectMinLOD.clone());
    bedMinLOD.position.y += newAltitude;
    bedMinLOD.rotation.y += Math.PI;

    let lod = new Three.LOD();
    lod.addLevel(bedMaxLOD, 200);
    lod.addLevel(bedMinLOD, 900);
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