import * as Three from 'three';
import React from 'react';

const WIDTH = 100;
const DEPTH = 100;
const HEIGHT = 2;

const textureLoader = new Three.TextureLoader();
const floorTexture = textureLoader.load(require('./floor-texture.jpg'));
const material = new Three.MeshLambertMaterial({ 
  map: floorTexture,
  side: Three.DoubleSide
});

const objectMaxLOD = makeObjectMaxLOD();
const objectMinLOD = makeObjectMinLOD();

function makeObjectMaxLOD() {
  let floor = new Three.Object3D();
  
  // Create a simple plane geometry for the floor
  let floorGeometry = new Three.PlaneGeometry(1, 1);
  let floorMesh = new Three.Mesh(floorGeometry, material);
  
  // Rotate to lay flat
  floorMesh.rotation.x = -Math.PI / 2;
  
  floor.add(floorMesh);
  return floor;
}

function makeObjectMinLOD() {
  // For floor, we can use the same geometry for both LOD levels
  // since it's a simple plane
  return makeObjectMaxLOD();
}

export default {
  name: "floor",
  prototype: "items",

  info: {
    tag: ['structure'],
    title: "Floor",
    description: "Floor surface",
    image: require('./floor.png')
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
    texture: {
      label: "texture",
      type: "enum",
      defaultValue: "wooden",
      values: {
        'wooden': "Wooden",
        'tile': "Tile",
        'marble': "Marble"
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
            fill: "#dfdfdf",
            fillOpacity: 0.8
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

    /***************** lod max *******************/
    let floorMaxLOD = new Three.Object3D();
    floorMaxLOD.add(objectMaxLOD.clone());

    let value = new Three.Box3().setFromObject(floorMaxLOD);
    let deltaX = Math.abs(value.max.x - value.min.x);
    let deltaY = Math.abs(value.max.y - value.min.y);
    let deltaZ = Math.abs(value.max.z - value.min.z);

    floorMaxLOD.position.y += newAltitude;
    floorMaxLOD.scale.set(WIDTH, HEIGHT, DEPTH);

    /**************** lod min *******************/
    let floorMinLOD = new Three.Object3D();
    floorMinLOD.add(objectMinLOD.clone());
    floorMinLOD.position.y += newAltitude;
    floorMinLOD.scale.set(WIDTH, HEIGHT, DEPTH);

    /**** all level of detail ***/
    let lod = new Three.LOD();

    lod.addLevel(floorMaxLOD, 200);
    lod.addLevel(floorMinLOD, 900);
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