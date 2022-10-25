import {loadGLTF,loadAudio} from "/static/libs/loader.js";
//import {mockWithVideo} from '../../libs/camera-mock';
const THREE = window.MINDAR.IMAGE.THREE;

var clicked = false;
var detected = false; //to chech when object is on screen


document.addEventListener('DOMContentLoaded', () => {
  const start = async() => {
    // initialize MindAR 
    const mindarThree = new window.MINDAR.IMAGE.MindARThree({
      //container: document.querySelector("#AR-div"),
      container: document.body,//document.body
      imageTargetSrc: '/static/assets/targets.mind',
    });
    const {renderer, scene, camera} = mindarThree;

    //create light

    const light = new THREE.HemisphereLight(0xffffff,0xbbbbff,1);
    scene.add(light);
    
    // load and scale 3d model
    const model3d = await loadGLTF('/static/assets/musicband-raccoon/scene.gltf');
    model3d.scene.scale.set(0.1,0.1,0.1);
    model3d.scene.position.set(0,-0.4,0);
    model3d.scene.userData.clickable = true;

    //for animation
    const mixer = new THREE.AnimationMixer(model3d.scene);
    const action = mixer.clipAction(model3d.animations[0]);
    action.play();

    const clock = new THREE.Clock();

    //for Audio
    const audioClip = await loadAudio ('/static/assets/sounds/drum-beat-90-bpm-with-reverb.mp3');    
    const listener = new THREE.AudioListener();    
    camera.add(listener);

    const audio = new THREE.PositionalAudio(listener);

    audio.setBuffer(audioClip);
    audio.setRefDistance(100);
    audio.setLoop(true);



    const anchor = mindarThree.addAnchor(0);
    anchor.group.add(model3d.scene);
    anchor.group.add(audio);

    anchor.onTargetFound = () => {
      detected = true;
    }

    anchor.onTargetLost = () => {
      detected = false;
    }
    

    //set up raycasting
    
    console.log(clicked)    
    //document.querySelector("#AR-div").children[1].children[0].addEventListener('click',(e) => {
    document.body.addEventListener('click',(e) => {
      const mouseX = (e.clientX / window.innerWidth)*2 -1;
      const mouseY = -((e.clientY/window.innerHeight)*2 -1);
      const mouse = new THREE.Vector2(mouseX, mouseY);
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse,camera);
      const intersects = raycaster.intersectObjects(scene.children, true);

      console.log(intersects);
      if (intersects.length > 0 && detected) {
        console.log("detected")
        let o = intersects[0].object;
        while (o.parent && !o.userData.clickable) {
          o = o.parent;
        }
        if (o.userData.clickable) {
          if (o === model3d.scene) {
            clicked = !clicked
            console.log(clicked)
            console.log(o)
            console.log(intersects)
          }
          if (clicked===true) {
            audio.play();
            //action.play();
          }
          else {
            audio.pause();
            //action.pause();
          }
        }
      }
    });
    // create anchor

    // start AR
    await mindarThree.start();
    renderer.setAnimationLoop(() => {
      const delta = clock.getDelta();
      // if (clicked === true){
      //   model3d.scene.rotation.set(0,model3d.scene.rotation.y + delta,0);
      // }
      
      // 
      if (clicked) {
        mixer.update(delta);
      }
      
      renderer.render(scene, camera);
    });
  }
  start();
});
