import * as Three from 'three';
import React from 'react';

const metalColor = new Three.MeshStandardMaterial({ 
  color: 0xC0C0C0, 
  metalness: 0.8,
  roughness: 0.2
});
const blackColor = new Three.MeshLambertMaterial({ color: 0x111111 });
const glassColor = new Three.MeshPhysicalMaterial({ 
  color: 0xEEEEEE, 
  transparent: true,
  opacity: 0.3,
  clearcoat: 1.0
});

function makeObjectMaxLOD(newWidth, newHeight, newDepth) {
  let cooker = new Three.Object3D();
  
  // Main cooker body
  let bodyGeometry = new Three.BoxGeometry(newWidth, newHeight * 0.9, newDepth);
  let bodyMesh = new Three.Mesh(bodyGeometry, metalColor);
  bodyMesh.position.set(0, newHeight * 0.45, 0);
  cooker.add(bodyMesh);

  // Oven door
  let doorGeometry = new Three.BoxGeometry(newWidth * 0.9, newHeight * 0.4, newDepth * 0.05);
  let doorMesh = new Three.Mesh(doorGeometry, metalColor);
  doorMesh.position.set(0, newHeight * 0.25, newDepth * 0.475);
  cooker.add(doorMesh);
  
  // Oven door window
  let windowGeometry = new Three.BoxGeometry(newWidth * 0.7, newHeight * 0.3, newDepth * 0.01);
  let windowMesh = new Three.Mesh(windowGeometry, glassColor);
  windowMesh.position.set(0, newHeight * 0.25, newDepth * 0.51);
  cooker.add(windowMesh);

  // Cooktop surface
  let cooktopGeometry = new Three.BoxGeometry(newWidth, newHeight * 0.05, newDepth);
  let cooktopMesh = new Three.Mesh(cooktopGeometry, blackColor);
  cooktopMesh.position.set(0, newHeight * 0.9, 0);
  cooker.add(cooktopMesh);

  // Cooking burners
  const burnerRadius = newWidth * 0.1;
  const burnerHeight = newHeight * 0.01;
  const burnerGeometry = new Three.CylinderGeometry(burnerRadius, burnerRadius, burnerHeight, 32);
  
  // Top left burner
  let burner1 = new Three.Mesh(burnerGeometry, blackColor);
  burner1.position.set(-newWidth * 0.3, newHeight * 0.93, -newDepth * 0.3);
  burner1.rotation.x = Math.PI/2;
  cooker.add(burner1);
  
  // Top right burner
  let burner2 = new Three.Mesh(burnerGeometry, blackColor);
  burner2.position.set(newWidth * 0.3, newHeight * 0.93, -newDepth * 0.3);
  burner2.rotation.x = Math.PI/2;
  cooker.add(burner2);
  
  // Bottom left burner
  let burner3 = new Three.Mesh(burnerGeometry, blackColor);
  burner3.position.set(-newWidth * 0.3, newHeight * 0.93, newDepth * 0.3);
  burner3.rotation.x = Math.PI/2;
  cooker.add(burner3);
  
  // Bottom right burner
  let burner4 = new Three.Mesh(burnerGeometry, blackColor);
  burner4.position.set(newWidth * 0.3, newHeight * 0.93, newDepth * 0.3);
  burner4.rotation.x = Math.PI/2;
  cooker.add(burner4);

  // Control panel
  let controlPanelGeometry = new Three.BoxGeometry(newWidth, newHeight * 0.1, newDepth * 0.1);
  let controlPanelMesh = new Three.Mesh(controlPanelGeometry, metalColor);
  controlPanelMesh.position.set(0, newHeight * 0.95, newDepth * 0.45);
  cooker.add(controlPanelMesh);

  // Control knobs
  const knobRadius = newWidth * 0.03;
  const knobDepth = newDepth * 0.04;
  const knobGeometry = new Three.CylinderGeometry(knobRadius, knobRadius, knobDepth, 16);
  
  // Create 4 knobs
  for (let i = 0; i < 4; i++) {
    let knob = new Three.Mesh(knobGeometry, blackColor);
    knob.rotation.x = Math.PI/2;
    knob.position.set(
      newWidth * (-0.3 + i * 0.2),
      newHeight * 0.95,
      newDepth * 0.5
    );
    cooker.add(knob);
  }

  // Feet
  const footRadius = newWidth * 0.05;
  const footHeight = newHeight * 0.03;
  const footGeometry = new Three.CylinderGeometry(footRadius, footRadius, footHeight, 16);
  
  // Create 4 feet
  const footPositions = [
    [-newWidth * 0.45, -newDepth * 0.45],
    [newWidth * 0.45, -newDepth * 0.45],
    [-newWidth * 0.45, newDepth * 0.45],
    [newWidth * 0.45, newDepth * 0.45]
  ];
  
  footPositions.forEach(pos => {
    let foot = new Three.Mesh(footGeometry, blackColor);
    foot.position.set(pos[0], footHeight/2, pos[1]);
    cooker.add(foot);
  });

  return cooker;
}

