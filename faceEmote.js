import * as faceapi from './static/libs/faceapi/face-api.esm.js';
import {loadTexture} from "./static/libs/loader.js";
const THREE = window.MINDAR.FACE.THREE;

document.addEventListener('DOMContentLoaded', () => {
  const start = async() => {

    const optionsTinyFace = new faceapi.TinyFaceDetectorOptions({ inputSize: 128, scoreThreshold : 0.3 }) ;
    const modelPath = './static/libs/faceapi/model';
    await faceapi.nets.tinyFaceDetector.load(modelPath);
    await faceapi.nets.faceLandmark68Net.load(modelPath);
    await faceapi.nets.faceExpressionNet.load(modelPath);

    // initialize MindAR 
    const mindarThree = new window.MINDAR.FACE.MindARThree({
      container: document.body
    });
    const {renderer, scene, camera} = mindarThree;
    const textures = {};
    textures['happy'] = await loadTexture('./static/assets/openmoji/1F600.png');
    textures['angry'] = await loadTexture('./static/assets/openmoji/1F621.png');
    textures['sad'] = await loadTexture('./static/assets/openmoji/1F625.png');
    textures['neutral'] = await loadTexture('./static/assets/openmoji/1F610.png');

    //unicode
    //neutral &#128528
    //happy  	&#128512
    //sad  	&#57432;
    //angry  	&#58390
    const geometry = new THREE.PlaneGeometry(1, 1);
    const material = new THREE.MeshBasicMaterial({map: textures['neutral']});
    const plane = new THREE.Mesh(geometry, material);

    // create anchor
    // const anchor = mindarThree.addAnchor(151);
    // anchor.group.add(plane);

    // start AR
    await mindarThree.start();
    renderer.setAnimationLoop(() => {
      renderer.render(scene, camera);
    });

    const video = mindarThree.video;

    const expressions = ['happy', 'angry', 'sad', 'neutral'];

    const emotionDict = {
      'neutral': '😐',
      'happy': '😀',
      'sad': '☹️',
      'angry':'😠'
    }


    let lastExpression = 'neutral';
    const detect = async () => {
      const results = await faceapi.detectSingleFace(video, optionsTinyFace).withFaceLandmarks().withFaceExpressions();
      if (results && results.expressions) {
        let newExpression = 'neutral';
        for (let i = 0; i < expressions.length; i++) {
          if (results.expressions[expressions[i]] > 0.5) {
            newExpression = expressions[i];
          }
        }
        if (newExpression !== lastExpression) {
          // material.map = textures[newExpression];
          // material.needsUpdate = true;
          document.querySelector("#emotionPanel").textContent = emotionDict[newExpression];
          console.log(newExpression,emotionDict[newExpression]);
        }
        lastExpression = newExpression;
      }
      window.requestAnimationFrame(detect);
      }
    window.requestAnimationFrame(detect);    
  };
  start();
});
