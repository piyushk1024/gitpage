import * as THREE from './static/libs/three.js-r132/build/three.module.js'
import {ARButton} from './static/libs/three.js-r132/examples/jsm/webxr/ARButton.js'
import {loadGLTF,loadAudio} from "./static/libs/loader.js";


document.addEventListener('DOMContentLoaded', () => {
    const initialize = async() => {    

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera();

        //const eventsDiv = document.querySelector("#events");

        //const light = new THREE.HemisphereLight( 0xffffff, 0xbbbbff, 1 );
        //scene.add(light);        
        const AmbientLight = new THREE.AmbientLight( 0x404040,1 ); // soft white light
        scene.add( AmbientLight );
        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(0, 1, 1);
        //light.position.set(camera.getWorldPosition);
        scene.add(light);


        const reticleGeometry = new THREE.RingGeometry(0.15,0.2,32).rotateX(-Math.PI/2);
        const reticleMaterial = new THREE.MeshBasicMaterial();
        const reticle = new THREE.Mesh(reticleGeometry,reticleMaterial);
        reticle.matrixAutoUpdate = false;
        reticle.visible = false;
        scene.add(reticle);

    
        const renderer = new THREE.WebGLRenderer({antialias:true, alpha:true,gammaOutput : true});        
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

        var fixturePlaced = false;
        var toggle = false

        console.log("now loading");
        
        //const fixture = await loadGLTF('./static/assets/alfa_romeo_stradale_1967/scene.gltf');
        const fixture = await loadGLTF('./static/assets/shower_high_poly/scene.gltf');
        
        //const fixture = await loadGLTF('./static/assets/Rotating_jet_engine/Rotating_jet_engine.gltf');
        //const fixture = await loadGLTF('./static/assets/rover/rover.gltf');
        //const fixture = await loadGLTF('./static/assets/fighterJet/fighterJet.gltf');
        //fixture.scene.rotateX(-Math.PI/2);
        //const fixture = await loadGLTF('./static/assets/shower_stand/scene.gltf');
        
        
        //fixture = normalizeModel(fixture.scene, 1);
        console.log("Model Loaded");
        //fixture.scene.scale.set(0.5,0.5,0.5);
        //fixture.scene.position.set(0,0,0);
        //console.log(fixture.scene.position);
        //scene.add(fixture.scene);
        //controller.addEventListener('select', () => {
        document.querySelector("#placeObj").addEventListener("click",() => {
            //const geometry = new THREE.BoxGeometry(0.06, 0.06, 0.06); 
            //const material = new THREE.MeshBasicMaterial({color: 0xffffff * Math.random()});        
            //const mesh = new THREE.Mesh(geometry, material);
            if (!fixturePlaced) {
                scene.add(fixture.scene);
                scene.add(light);

                
                //fixture.scene.position.setFromMatrixPosition(reticle.matrix);

                fixturePlaced = true;
            }
            else {
                //console.log(fixture.scene.material);
                //fixture.scene.material.color.set(0xffffff * Math.random());
                //o.material.
            }
            fixture.scene.position.setFromMatrixPosition(reticle.matrix);           
            //fixture.scene.position.copy(reticle.position);           
            fixture.scene.quaternion.setFromRotationMatrix(reticle.matrixWorld);
            fixture.scene.rotateX(-Math.PI/2);
            //fixture.scene.rotateX(-Math.PI/2);
            //light.target = fixture;
            //light.position.setFromMatrixPosition(camera.matrix - reticle.matrix);    
            
            //fixture.scene.position.set(reticle.matrix);
            //mesh.scale.y = Math.random()*2 + 1;

            
            
        });
        document.querySelector("#toggle").addEventListener("click", () => {
            toggle = !toggle;
            if (toggle) {
                document.querySelector("#toggle").textContent = "Toggle Placement";
            }
            else {document.querySelector("#toggle").textContent = "Toggle Rotation";}
          });
        // document.querySelector("#matrix").addEventListener("click", () => {
        //     printDetails();
        //   });

        document.querySelector("#xDec").addEventListener("click", () => {
            poschange(0,-1)
            });

        document.querySelector("#xInc").addEventListener("click", () => {
            poschange(0,1)
            });
        document.querySelector("#yDec").addEventListener("click", () => {
            poschange(1,-1)
            });

        document.querySelector("#yInc").addEventListener("click", () => {
            poschange(1,1)
            });
        document.querySelector("#zDec").addEventListener("click", () => {
            poschange(2,-1)
            });
    
        document.querySelector("#zInc").addEventListener("click", () => {
            poschange(2,1)
            });
        document.querySelector("#scaleDec").addEventListener("click", () => {
            fixture.scene.scale.set(fixture.scene.scale.x*0.9,fixture.scene.scale.y*0.9,fixture.scene.scale.z*0.9);
                // fixture.scene.scale.set.x = fixture.scene.scale.x-0.1;
                // fixture.scene.scale.set.y = fixture.scene.scale.set.y-0.1;
                // fixture.scene.scale.set.z = fixture.scene.scale.set.z-0.1;
            });
        
        document.querySelector("#scaleInc").addEventListener("click", () => {
            fixture.scene.scale.set(fixture.scene.scale.x*1.1,fixture.scene.scale.y*1.1,fixture.scene.scale.z*1.1);
            });

        function printDetails() {
            console.log(reticle.matrix);
            console.log(reticle.matrixWorld);
            console.log(reticle.matrixWorld.elements[12]);
            console.log(reticle.position);
        }
        function poschange(axis,delta) {
            // 0 - x, 1 - y, 2 - z,
            // -1 and 1
            if (!toggle) {
                //console.log(axis,delta)
                if (axis === 0) {
                    fixture.scene.position.x = fixture.scene.position.x + (delta * 0.1);
                }
                else if (axis === 1 ) {
                    fixture.scene.position.y = fixture.scene.position.y + (delta * 0.1);
                }
                else if (axis === 2 ) {
                    fixture.scene.position.z = fixture.scene.position.z + (delta * 0.1);
                }
            }
            else {
                //fixture.scenenrotateX(-Math.PI/2);
                if (axis === 0) {
                    fixture.scene.rotateX(delta * Math.PI/2);
                }
                else if (axis === 1 ) {
                    fixture.scene.rotateY(delta * Math.PI/2);
                }
                else if (axis === 2 ) {
                    fixture.scene.rotateZ(delta * Math.PI/2);
                }
            }            
        };


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
                // eventsDiv.value = "Fixture position: \n" + "x: " + fixture.scene.position.x
                // + " y: " + fixture.scene.position.y
                // +" z: " + fixture.scene.position.z
                // +"\nScale x:" + scene.scale.x + " y:" +scene.scale.y +" z:"+scene.scale.z
                // +"\n Reticle Position \n" + "x: " + reticle.matrixWorld.elements[12]
                // + " y: " + reticle.matrixWorld.elements[13]
                // + " z: " + reticle.matrixWorld.elements[14]
                //+"\n fixture rotation: " fixture.rotation; 

                //+"\n reticle matrix: " + reticle.matrix[12];
                //console.log(reticle.matrix);
            });
            
        });

    


}
    initialize();
});