function makeObjectMinLOD(newWidth, newHeight, newDepth) {
  let cooker = new Three.Object3D();
  
  // Simplified main cooker body
  let bodyGeometry = new Three.BoxGeometry(newWidth, newHeight * 0.9, newDepth);
  let bodyMesh = new Three.Mesh(bodyGeometry, metalColor);
  bodyMesh.position.set(0, newHeight * 0.45, 0);
  cooker.add(bodyMesh);

  // Simplified oven door
  let doorGeometry = new Three.BoxGeometry(newWidth * 0.9, newHeight * 0.4, newDepth * 0.05);
  let doorMesh = new Three.Mesh(doorGeometry, metalColor);
  doorMesh.position.set(0, newHeight * 0.25, newDepth * 0.475);
  cooker.add(doorMesh);

  // Simplified cooktop surface
  let cooktopGeometry = new Three.BoxGeometry(newWidth, newHeight * 0.05, newDepth);
  let cooktopMesh = new Three.Mesh(cooktopGeometry, blackColor);
  cooktopMesh.position.set(0, newHeight * 0.9, 0);
  cooker.add(cooktopMesh);

  // Simple cooking burners representation (just one merged geometry for efficiency)
  const burnerGeometry = new Three.BoxGeometry(newWidth * 0.8, newHeight * 0.01, newDepth * 0.8);
  let burnersGroup = new Three.Mesh(burnerGeometry, blackColor);
  burnersGroup.position.set(0, newHeight * 0.93, 0);
  cooker.add(burnersGroup);

  // Simple control panel
  let controlPanelGeometry = new Three.BoxGeometry(newWidth, newHeight * 0.1, newDepth * 0.1);
  let controlPanelMesh = new Three.Mesh(controlPanelGeometry, metalColor);
  controlPanelMesh.position.set(0, newHeight * 0.95, newDepth * 0.45);
  cooker.add(controlPanelMesh);

  return cooker;
}

export default {
  name: "cooker",
  prototype: "items",

  info: {
    tag: ['furnishings', 'kitchen', 'appliance'],
    title: "Cooker",
    description: "Standard kitchen cooker with stovetop",
    image: require('./cooker.png')
  },

  properties: {
    altitude: {
      label: "altitude",
      type: "length-measure",
      defaultValue: {
        length: 0,
        unit: 'cm'
      }
    },
    width: {
      label: "width",
      type: "length-measure",
      defaultValue: {
        length: 60,
        unit: 'cm'
      }
    },
    height: {
      label: "height",
      type: "length-measure",
      defaultValue: {
        length: 85,
        unit: 'cm'
      }
    },
    depth: {
      label: "depth",
      type: "length-measure",
      defaultValue: {
        length: 60,
        unit: 'cm'
      }
    }
  },

  render2D: function (element, layer, scene) {
    let newWidth = element.properties.get('width').get('length');
    let newDepth = element.properties.get('depth').get('length');

    let angle = element.rotation + 90;
    let textRotation = 0;
    if (Math.sin(angle * Math.PI / 180) < 0) {
      textRotation = 180;
    }

    let style = {
      stroke: element.selected ? '#0096fd' : '#000',
      strokeWidth: "2px",
      fill: "#d3d3d3"
    };

    return (
      <g transform={`translate(${-newWidth / 2},${-newDepth / 2})`}>
        <rect 
          x="0" 
          y="0" 
          width={newWidth} 
          height={newDepth} 
          style={style}
        />
        {/* Four burner circles */}
        <circle cx={newWidth*0.25} cy={newDepth*0.25} r={newWidth*0.1} style={{...style, fill: "#444"}} />
        <circle cx={newWidth*0.75} cy={newDepth*0.25} r={newWidth*0.1} style={{...style, fill: "#444"}} />
        <circle cx={newWidth*0.25} cy={newDepth*0.75} r={newWidth*0.1} style={{...style, fill: "#444"}} />
        <circle cx={newWidth*0.75} cy={newDepth*0.75} r={newWidth*0.1} style={{...style, fill: "#444"}} />
        <text 
          x="0" 
          y="0" 
          transform={`translate(${newWidth/2}, ${newDepth/2}) scale(1,-1) rotate(${textRotation})`}
          style={{textAnchor: "middle", fontSize: "11px"}}
        >
          {element.type}
        </text>
      </g>
    )
  },

  render3D: function (element, layer, scene) {
    let newAltitude = element.properties.get('altitude').get('length');
    let newWidth = element.properties.get('width').get('length');
    let newHeight = element.properties.get('height').get('length');
    let newDepth = element.properties.get('depth').get('length');

    // High detail version
    let cookerMaxLOD = new Three.Object3D();
    cookerMaxLOD.add(makeObjectMaxLOD(newWidth, newHeight, newDepth).clone());

    let value = new Three.Box3().setFromObject(cookerMaxLOD);
    
    let deltaX = Math.abs(value.max.x - value.min.x);
    let deltaY = Math.abs(value.max.y - value.min.y);
    let deltaZ = Math.abs(value.max.z - value.min.z);

    cookerMaxLOD.position.y += newAltitude;
    cookerMaxLOD.scale.set(newWidth / deltaX, newHeight / deltaY, newDepth / deltaZ);

    // Low detail version
    let cookerMinLOD = new Three.Object3D();
    cookerMinLOD.add(makeObjectMinLOD(newWidth, newHeight, newDepth).clone());
    cookerMinLOD.position.y += newAltitude;
    cookerMinLOD.scale.set(newWidth / deltaX, newHeight / deltaY, newDepth / deltaZ);

    // Create LOD (Level of Detail)
    let lod = new Three.LOD();

    lod.addLevel(cookerMaxLOD, 200);
    lod.addLevel(cookerMinLOD, 900);
    lod.updateMatrix();
    lod.matrixAutoUpdate = false;

    // Add selection box if selected
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