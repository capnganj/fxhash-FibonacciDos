//CAPNGANJ Fibonacci Dos fxhash generative token
//August, 2022

//imports
import { Features } from './Features';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { BokehPass } from 'three/examples/jsm/postprocessing/BokehPass';


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
let controls, renderer, scene, camera;
let postprocessing = {}
init();

function init() {
  //scene & camera
  scene = new THREE.Scene();
  const sCol = new THREE.Color(feet.background.value.r/255, feet.background.value.g/255, feet.background.value.b/255);
  scene.background = sCol;
  scene.fog = new THREE.Fog(sCol, 5, 26)

  renderer = new THREE.WebGLRenderer( { 
    antialias: true,
    alpha: true
  } );

  //let div float in a frame and always be a horizontal rect
  let w = computeCanvasSize()
  renderer.setPixelRatio( w.w/w.h );
  renderer.setSize( w.w, w.h );
  renderer.shadowMap.enabled = true;
  renderer.domElement.id = "hashish";
  renderer.domElement.style.backgroundColor = feet.background.value
  document.body.style.backgroundColor = feet.background.value
  document.body.style.display = 'flex';
  document.body.style.justifyContent = 'center';
  document.body.style.alignItems = 'center'
  renderer.domElement.style.paddingTop = w.topPadding.toString() + 'px'
  
  document.body.appendChild( renderer.domElement );

  camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.01, 100 );
  camera.position.set( 11.5, 10, 0 );

  //lights
  const p1 = new THREE.DirectionalLight( );
  p1.intensity = 0.5
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

  const p2 = new THREE.DirectionalLight( );
  p2.intensity = 0.3
  p2.position.set( 9, 4, -4.5);
  p2.castShadow = true;
  p2.shadow.mapSize.width = 2048;
  p2.shadow.mapSize.height = 2048;
  p2.shadow.camera.left = -d;
  p2.shadow.camera.right = d;
  p2.shadow.camera.top = d;
  p2.shadow.camera.bottom = -d;
  p2.shadow.camera.far = 1000;
  scene.add(p2)

  const p3Col = feet.invertColor(feet.interpolateFn(0.33));
  const p4Col = feet.invertColor(feet.interpolateFn(0.66));
  const p3 = new THREE.DirectionalLight(
    new THREE.Color(p3Col.r/255, p3Col.g/255, p3Col.b/255),
    0.9
  )
  p3.position.set(1,3,10);
  const p4 = new THREE.DirectionalLight(
    new THREE.Color(p4Col.r/255, p4Col.g/255, p4Col.b/255),
    0.9
  )
  p4.position.set(0,5,-10);
  scene.add(p3);
  scene.add(p4);
  
  const amb = new THREE.AmbientLight( 0xcccccc, 0.2);
  scene.add(amb);


  // controls
  controls = new OrbitControls( camera, renderer.domElement );
  //controls.enableDamping=true;
  //controls.dampingFactor = 0.2;
  //controls.autoRotate= true;
  //controls.autoRotateSpeed = 0.5;
  controls.maxDistance = 35;
  controls.minDistance = 1;
  controls.enableZoom = false;
  controls.enablePan = false;
  controls.enableRotate = false;



  //geometry!

  //toon geometry
  let toonGeometry  = new THREE.DodecahedronBufferGeometry(0.5);
  const stand = new THREE.MeshStandardMaterial({
    roughness:0.5,
    metalness: 0.2,
    flatShading: true
  });

  const elle = new THREE.EllipseCurve(0,0, 5, 13, 0, Math.PI*2, Math.round(fxrand()), 0);
  if (Math.round(fxrand())) {
    elle.aRotation = Math.PI;
  }
  const elle2 = new THREE.EllipseCurve(0,0,11.5,15,Math.PI/2,Math.PI+2,false, 0);
  const numShrooms = Math.floor(feet.map(fxrand(), 0, 1, 9, 13));
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
  const doRotation = Math.round(fxrand())
  const darkTop = Math.round(fxrand())
  for (let n = 0; n < numShrooms * 2  ; n++) { 
    //mesh instance geometry for snappiness and battery life
    const iMesh = new THREE.InstancedMesh(toonGeometry, stand, 400);
    iMesh.castShadow = true;
    iMesh.receiveShadow = true;
    scene.add(iMesh)

    const trigFactor = feet.map(fxrand(), 0 ,1, 1.6, 3)

    const flowerFeatures = new Features();
    for (let i = 0; i < 400; i++) {
    
      //matrix
      const m = new THREE.Matrix4();
  
      //position
      const r = 1;
      const x = i * fibFactor ;
      const xx = (Math.cos(x) * x)/flowerFeatures.flowerGeometry.width;
      const zz = (Math.sin(x) * x)/flowerFeatures.flowerGeometry.width;

      //const rot = Math.sin(xx+zz);
      //m.lookAt()
  
      //try a function to fall along?
      const y = feet.map(i, 0, 399, -Math.PI/trigFactor, Math.PI);
      const trig = feet.map(Math.cos(y), -1, 1, 1, 0);
      const ySq = Math.pow(trig, flowerFeatures.flowerGeometry.power);
      const yy = feet.map(ySq, 0, 1, flowerFeatures.flowerGeometry.height, -4)
  
      m.setPosition(xx, yy, zz);
      if (doRotation) {
        m.lookAt( new THREE.Vector3(xx, yy, zz), new THREE.Vector3(0, yy*0.89 ,0), new THREE.Vector3(0, 1, 0));
      }
      
  
      const s = feet.map(ySq, 0, 1, 0.7, 5.5);
      m.scale(new THREE.Vector3(s,s,s));
  
      iMesh.setMatrixAt(i, m);
  
  
  
      //color
      const noise = feet.map(fxrand(), 0, 1, -feet.noise.value, feet.noise.value)
      let rgb = darkTop ? 
      feet.color.inverted ? 1-ySq : ySq + noise :
      feet.color.inverted ? ySq : 1-ySq + noise;
      rgb = feet.interpolateFn(feet.map(rgb, 0, 1, 0.2, 0.8))
      const col = new THREE.Color(rgb.r/255, rgb.g/255, rgb.b/255);
      iMesh.setColorAt(i, col);
      
    }
    iMesh.position.set(basePointsOnXY[n].x,0,basePointsOnXY[n].y) // <- this works for the whole mesh!  Should we loop over the loop? -- multiple flowers?
    iMesh.instanceMatrix.needsUpdate = true;
  }

  //shadow plane
  const plnGeom = new THREE.PlaneGeometry(100,100);
  plnGeom.rotateX(Math.PI/-2);
  const plnCol = feet.lightenColor(feet.interpolateFn(0.01), 0.1);
  const shadowMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(plnCol.r/255, plnCol.g/255, plnCol.b/255),
    side: THREE.DoubleSide
  })
  const plnMesh = new THREE.Mesh(plnGeom, shadowMat);
  plnMesh.position.y = -4;
  plnMesh.receiveShadow = true;
  scene.add(plnMesh)
  

  //postporocessing stuff
  initPostprocessing();
  renderer.autoClear = false;


  //set up resize listener and let it rip!
  window.addEventListener( 'resize', onWindowResize );
  renderer.domElement.addEventListener( 'dblclick', toggleAutorotate);
  animate();
}


