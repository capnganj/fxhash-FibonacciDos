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
  scene.background = feet.background.value;

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
  camera.position.set( 11, 11, -14 );

  //lights
  const p1 = new THREE.DirectionalLight( );
  p1.intensity = 0.8
  p1.position.set( 6, 6, 5);
  p1.castShadow = true;
  p1.shadow.mapSize.width = 2048;
  p1.shadow.mapSize.height = 2048;
  const d = 10;
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
  controls.maxDistance = 25;
  controls.minDistance = 1;



  //geometry!

  //toon geometry
  let toonGeometry  = new THREE.SphereBufferGeometry(0.5, 80, 80);
  const stand = new THREE.MeshStandardMaterial({
    roughness:0.2
  });

  //mesh instance geometry for snappiness and battery life
  const iMesh = new THREE.InstancedMesh(toonGeometry, stand, 300);
  iMesh.castShadow = true;
  iMesh.receiveShadow = true;
  scene.add(iMesh)

  //fibGeometry loop - matrix and colors
  const fibFactor = feet.map(fxrand(), 0, 1, 1.47, 1.53);
  for (let i = 0; i < 300; i++) {
    
    //matrix
    const m = new THREE.Matrix4();

    

    //position
    const r = 1;
    const x = i * fibFactor ;
    const xx = (Math.cos(x) * x)/100;
    const zz = (Math.sin(x) * x)/100;

    //try a function to fall along?
    const y = feet.map(i, 0, 299, 0, 1);
    const ySq = Math.pow(y, 3.5);
    const yy = feet.map(ySq, 0, 1, 7, -1)

    m.setPosition(xx, yy, zz);

    const s = feet.map(ySq, 0, 1, 0.6, 6.5);
    m.scale(new THREE.Vector3(s,s,s));

    iMesh.setMatrixAt(i, m);



    //color
    const noise = feet.map(fxrand(), 0, 1, -0.1, 0.1)
    const rgb = feet.interpolateFn((i/300) + noise);
    const col = new THREE.Color(rgb.r/255, rgb.g/255, rgb.b/255);
    iMesh.setColorAt(i, col);
    
  }
  iMesh.instanceMatrix.needsUpdate = true;


  //shadow plane
  const plnGeom = new THREE.PlaneGeometry(100,100);
  plnGeom.rotateX(Math.PI/-2);

  const shadowMat = new THREE.ShadowMaterial()
  shadowMat.opacity = 0.2;
  const plnMesh = new THREE.Mesh(plnGeom, shadowMat);
  plnMesh.position.y = -5;
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