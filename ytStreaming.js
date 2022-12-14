import {CSS3DObject} from './static/libs/three.js-r132/examples/jsm/renderers/CSS3DRenderer.js';

const THREE = window.MINDAR.IMAGE.THREE;

const createYoutube = () => {
  return new Promise((resolve,reject) => {
    var tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag,firstScriptTag);

    const onYouTubeIframeAPIReady = () => {
      const player = new YT.Player('player',{
        videoId: 'Ma0KWei4VNc',
        events:{
          onReady: () => {
            resolve(player);
          }
        }
      });
    }
    window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const start = async() => {
    const player = await createYoutube();

    const mindarThree = new window.MINDAR.IMAGE.MindARThree({
      container: document.querySelector("#AR-div"),
      imageTargetSrc: './static/assets/targets.mind',
    });
    const {renderer, scene, cssRenderer, cssScene,camera} = mindarThree;

    const obj = new CSS3DObject(document.querySelector("#ar-div2"));    
    const cssAnchor = mindarThree.addCSSAnchor(0);
    cssAnchor.group.add(obj);

    cssAnchor.onTargetFound = () => {
      player.playVideo();
    }

    cssAnchor.onTargetLost = () => {
      player.pauseVideo();
    }

    await mindarThree.start();
    renderer.setAnimationLoop(() => {
      cssRenderer.render(cssScene, camera);
    });
  }
  start();
});
