import {loadGLTF, loadVideo} from "/libs/loader.js";
import { createChromaMaterial } from "/libs/chroma-video.js";

const THREE = window.MINDAR.IMAGE.THREE;

document.addEventListener('DOMContentLoaded', () => {
  const start = async() => {
    const mindarThree = new window.MINDAR.IMAGE.MindARThree({
      container: document.querySelector("#AR-div"),
      imageTargetSrc: '/assets/targets.mind',
    });
    const {renderer, scene, camera} = mindarThree;

    const video = await loadVideo("/assets/videos/chromavideo.mp4");
    // video.play();
    // video.pause();
    const texture = new THREE.VideoTexture(video);
    //texture.setLoop(true);

    //video.gets

    const geometry = new THREE.PlaneGeometry(1, 368/448);
    const material = createChromaMaterial(texture,0x00ff00);
    const plane = new THREE.Mesh(geometry, material);

    //plane.rotation.x = Math.PI/2;
    //plane.position.y = 0.7;
    //plane.scale.multiplyScaler(4);

    const anchor = mindarThree.addAnchor(0);
    anchor.group.add(plane);

    anchor.onTargetFound = () => {
      video.play();
    }
    anchor.onTargetLost = () => {
      video.pause();
    }
    // video.addEventListener( 'play', () => {
    //   video.currentTime = 0;
    // });

    await mindarThree.start();
    renderer.setAnimationLoop(() => {
      renderer.render(scene, camera);
    });
  }
  start();
});
