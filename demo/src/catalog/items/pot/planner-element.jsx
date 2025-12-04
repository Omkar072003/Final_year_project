import * as Three from 'three';
import React from 'react';

const brown = new Three.MeshLambertMaterial({ color: 0x8B4513 });
const darkBrown = new Three.MeshLambertMaterial({ color: 0x654321 });

function makeObjectMaxLOD(newWidth, newHeight, newDepth) {
  let pot = new Three.Mesh();
  
  // Main pot body - using cylinder with different top/bottom radii for taper
  let bodyGeometry = new Three.CylinderGeometry(
    newWidth/2,           // top radius
    newWidth/2.5,         // bottom radius
    newHeight,            // height
    32,                   // radial segments
    4,                    // height segments
    false                 // open ended
  );
  let bodyMesh = new Three.Mesh(bodyGeometry, brown);
  bodyMesh.position.set(0, newHeight/2, 0);
  pot.add(bodyMesh);

  // Pot rim
  let rimGeometry = new Three.TorusGeometry(
    newWidth/2,          // radius
    newHeight/20,        // tube radius
    16,                  // radial segments
    32                   // tubular segments
  );
  let rimMesh = new Three.Mesh(rimGeometry, darkBrown);
  rimMesh.position.set(0, newHeight, 0);
  rimMesh.rotation.x = Math.PI/2;
  pot.add(rimMesh);

  // Base plate
  let baseGeometry = new Three.CylinderGeometry(
    newWidth/2.3,        // top radius
    newWidth/2.3,        // bottom radius
    newHeight/10,        // height
    32,                  // radial segments
    1,                   // height segments
    false                // open ended
  );
  let baseMesh = new Three.Mesh(baseGeometry, darkBrown);
  baseMesh.position.set(0, newHeight/20, 0);
  pot.add(baseMesh);

  return pot;
}

function makeObjectMinLOD(newWidth, newHeight, newDepth) {
  let pot = new Three.Mesh();
  
  // Simplified pot body with fewer segments
  let bodyGeometry = new Three.CylinderGeometry(
    newWidth/2,
    newWidth/2.5,
    newHeight,
    16,                  // reduced radial segments
    2,                   // reduced height segments
    false
  );
  let bodyMesh = new Three.Mesh(bodyGeometry, brown);
  bodyMesh.position.set(0, newHeight/2, 0);
  pot.add(bodyMesh);

  // Simplified rim
  let rimGeometry = new Three.TorusGeometry(
    newWidth/2,
    newHeight/20,
    8,                   // reduced radial segments
    16                   // reduced tubular segments
  );
  let rimMesh = new Three.Mesh(rimGeometry, darkBrown);
  rimMesh.position.set(0, newHeight, 0);
  rimMesh.rotation.x = Math.PI/2;
  pot.add(rimMesh);

  // Simplified base
  let baseGeometry = new Three.CylinderGeometry(
    newWidth/2.3,
    newWidth/2.3,
    newHeight/10,
    16,                  // reduced segments
    1,
    false
  );
  let baseMesh = new Three.Mesh(baseGeometry, darkBrown);
  baseMesh.position.set(0, newHeight/20, 0);
  pot.add(baseMesh);

  return pot;
}

export default {
  name: "pot",
  prototype: "items",

  info: {
    tag: ['furnishings', 'decoration', 'garden'],
    title: "Plant Pot",
    description: "Decorative plant pot",
    image: require('./pot.png')
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
        length: 50,
        unit: 'cm'
      }
    },
    height: {
      label: "height",
      type: "length-measure",
      defaultValue: {
        length: 60,
        unit: 'cm'
      }
    },
    depth: {
      label: "depth",
      type: "length-measure",
      defaultValue: {
        length: 50,
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

    let circle_style = {
      stroke: element.selected ? '#0096fd' : '#000', 
      strokeWidth: "2px", 
      fill: "#b97a57"
    };

    return (
      <g transform={`translate(${-newWidth / 2},${-newDepth / 2})`}>
        <circle 
          cx={newWidth/2} 
          cy={newDepth/2} 
          r={newWidth/2} 
          style={circle_style}
        />
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
    let potMaxLOD = new Three.Object3D();
    potMaxLOD.add(makeObjectMaxLOD(newWidth, newHeight, newDepth).clone());

    let value = new Three.Box3().setFromObject(potMaxLOD);
    
    let deltaX = Math.abs(value.max.x - value.min.x);
    let deltaY = Math.abs(value.max.y - value.min.y);
    let deltaZ = Math.abs(value.max.z - value.min.z);

    potMaxLOD.position.y += newAltitude;
    potMaxLOD.scale.set(newWidth / deltaX, newHeight / deltaY, newDepth / deltaZ);

    // Low detail version
    let potMinLOD = new Three.Object3D();
    potMinLOD.add(makeObjectMinLOD(newWidth, newHeight, newDepth).clone());
    potMinLOD.position.y += newAltitude;
    potMinLOD.scale.set(newWidth / deltaX, newHeight / deltaY, newDepth / deltaZ);

    // Create LOD (Level of Detail)
    let lod = new Three.LOD();

    lod.addLevel(potMaxLOD, 200);
    lod.addLevel(potMinLOD, 900);
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