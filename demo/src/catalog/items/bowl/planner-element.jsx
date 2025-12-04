import * as Three from 'three';
import React from 'react';

const ceramicMaterial = new Three.MeshPhongMaterial({ 
  color: 0xf5f5dc,  // Beige/cream color
  shininess: 30,
  specular: 0x222222
});

const innerMaterial = new Three.MeshPhongMaterial({ 
  color: 0xe8e4d8,  // Slightly lighter inner color
  shininess: 40,
  specular: 0x222222
});

function makeObjectMaxLOD(newWidth, newHeight, newDepth) {
  let bowl = new Three.Object3D();
  
  // Calculate bowl dimensions
  const radius = newWidth / 2;
  const thickness = newWidth / 20;
  
  // Outer bowl shape - using lathe geometry for smooth curved surface
  let points = [];
  const segments = 20;
  const curvature = 0.7; // Controls the bowl curvature (0-1)
  
  // Create points for the bowl's outer profile
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const x = radius * Math.sin(t * Math.PI / 2);
    const y = newHeight * (1 - Math.pow(t, curvature));
    points.push(new Three.Vector2(x, y));
  }
  
  // Create outer bowl shape
  let outerBowlGeometry = new Three.LatheGeometry(
    points,
    32,      // Number of segments around the bowl
    0,       // Start angle
    Math.PI * 2  // End angle (full circle)
  );
  let outerBowl = new Three.Mesh(outerBowlGeometry, ceramicMaterial);
  bowl.add(outerBowl);
  
  // Create inner bowl shape (slightly smaller)
  let innerPoints = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const x = Math.max(0, radius * Math.sin(t * Math.PI / 2) - thickness);
    const y = Math.max(0, newHeight * (1 - Math.pow(t, curvature)) - thickness);
    innerPoints.push(new Three.Vector2(x, y));
  }
  
  let innerBowlGeometry = new Three.LatheGeometry(
    innerPoints,
    32,      // Number of segments
    0,       // Start angle
    Math.PI * 2  // End angle (full circle)
  );
  let innerBowl = new Three.Mesh(innerBowlGeometry, innerMaterial);
  bowl.add(innerBowl);
  
  // Add decorative rim detail
  const rimRadius = radius + thickness/4;
  const rimThickness = thickness/2;
  const rimGeometry = new Three.TorusGeometry(
    rimRadius,      // Radius of the entire torus
    rimThickness,   // Radius of the tube
    16,             // Number of segments along the tube
    32              // Number of segments around the torus
  );
  
  let rim = new Three.Mesh(rimGeometry, ceramicMaterial);
  rim.rotation.x = Math.PI / 2;
  rim.position.y = newHeight - rimThickness/2;
  bowl.add(rim);
  
  // Add subtle base ring
  const baseRadius = radius * 0.5;
  const baseHeight = thickness/2;
  const baseGeometry = new Three.CylinderGeometry(
    baseRadius,     // Top radius
    baseRadius,     // Bottom radius
    baseHeight,     // Height
    32              // Number of segments
  );
  
  let base = new Three.Mesh(baseGeometry, ceramicMaterial);
  base.position.y = baseHeight/2;
  bowl.add(base);
  
  return bowl;
}

function makeObjectMinLOD(newWidth, newHeight, newDepth) {
  let bowl = new Three.Object3D();
  
  // Simplified bowl with fewer segments
  const radius = newWidth / 2;
  const thickness = newWidth / 20;
  
  let points = [];
  const segments = 10; // Fewer segments for lower detail
  const curvature = 0.7;
  
  // Create points for the bowl's outer profile
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const x = radius * Math.sin(t * Math.PI / 2);
    const y = newHeight * (1 - Math.pow(t, curvature));
    points.push(new Three.Vector2(x, y));
  }
  
  // Create outer bowl shape with fewer segments
  let outerBowlGeometry = new Three.LatheGeometry(
    points,
    16,      // Reduced number of segments
    0,
    Math.PI * 2
  );
  let outerBowl = new Three.Mesh(outerBowlGeometry, ceramicMaterial);
  bowl.add(outerBowl);
  
  // Create inner bowl shape (simplified)
  let innerPoints = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const x = Math.max(0, radius * Math.sin(t * Math.PI / 2) - thickness);
    const y = Math.max(0, newHeight * (1 - Math.pow(t, curvature)) - thickness);
    innerPoints.push(new Three.Vector2(x, y));
  }
  
  let innerBowlGeometry = new Three.LatheGeometry(
    innerPoints,
    16,      // Reduced number of segments
    0,
    Math.PI * 2
  );
  let innerBowl = new Three.Mesh(innerBowlGeometry, innerMaterial);
  bowl.add(innerBowl);
  
  // Simplified base (no rim details in low LOD)
  const baseRadius = radius * 0.5;
  const baseHeight = thickness/2;
  const baseGeometry = new Three.CylinderGeometry(
    baseRadius,
    baseRadius,
    baseHeight,
    16              // Reduced segments
  );
  
  let base = new Three.Mesh(baseGeometry, ceramicMaterial);
  base.position.y = baseHeight/2;
  bowl.add(base);
  
  return bowl;
}

export default {
  name: "bowl",
  prototype: "items",

  info: {
    tag: ['furnishings', 'kitchenware', 'dining'],
    title: "Bowl",
    description: "Ceramic serving bowl",
    image: require('./bowl.png')
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
        length: 30,
        unit: 'cm'
      }
    },
    height: {
      label: "height",
      type: "length-measure",
      defaultValue: {
        length: 15,
        unit: 'cm'
      }
    },
    depth: {
      label: "depth",
      type: "length-measure",
      defaultValue: {
        length: 30,
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
      fill: "#f5f5dc"
    };

    // Create inner circle to represent the bowl cavity
    let inner_circle_style = {
      stroke: element.selected ? '#0096fd' : '#000', 
      strokeWidth: "1px", 
      fill: "#e8e4d8"
    };

    return (
      <g transform={`translate(${-newWidth / 2},${-newDepth / 2})`}>
        {/* Outer circle representing the bowl */}
        <circle 
          cx={newWidth/2} 
          cy={newDepth/2} 
          r={newWidth/2} 
          style={circle_style}
        />
        {/* Inner circle representing the bowl cavity */}
        <circle 
          cx={newWidth/2} 
          cy={newDepth/2} 
          r={newWidth/2.5} 
          style={inner_circle_style}
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
    let bowlMaxLOD = new Three.Object3D();
    bowlMaxLOD.add(makeObjectMaxLOD(newWidth, newHeight, newDepth).clone());

    let value = new Three.Box3().setFromObject(bowlMaxLOD);
    
    let deltaX = Math.abs(value.max.x - value.min.x);
    let deltaY = Math.abs(value.max.y - value.min.y);
    let deltaZ = Math.abs(value.max.z - value.min.z);

    bowlMaxLOD.position.y += newAltitude;
    bowlMaxLOD.scale.set(newWidth / deltaX, newHeight / deltaY, newDepth / deltaZ);

    // Low detail version
    let bowlMinLOD = new Three.Object3D();
    bowlMinLOD.add(makeObjectMinLOD(newWidth, newHeight, newDepth).clone());
    bowlMinLOD.position.y += newAltitude;
    bowlMinLOD.scale.set(newWidth / deltaX, newHeight / deltaY, newDepth / deltaZ);

    // Create LOD (Level of Detail)
    let lod = new Three.LOD();

    lod.addLevel(bowlMaxLOD, 200);
    lod.addLevel(bowlMinLOD, 900);
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