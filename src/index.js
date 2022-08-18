//CAPNGANJ Fibonacci Dos fxhash generative token
//August, 2022

//imports
import { Features } from './Features';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { OutlineEffect } from 'three/examples/jsm/effects/OutlineEffect';


//1) - generate fxhash features - global driving parameters
//new featuresClass
let feet = new Features();
window.$fxhashData = feet;

// FX Features
window.$fxhashFeatures = {
  "Palette" : feet.color.inverted ? feet.color.name + " Invert" : feet.color.name,
  "Noise": feet.noise.tag,
  "Background": feet.background.tag
};
console.log(window.$fxhashFeatures);
//console.log(feet);

//vars related to fxhash preview call
//previewed tracks whether preview has been called
let previewed = false;

//from fxhash webpack boilerplate
// these are the variables you can use as inputs to your algorithms
//console.log(fxhash)   // the 64 chars hex number fed to your algorithm
//console.log(fxrand()) // deterministic PRNG function, use it instead of Math.random()
//console.log("fxhash features", window.$fxhashFeatures);


//2) Initialize three.js scene and start the render loop
//all data driving geometry and materials and whatever else should be generated in step 2




//global vars 
var controls, renderer, scene, camera;
init();

function init() {
  //scene & camera
  scene = new THREE.Scene();
  const sCol = new THREE.Color(feet.background.value.r/255, feet.background.value.g/255, feet.background.value.b/255);
  scene.background = sCol;
  scene.fog = new THREE.Fog(sCol, 5, 27)

  renderer = new THREE.WebGLRenderer( { 
    antialias: true,
    alpha: true
  } );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.shadowMap.enabled = true;
  renderer.domElement.id = "hashish";
  document.body.appendChild( renderer.domElement );

  camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.01, 100 );
  camera.position.set( 13, 8, 0 );

  //lights
  const p1 = new THREE.DirectionalLight( );
  p1.intensity = 0.8
  p1.position.set( 6, 6, 4.5);
  p1.castShadow = true;
  p1.shadow.mapSize.width = 2048;
  p1.shadow.mapSize.height = 2048;
  const d = 15;
  p1.shadow.camera.left = -d;
  p1.shadow.camera.right = d;
  p1.shadow.camera.top = d;
  p1.shadow.camera.bottom = -d;
  p1.shadow.camera.far = 1000;
  scene.add(p1);
  
  
  const amb = new THREE.AmbientLight( 0xcccccc, 0.5);
  scene.add(amb);


  // controls
  controls = new OrbitControls( camera, renderer.domElement );
  controls.enableDamping=true;
  controls.dampingFactor = 0.2;
  //controls.autoRotate= true;
  controls.autoRotateSpeed = 0.5;
  controls.maxDistance = 35;
  controls.minDistance = 1;



  //geometry!

  //toon geometry
  let toonGeometry  = new THREE.SphereBufferGeometry(0.5, 80, 80);
  const stand = new THREE.MeshStandardMaterial({
    roughness:0.2
  });

  const elle = new THREE.EllipseCurve(0,0, 6, 12, 0, Math.PI*2, false, 0);
  const elle2 = new THREE.EllipseCurve(0,0,12,16,Math.PI/2,Math.PI+2,false, 0);
  const numShrooms = 9;
  const basePointsOnXY = [];
  const ellePts = elle.getPoints(numShrooms);
  const elle2Pts = elle2.getPoints(numShrooms);
  for (let i = 0; i < numShrooms; i++) {
    basePointsOnXY.push(ellePts[i])
  }
  //basePointsOnXY.push(new THREE.Vector2(0,0))
  for (let i = 0; i < numShrooms; i++) {
    basePointsOnXY.push(elle2Pts[i])
  }

  

  //fibGeometry loop - matrix and colors
  const fibFactor = feet.flowerGeometry.factor;
  for (let n = 0; n < numShrooms * 2  ; n++) { 
    //mesh instance geometry for snappiness and battery life
    const iMesh = new THREE.InstancedMesh(toonGeometry, stand, 300);
    iMesh.castShadow = true;
    iMesh.receiveShadow = true;
    scene.add(iMesh)

    const flowerFeatures = new Features();
    for (let i = 0; i < 300; i++) {
    
      //matrix
      const m = new THREE.Matrix4();
  
      //position
      const r = 1;
      const x = i * fibFactor ;
      const xx = (Math.cos(x) * x)/flowerFeatures.flowerGeometry.width;
      const zz = (Math.sin(x) * x)/flowerFeatures.flowerGeometry.width;
  
      //try a function to fall along?
      const y = feet.map(i, 0, 299, 0, 1);
      const ySq = Math.pow(y, flowerFeatures.flowerGeometry.power);
      const yy = feet.map(ySq, 0, 1, flowerFeatures.flowerGeometry.height, -3)
  
      m.setPosition(xx, yy, zz);
  
      const s = feet.map(ySq, 0, 1, 0.7, 5.5);
      m.scale(new THREE.Vector3(s,s,s));
  
      iMesh.setMatrixAt(i, m);
  
  
  
      //color
      const noise = feet.map(fxrand(), 0, 1, -feet.noise.value, feet.noise.value)
      const rgb = feet.interpolateFn((feet.color.inverted ? 1-(i/300) : (i/300)) + noise);
      const col = new THREE.Color(rgb.r/255, rgb.g/255, rgb.b/255);
      iMesh.setColorAt(i, col);
      
    }
    iMesh.position.set(basePointsOnXY[n].x,0,basePointsOnXY[n].y) // <- this works for the whole mesh!  Should we loop over the loop? -- multiple flowers?
    iMesh.instanceMatrix.needsUpdate = true;
  }
  
  

  //crystals 
  const crystalColor = feet.background.value
  const crystalMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(crystalColor.r/255, crystalColor.g/255, crystalColor.b/255),
    roughness: 0.8,
    flatShading: true
  })
  const crystalGeometry = new THREE.IcosahedronBufferGeometry(3,1);
  const crystalGeometry2 = new THREE.DodecahedronBufferGeometry(3);
  const crystalGeometry3 = new THREE.OctahedronBufferGeometry(3,1);
  const mesh = new THREE.Mesh(Math.round(fxrand()) ? crystalGeometry : crystalGeometry2, crystalMat);
  mesh.position.set(0, -1.8, -16)
  mesh.receiveShadow = true;
  mesh.castShadow = true;
  //scene.add(mesh);
  const mesh2 = new THREE.Mesh(Math.round(fxrand()) ? crystalGeometry2 : crystalGeometry3, crystalMat)
  mesh2.position.set(0, -1.8, 16)
  mesh2.receiveShadow = true;
  mesh2.castShadow = true;
  //scene.add(mesh2);

  //stem
  // const stemCrv = new THREE.CubicBezierCurve(
  //   new THREE.Vector2(0.25, -4),
  //   new THREE.Vector2(7, -15),
  //   new THREE.Vector2(3.5, 5 ),
  //   new THREE.Vector2(2.5, 4.5)
  // )
  // const stemBuffer = new THREE.LatheBufferGeometry(stemCrv.getPoints(30), 90);
  // const col = feet.background.value
  // const stemMat = new THREE.MeshStandardMaterial( 
  //   { 
  //     color: new THREE.Color(col.r/255, col.g/255, col.b255),
  //     roughness: 0.5
  //   }
  // );
  // const stemMesh = new THREE.Mesh(stemBuffer, stemMat);
  // stemMesh.castShadow = true;
  // stemMesh.receiveShadow = true;
  // //scene.add(stemMesh) //meh... better without 


  //shadow plane
  const plnGeom = new THREE.PlaneGeometry(100,100);
  plnGeom.rotateX(Math.PI/-2);

  const shadowMat = new THREE.ShadowMaterial()
  shadowMat.opacity = 0.2;
  const plnMesh = new THREE.Mesh(plnGeom, shadowMat);
  plnMesh.position.y = -4.2;
  plnMesh.receiveShadow = true;
  scene.add(plnMesh)


  //set up resize listener and let it rip!
  window.addEventListener( 'resize', onWindowResize );
  renderer.domElement.addEventListener( 'dblclick', toggleAutorotate);
  animate();
}


// threejs animation stuff
function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );

}

function animate() {

  controls.update(); // only required if controls.enableDamping = true, or if controls.autoRotate = true
  requestAnimationFrame( animate );
  render();

}

function render() {

  renderer.render( scene, camera );

  if(previewed == false && renderer.info.render.frame > 1){
    fxpreview();
    previewed = true;
    //download();
  } 

  //mesh.rotation.y += 0.001;

}

function toggleAutorotate() {
  controls.autoRotate= !controls.autoRotate;
}

function download() {
  var link = document.createElement('a');
  link.download = 'Torus.png';
  link.href = document.getElementById('hashish').toDataURL()
  link.click();
}
