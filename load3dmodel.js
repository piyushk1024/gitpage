import {loadGLTF,loadAudio} from "./static/libs/loader.js";
//import {mockWithVideo} from '../../libs/camera-mock';
const THREE = window.MINDAR.IMAGE.THREE;


document.addEventListener('DOMContentLoaded', () => {
  const start = async() => {
    // initialize MindAR 
    const mindarThree = new window.MINDAR.IMAGE.MindARThree({
      container: document.querySelector("#AR-div"),
      imageTargetSrc: './static/assets/targets.mind',
    });
    const {renderer, scene, camera} = mindarThree;

    //create light

    const light = new THREE.HemisphereLight(0xffffff,0xbbbbff,1);
    scene.add(light);
    
    // load and scale 3d model
    const model3d = await loadGLTF('./static/assets/musicband-raccoon/scene.gltf');
    model3d.scene.scale.set(0.1,0.1,0.1);
    model3d.scene.position.set(0,-0.4,0);

    //for animation
    const mixer = new THREE.AnimationMixer(model3d.scene);
    const action = mixer.clipAction(model3d.animations[0]);
    action.play();

    const clock = new THREE.Clock();

    //for Audio
    const audioClip = await loadAudio ('./static/assets/sounds/drum-beat-90-bpm-with-reverb.mp3');    
    const listener = new THREE.AudioListener();
    //const listener = new THREE.AudioListener();
    camera.add(listener);

    const audio = new THREE.PositionalAudio(listener);

    audio.setBuffer(audioClip);
    audio.setRefDistance(100);
    audio.setLoop(true);

    
    // create anchor
    const anchor = mindarThree.addAnchor(0);
    anchor.group.add(model3d.scene);
    anchor.group.add(audio);

    anchor.onTargetFound = () => {
      //console.log("Marker found")
      audio.play();
    }

    anchor.onTargetLost = () => {
      //console.log("Marker lost")
      //audio.stop();
      audio.pause();
    }

    // start AR
    await mindarThree.start();
    renderer.setAnimationLoop(() => {
      const delta = clock.getDelta();
      model3d.scene.rotation.set(0,model3d.scene.rotation.y + delta,0);
      mixer.update(delta);
      renderer.render(scene, camera);
    });
  }
  start();
});
