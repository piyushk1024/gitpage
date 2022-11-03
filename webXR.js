import * as THREE from './static/libs/three.js-r132/build/three.module.js'

document.addEventListener('DOMContentLoaded', () => {
    const initialize = async() => {
    const arButton = document.querySelector("#ar-button");

    //checking and request webxr session
    const supported = navigator.xr && await navigator.xr.isSessionSupported('immersive-ar');
    if (!supported) {
        arButton.textContent = "Not Supported";
        arButton.disabled = true;
        return;
    }
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera();

    const renderer = new THREE.WebGLRenderer({antialias:true, alpha:true});
    renderer.setSize(window.innerWidth,window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild(renderer.domElement);

    const geometry = new THREE.BoxGeometry(0.06, 0.06, 0.06); 
    const material = new THREE.MeshBasicMaterial({color: 0xffff00});
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(0, 0, -0.3);
    scene.add(mesh);

    const light = new THREE.HemisphereLight( 0xffffff, 0xbbbbff, 1 );
    scene.add(light);

    renderer.xr.addEventListener("sessionstart",(e) =>{
        console.log("Session Start");
    });

    renderer.xr.addEventListener("sessionend",() =>{
        console.log("Session end");
    });

    let currentSession = null;

    const start = async() => {
        currentSession = await navigator.xr.requestSession('immersive-ar',{optionalFeatures: ['dom-overlay'],domOverlay:{root: document.body}})

        renderer.xr.enabled = true;
        renderer.xr.setReferenceSpaceType('local');
        await renderer.xr.setSession(currentSession);
        arButton.textContent = "End";

        renderer.setAnimationLoop(() => {
            renderer.render(scene,camera);
        });
    }

    const end = async() => {
        currentSession.end();
        renderer.setAnimationLoop(null);
        renderer.clear();
        arButton.style.display = "none";
    }

    arButton.addEventListener('click',() => {
        if (currentSession) {
            end();
        }
        else {
            start();
        }
    });
    }
    initialize();
})