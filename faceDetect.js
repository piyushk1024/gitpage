//import {loadGLTF,loadAudio} from "./static/libs/loader.js";
//import {mockWithVideo} from '../../libs/camera-mock';
const THREE = window.MINDAR.FACE.THREE;


document.addEventListener('DOMContentLoaded', () => {
  const start = async() => {
    // initialize MindAR 
    const mindarThree = new window.MINDAR.FACE.MindARThree({
      container: document.querySelector("#AR-div"),
      //imageTargetSrc: './static/assets/targets.mind',
    });
    const {renderer, scene, camera} = mindarThree;

    //create light

    const light = new THREE.HemisphereLight(0xffffff,0xbbbbff,1);
    scene.add(light);

    const geometry = new THREE.SphereGeometry(0.1,16,16);
    const material = new THREE.MeshBasicMaterial({
      color:0xffff00,
      transparent: true,
      opacity: 0.5
    });

    const sphere = new THREE.Mesh(geometry,material);

    const clock = new THREE.Clock(); 

    // create anchor
    const anchor = mindarThree.addAnchor(8);
    anchor.group.add(sphere);

    document.querySelector("#switch").addEventListener("click", () => {
      mindarThree.switchCamera();
    });

    anchor.onTargetFound = () => {
      
    }

    anchor.onTargetLost = () => {
      
    }

    // start AR
    await mindarThree.start();
    renderer.setAnimationLoop(() => {
      renderer.render(scene, camera);
    });
  }
  start();
});
