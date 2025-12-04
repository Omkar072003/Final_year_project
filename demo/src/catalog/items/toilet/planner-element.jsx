import * as Three from 'three';
import React from 'react';

const HEIGHT = 70;

const porcelain = new Three.MeshLambertMaterial({color: 0xffffff});
const chrome = new Three.MeshLambertMaterial({color: 0xcccccc});
const seat = new Three.MeshLambertMaterial({color: 0xeeeeee});

function makeObjectMaxLOD(newWidth, newDepth) {
  let toilet = new Three.Object3D();

  // Base/pedestal
  let baseGeometry = new Three.CylinderGeometry(newWidth/4, newWidth/3, HEIGHT/6, 32);
  let base = new Three.Mesh(baseGeometry, porcelain);
  base.position.y = HEIGHT/12;
  toilet.add(base);

  // Bowl
  let bowlGeometry = new Three.CylinderGeometry(newWidth/3.5, newWidth/3.2, HEIGHT/4, 32);
  let bowl = new Three.Mesh(bowlGeometry, porcelain);
  bowl.position.y = HEIGHT/3;
  toilet.add(bowl);

  // Bowl interior
  let bowlInteriorGeometry = new Three.CylinderGeometry(newWidth/4, newWidth/3.8, HEIGHT/4, 32);
  let bowlInterior = new Three.Mesh(bowlInteriorGeometry, porcelain);
  bowlInterior.position.y = HEIGHT/3 + 1;
  toilet.add(bowlInterior);

  // Toilet seat
  let seatGeometry = new Three.TorusGeometry(newWidth/3.3, newWidth/20, 16, 100, Math.PI);
  let toiletSeat = new Three.Mesh(seatGeometry, seat);
  toiletSeat.rotation.x = Math.PI/2;
  toiletSeat.position.set(0, HEIGHT/2.5, 0);
  toilet.add(toiletSeat);

  // Tank
  let tankGeometry = new Three.BoxGeometry(newWidth/1.5, HEIGHT/2, newDepth/3);
  let tank = new Three.Mesh(tankGeometry, porcelain);
  tank.position.set(0, HEIGHT/1.5, -newDepth/4);
  toilet.add(tank);

  // Tank lid
  let tankLidGeometry = new Three.BoxGeometry(newWidth/1.4, HEIGHT/20, newDepth/2.8);
  let tankLid = new Three.Mesh(tankLidGeometry, porcelain);
  tankLid.position.set(0, HEIGHT/1.2, -newDepth/4);
  toilet.add(tankLid);

  // Flush button
  let buttonGeometry = new Three.CylinderGeometry(newWidth/20, newWidth/20, HEIGHT/20, 32);
  let button = new Three.Mesh(buttonGeometry, chrome);
  button.rotation.x = Math.PI/2;
  button.position.set(0, HEIGHT/1.3, -newDepth/8);
  toilet.add(button);

  // Water connection pipe
  let pipeGeometry = new Three.CylinderGeometry(newWidth/30, newWidth/30, HEIGHT/3, 16);
  let pipe = new Three.Mesh(pipeGeometry, chrome);
  pipe.position.set(-newWidth/4, HEIGHT/6, -newDepth/4);
  toilet.add(pipe);

  return toilet;
}

function makeObjectMinLOD(newWidth, newDepth) {
  let toilet = new Three.Object3D();

  // Simplified version with just basic shapes
  let baseGeometry = new Three.CylinderGeometry(newWidth/4, newWidth/3, HEIGHT/6, 8);
  let base = new Three.Mesh(baseGeometry, porcelain);
  base.position.y = HEIGHT/12;
  toilet.add(base);

  let bowlGeometry = new Three.CylinderGeometry(newWidth/3.5, newWidth/3.2, HEIGHT/2, 8);
  let bowl = new Three.Mesh(bowlGeometry, porcelain);
  bowl.position.y = HEIGHT/3;
  toilet.add(bowl);

  let tankGeometry = new Three.BoxGeometry(newWidth/1.5, HEIGHT/1.5, newDepth/3);
  let tank = new Three.Mesh(tankGeometry, porcelain);
  tank.position.set(0, HEIGHT/1.5, -newDepth/4);
  toilet.add(tank);

  return toilet;
}

export default {
  name: "toilet",
  prototype: "items",

  info: {
    tag: ['furnishings', 'bathroom'],
    title: "Western Toilet",
    description: "Western-style toilet",
    image: require('./toilet.png')
  },
  properties: {
    width: {
      label: "width",
      type: "length-measure",
      defaultValue: {
        length: 40,
        unit: 'cm'
      }
    },
    depth: {
      label: "depth",
      type: "length-measure",
      defaultValue: {
        length: 65,
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
    let newWidth = element.properties.get('width').get('length');
    let newDepth = element.properties.get('depth').get('length');
    let angle = element.rotation + 90;

    let textRotation = 0;
    if (Math.sin(angle * Math.PI / 180) < 0) {
      textRotation = 180;
    }

    let rect_style = {stroke: element.selected ? '#0096fd' : '#000', strokeWidth: "2px", fill: "#84e1ce"};

    return (
      <g transform={`translate(${-newWidth / 2},${-newDepth / 2})`}>
        <rect key="1" x="0" y="0" width={newWidth} height={newDepth} style={rect_style}/>
        <text key="2" x="0" y="0"
              transform={`translate(${newWidth / 2}, ${newDepth / 2}) scale(1,-1) rotate(${textRotation})`}
              style={{textAnchor: "middle", fontSize: "11px"}}>
          {element.type}
        </text>
      </g>
    )
  },

  render3D: function (element, layer, scene) {
    let newWidth = element.properties.get('width').get('length');
    let newDepth = element.properties.get('depth').get('length');
    let newHeight = HEIGHT;
    let newAltitude = element.properties.get('altitude').get('length');

    /**************** lod max ********************/
    let toiletMaxLOD = new Three.Object3D();
    toiletMaxLOD.add(makeObjectMaxLOD(newWidth, newDepth).clone());

    let value = new Three.Box3().setFromObject(toiletMaxLOD);

    let deltaX = Math.abs(value.max.x - value.min.x);
    let deltaY = Math.abs(value.max.y - value.min.y);
    let deltaZ = Math.abs(value.max.z - value.min.z);

    toiletMaxLOD.scale.set(newWidth / deltaX, newHeight / deltaY, newDepth / deltaZ);
    toiletMaxLOD.position.y += newAltitude;
    toiletMaxLOD.position.x -= newWidth/2;

    /**************** lod min ********************/
    let toiletMinLOD = new Three.Object3D();
    toiletMinLOD.add(makeObjectMinLOD(newWidth, newDepth).clone());
    toiletMinLOD.scale.set(newWidth / deltaX, newHeight / deltaY, newDepth / deltaZ);
    toiletMinLOD.position.y += newAltitude;
    toiletMinLOD.position.x -= newWidth/2;

    /**** all level of detail ***/
    let lod = new Three.LOD();

    lod.addLevel(toiletMaxLOD, 200);
    lod.addLevel(toiletMinLOD, 900);
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