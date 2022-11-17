import * as THREE from './static/libs/three.js-r132/build/three.module.js'
import {ARButton} from './static/libs/three.js-r132/examples/jsm/webxr/ARButton.js'
import {loadGLTF,loadAudio} from "./static/libs/loader.js";

document.addEventListener('DOMContentLoaded', () => {
    const initialize = async() => {    

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera();

        const AmbientLight = new THREE.AmbientLight( 0x404040,1 ); // soft white light
        scene.add( AmbientLight );

        //const light = new THREE.HemisphereLight( 0xffffff, 0xbbbbff, 1 );
        const light = new THREE.DirectionalLight(0xffffff, 1);
        scene.add(light);        

        const reticleGeometry = new THREE.RingGeometry(0.15,0.2,32).rotateX(-Math.PI/2);
        const reticleMaterial = new THREE.MeshBasicMaterial();
        const reticle = new THREE.Mesh(reticleGeometry,reticleMaterial);
        reticle.matrixAutoUpdate = false;
        reticle.visible = false;
        scene.add(reticle);

    
        const renderer = new THREE.WebGLRenderer({antialias:true, alpha:true});        
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth,window.innerHeight);
        renderer.xr.enabled = true;

        const arButton = ARButton.createButton(renderer,
            {requiredFeatures: ['hit-test'],
            optionalFeatures: ['dom-overlay'], domOverlay: {root: document.body}});
        document.body.appendChild(renderer.domElement);
        document.body.appendChild(arButton);

        const controller = renderer.xr.getController(0);
        scene.add(controller);

        var carPlaced = false;
        
        const car3d = await loadGLTF('./static/assets/alfa_romeo_stradale_1967/scene.gltf');
        car3d.scene.scale.set(2,2,2);
        //model3d.scene.position.set(0,-0.4,0);
        controller.addEventListener('select', () => {
            //const geometry = new THREE.BoxGeometry(0.06, 0.06, 0.06); 
            //const material = new THREE.MeshBasicMaterial({color: 0xffffff * Math.random()});        
            //const mesh = new THREE.Mesh(geometry, material);
            if (!carPlaced) {
                scene.add(car3d.scene);
                //car3d.scene.position.setFromMatrixPosition(reticle.matrix);

                carPlaced = true;
            }
            else {
                //console.log(car3d.scene.material);
                //car3d.scene.material.color.set(0xffffff * Math.random());
                //o.material.
            }
            car3d.scene.position.setFromMatrixPosition(reticle.matrix);
            //quaternion.setFromRotationMatrix(controller.matrixWorld);
            car3d.scene.quaternion.setFromRotationMatrix(reticle.matrixWorld);
            //car3d.scene.position.set(reticle.matrix);
            //mesh.scale.y = Math.random()*2 + 1;

            
            
        });

        renderer.xr.addEventListener("sessionstart", async (e) => {
            const session = renderer.xr.getSession();
            const viewerReferenceSpace = await session.requestReferenceSpace("viewer");
            const hitTestSource = await session.requestHitTestSource({space : viewerReferenceSpace});

            renderer.setAnimationLoop((timestamp,frame) => {
                if (!frame) return;
                
                const hitTestResults = frame.getHitTestResults(hitTestSource);

                if (hitTestResults.length) {   
                    //console.log(hitTestResults.length);
                    const hit = hitTestResults[0];
                    const referenceSpace = renderer.xr.getReferenceSpace();
                    const hitPose = hit.getPose(referenceSpace);
                    reticle.visible = true;
                    reticle.matrix.fromArray(hitPose.transform.matrix);
                } else {                
                    reticle.visible = false;
                }
                renderer.render(scene,camera);
            });
            
        });

    


}
    initialize();
});