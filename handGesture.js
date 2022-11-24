//import {loadGLTF} from "./static/libs/loader.js";
const THREE = window.MINDAR.IMAGE.THREE;

document.addEventListener('DOMContentLoaded', () => {
  const start = async() => {
    const mindarThree = new window.MINDAR.IMAGE.MindARThree({
      container: document.body,
      uiScanning: "no",
      imageTargetSrc: './static/assets/targets.mind',
    });

    // document.querySelector("#switch").addEventListener("click", () => {
    //   mindarThree.switchCamera();
    // });

    const {renderer, scene, camera} = mindarThree;

    
    const model = await handpose.load();

    const waveGesture = new fp.GestureDescription('wave');
    for(let finger of [fp.Finger.Thumb, fp.Finger.Index, fp.Finger.Middle, fp.Finger.Ring, fp.Finger.Pinky]) {
      waveGesture.addCurl(finger, fp.FingerCurl.NoCurl, 1.0);
      waveGesture.addDirection(finger, fp.FingerDirection.VerticalUp, 1.0);
    }

    const GE = new fp.GestureEstimator([
      fp.Gestures.ThumbsUpGesture,
      fp.Gestures.VictoryGesture,
      waveGesture,
      // oneUp,
      // twoUp
    ]);
    function responser(response) {
      //document.querySelector('#optionA').textContent = "1";
      //document.querySelector('#optionB').textContent = "2";
      document.querySelector('#answer').textContent = "";      
      document.querySelector('#optionA').style.backgroundColor  = 'transparent';
      document.querySelector('#optionB').style.backgroundColor  = 'transparent';

      if (response === 1) {
        document.querySelector('#answer').textContent = "Selected 1";
        document.querySelector('#optionA').style.backgroundColor  = 'lightseagreen';   
      }
      else if (response === 2) {
        document.querySelector('#answer').textContent = "Selected 2";
        document.querySelector('#optionB').style.backgroundColor  = 'lightseagreen';   
      }
      else if (response === 3) {
        document.querySelector('#answer').textContent = "No Response";
      }

    };
    // start
    //const clock = new THREE.Clock();
    await mindarThree.start();
    renderer.setAnimationLoop(() => {
      renderer.render(scene, camera);
    });


    const video = mindarThree.video;
    let skipCount = 0;
    const detect = async () => {
      // if (activeAction !== idleAction) {
	    //   window.requestAnimationFrame(detect);
	    // return;
      // }
      if (skipCount < 10) {
	      skipCount += 1;
	      window.requestAnimationFrame(detect);
	    return;
      }
      skipCount = 0;

      const predictions = await model.estimateHands(video);
      if (predictions.length > 0) {
	      const estimatedGestures = GE.estimate(predictions[0].landmarks, 7.5);
        console.log(estimatedGestures);
	      if (estimatedGestures.gestures.length > 0) {
	        const best = estimatedGestures.gestures.sort((g1, g2) => g2.confidence - g1.confidence)[0];
          if (best.name === 'thumbs_up') {            
            //document.querySelector("#optionA").textContent = "Selected A";
            responser(1);
            console.log("thumbs up");
          } else if (best.name === 'wave') {            
            responser(3);
          } else if (best.name === 'victory') {
            //fadeToAction(dieAction, 0.5);
            console.log("victory gesture");
            //document.querySelector("#optionB").textContent = "Selected B";
            responser(2);
          }
    //else {responser(0)}
    

	}
  else {
    //document.querySelector("#optionA").textContent = "A";
    //document.querySelector("#optionB").textContent = "B";
  }
      }
      window.requestAnimationFrame(detect);
    };
    window.requestAnimationFrame(detect);
  }
  start();
});