function initPostprocessing() {
  //renderrender
  const renderPass = new RenderPass( scene, camera);
  //camera bokeh
  const bokehPass = new BokehPass( scene, camera, {
    focus: 7.0,
    aperture: 0.0008,
    maxblur: 0.015,

    width: window.innerWidth,
    height: window.innerHeight
  });

  const composer = new EffectComposer( renderer );

  //render
  composer.addPass(renderPass);
  //camera blur
  composer.addPass(bokehPass);

  postprocessing.composer = composer;
  postprocessing.bokeh = bokehPass;
}

function computeCanvasSize() {
  
  //get the window width and height
  const ww = window.innerWidth;
  const wh = window.innerHeight;

  const smallEdgeSize = ((ww + wh)/2) * 0.03

  //return object to populate
  const ret = {}

  //we want to draw a horizontal golden rectangle with a border, as big as possible
  //does the horizontal dimension drive, or vertical
  if ( ww/wh >= 1.618 ) {
    //window is wide - let height drive
    ret.h = Math.round(wh - (smallEdgeSize * 2.5));
    ret.w = Math.round(ret.h * 1.618);
  } else {
    //window is tall - let width drive
    ret.w = Math.round(ww - (smallEdgeSize * 2));
    ret.h = Math.round(ret.w / 1.618);
  }

  
  ret.topPadding = (wh/2) - (ret.h/2)

  return ret;
}


// threejs animation stuff
function onWindowResize() {

  let w = computeCanvasSize();

  camera.aspect = w.w / w.h;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio( w.w / w.h);
  renderer.setSize( w.w, w.h );
  
  postprocessing.bokeh.width = w.w;
  postprocessing.bokeh.height = w.h

  renderer.domElement.style.paddingTop = w.topPadding.toString() + 'px'

}

function animate() {

  //controls.update(); // only required if controls.enableDamping = true, or if controls.autoRotate = true

  //change focal length along a sine wave?
  //const seconds = performance.now() / 10000;
  //postprocessing.directionalLight.position.set(6, 6, feet.map(Math.cos(seconds), -1, 1, 2.5, 4.5));

  requestAnimationFrame( animate );
  render();

}

function render() {

  postprocessing.composer.render( scene, camera );

  if(previewed == false && renderer.info.render.frame > 1){
    fxpreview();
    previewed = true;
    download();
  } 

  //mesh.rotation.y += 0.001;

}

function toggleAutorotate() {
  controls.autoRotate= !controls.autoRotate;
}

function download() {
  var link = document.createElement('a');
  link.download = 'FibonacciDos.png';
  link.href = document.getElementById('hashish').toDataURL()
  link.click();
}
