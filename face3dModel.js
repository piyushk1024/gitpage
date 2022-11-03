import {loadGLTF} from "./static/libs/loader.js";
//import {mockWithVideo} from '../../libs/camera-mock';
const THREE = window.MINDAR.FACE.THREE;

//picture canvas
const capture = mindarThree => {

  const {video,renderer,scene,camera} = mindarThree;
  const renderCanvas = renderer.domElement;

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  canvas.width = renderCanvas.width;
  canvas.height = renderCanvas.height;

  const sx = (video.clientWidth - renderCanvas.clientWidth) / 2 * video.videoWidth / video.clientWidth;
  const sy = (video.clientHeight - renderCanvas.clientHeight) / 2 * video.videoHeight / video.clientHeight;
  const sw = video.videoWidth - sx * 2; 
  const sh = video.videoHeight - sy * 2; 

  context.drawImage(video,sx,sy,sw,sh,0,0, canvas.width,canvas.height);

  renderer.preserveDrawingBuffer = true;
  renderer.render(scene,camera);
  context.drawImage(renderCanvas,0,0,canvas.width,canvas.height);
  renderer.preserveDrawingBuffer = false;

  const data = canvas.toDataURL('image/png');

  const link = document.createElement('a');
  link.download = 'photo.png';
  link.href = data;
  link.click();
}



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
    document.querySelector("#capture").addEventListener("click", () => {
      capture(mindarThree);
    });

    // start AR
    await mindarThree.start();
    renderer.setAnimationLoop(() => {
      renderer.render(scene, camera);
    });
  }
  start();
});
