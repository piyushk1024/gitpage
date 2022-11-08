import * as THREE from './static/libs/three.js-r132/build/three.module.js'
import {ARButton} from './static/libs/three.js-r132/examples/jsm/webxr/ARButton.js'

document.addEventListener('DOMContentLoaded', () => {
    const initialize = async() => {    

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(70,window.innerWidth/window.innerHeight, 0.01,20);
    
    const renderer = new THREE.WebGLRenderer({antialias:true, alpha:true});
    renderer.setSize(window.innerWidth,window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.xr.enabled = true;

    renderer.setAnimationLoop(() => {
        renderer.render(scene,camera);
    })

    const arButton = ARButton.createButton(renderer, {optionalFeatures: ['dom-overlay'], domOverlay: {root: document.body}});
    
    document.body.appendChild(renderer.domElement);
    document.body.appendChild(arButton);

    const controller = renderer.xr.getController(0);
    scene.add(controller);

    const geometry = new THREE.BoxGeometry(0.06, 0.06, 0.06); 
        

    controller.addEventListener('select', () => {
        const material = new THREE.MeshBasicMaterial({color: 0xffffff * Math.random()});        
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.applyMatrix4(controller.matrixWorld);
        mesh.quaternion.setFromRotationMatrix(controller.matrixWorld);
        scene.add(mesh);
    });

    const light = new THREE.HemisphereLight( 0xffffff, 0xbbbbff, 1 );
    scene.add(light);
}
    initialize();
});