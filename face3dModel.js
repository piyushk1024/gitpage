import {loadGLTF} from "./static/libs/loader.js";
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

    const hat = await loadGLTF('./static/assets/hat/scene.gltf')
    hat.scene.scale.set(0.65, 0.65, 0.65);



    const occluder = await loadGLTF('./static/assets/sparkar-occluder/headOccluder.glb')
    const occluderMaterial = new THREE.MeshBasicMaterial({colorWrite:false});
    occluder.scene.scale.set(0.065,0.065,0.065);
    occluder.scene.position.set(0,-0.3,0.15);
    occluder.scene.traverse((o) => {
      if (o.isMesh) {
        o.material = occluderMaterial;
      }
    })

    const occluderAnchor = mindarThree.addAnchor(151);
    occluderAnchor.group.add(occluder.scene);

    occluder.scene.renderOrder = 0;
    hat.scene.renderOrder = 1;

    //const clock = new THREE.Clock(); 

    // create anchor
    const anchor = mindarThree.addAnchor(168);
    anchor.group.add(hat.scene);

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
