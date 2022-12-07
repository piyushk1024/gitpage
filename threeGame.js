import * as THREE from "./static/libs/three.js-r132/build/three.module.js";
import {WEBGL} from "./static/libs/three.js-r132/examples/jsm/WebGL.js";
import {CSS2DRenderer,CSS2DObject} from "./static/libs/three.js-r132/examples/jsm/renderers/CSS2DRenderer.js";
import Stats from './static/libs/three.js-r132/examples/jsm/libs/stats.module.js';
//import {DragControls} from "/static/libs/three.js-r132/examples/jsm/controls/DragControls.js";

let camera, scene, raycaster, renderer,stats,labelRenderer;
let root;

let INTERSECTED;
let theta = 0;

const tileColor = 'DarkSlateGray';
const slotColor = 'Silver';
var testWord = "TAX";

var numLetters;

const tileArray = [];
const slotArray = [];

const tilePos = []; // array to store Tile Positions

const orderIdDict = {}; //dictionary storing indices to id
const idsOrderDict = {}; //reverse of above
const tileIdsArr = []; //ids
const labelArray = []; //text labels

const orderIdDictSlot = {}; //dictionary storing indices to id
const idsOrderDictSlot = {}; //reverse of above
const slotIdsArr = []; //ids
const slotPos = []; //array to store slot positions

var inHand = false;
var tileInHand = -1;

const moveset = [];
const winningOrder = [];

const pointer = new THREE.Vector2();

function GameManager() {

};

function tileCreator(tileIndex) {
	const geometry = new THREE.BoxGeometry( 1, 1, 0.03 );
	
	const material = new THREE.MeshBasicMaterial({color:tileColor});
	const tile = new THREE.Mesh( geometry, material );
	tileIndex = winningOrder[tileIndex];
	labelArray[tileIndex] = labelMaker(testWord[tileIndex]);
	tile.add(labelArray[tileIndex]);	
	
	tile.userData = {'canPick':true,'picked':false,'parentSlot':-1}; //type 0 - tile
	return tile; 
}

function slotCreator(tileIndex) {
	const geometry = new THREE.BoxGeometry( 1.25, 1.25, 0.03 );
	
	const material = new THREE.MeshBasicMaterial({color:slotColor,transparent: true,opacity:1});
	const slot = new THREE.Mesh( geometry, material );
	slot.userData = {'canPick':false,'picked':false,'childTile':-1};
	return slot; 
}

function labelMaker(letter) {
	const text = document.createElement( 'div' );
	text.className = 'label';
	text.style.color = 'white';
	text.textContent = letter;
	const label = new CSS2DObject( text );	
	return label;
}

function shuffle() {	
	for (let i = 0;i < numLetters;i++) {
		winningOrder.push(i);
		labelArray[i] = '';
	}	
	let currentIndex = winningOrder.length,randomIndex;
	while (currentIndex != 0) {
		randomIndex = Math.floor(Math.random()*currentIndex);
		currentIndex--;	
		[winningOrder[randomIndex],winningOrder[currentIndex]] = [winningOrder[currentIndex],winningOrder[randomIndex]];
	}
	return winningOrder;
}

function init() {
	camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 10000 );
	camera.position.set(0,0,10);
	scene = new THREE.Scene();
	
	
	//scene.background = new THREE.Color( 0xf0f0f0 );

	// const light = new THREE.DirectionalLight( 0xffffff, 1 );
	// light.position.set( 1, 1, 1 ).normalize();
	// scene.add( light );


	raycaster = new THREE.Raycaster();

	renderer = new THREE.WebGLRenderer();
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	container.appendChild( renderer.domElement );

	labelRenderer = new CSS2DRenderer();
	labelRenderer.setSize( window.innerWidth, window.innerHeight );
	labelRenderer.domElement.style.position = 'absolute';
	labelRenderer.domElement.style.top = '0px';
	labelRenderer.domElement.style.pointerEvents = 'none';
	document.getElementById( 'container' ).appendChild( labelRenderer.domElement );

	//root = new THREE.Group();
	//scene.add( root );

	numLetters = testWord.length;
	shuffle();
	console.log("got winner",winningOrder);
	
	var offset = 0.5*(1 - (numLetters%2));

	for (let i = 0; i < numLetters; i++) {
		tileArray[i] = tileCreator(i);	
		
		orderIdDict[i] = tileArray[i].id;
		idsOrderDict[tileArray[i].id] = i;
		tileIdsArr[i] = tileArray[i].id;

		tilePos[i] = 1.5*((i-(numLetters/2)) + offset);
		tileArray[i].position.set(tilePos[i],0,0);
		
		labelArray[winningOrder[i]].position.copy( tileArray[i].position);
		labelArray[winningOrder[i]].position.set(0,0,0);
		scene.add(tileArray[i]);

		slotArray[i] = slotCreator(i);	
		
		orderIdDictSlot[i] = slotArray[i].id;
		idsOrderDictSlot[slotArray[i].id] = i;
		slotIdsArr[i] = slotArray[i].id;
		
		
		slotPos[i] = 1.75*((i-(numLetters/2)) + offset);
		slotArray[i].position.set(slotPos[i],3,0);
		scene.add(slotArray[i]);


		//tileArray[i].position.set(tilePos[i],tilePos[i],tilePos[i]);
		
	
		
	};

	let movedCube = false;
	let movedId;
	let obj

	stats = new Stats();
	container.appendChild( stats.dom );

	document.addEventListener( 'mousemove', onPointerMove );
	document.addEventListener( 'mousedown', onPointerClick );
	window.addEventListener( 'resize', onWindowResize );

	document.getElementById("undo").disabled = true; 
	//document.getElementById("constrolButton").disabled = true;

};

init()


function onPointerMove( event ) {

	pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

}

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );

	animate();
}

function picktile(){

}

function checkwin() {
	let won = true;
	for (let i = 0;i<numLetters;i++) {
		console.log(testWord[winningOrder[slotArray[i].userData['childTile']]],testWord[i])
		if (testWord[winningOrder[slotArray[i].userData['childTile']]] != testWord[i]) {
			won = false;
			break;
		}
	}
	console.log(won);
	if (won) {
		console.log("Won");
		document.getElementById('status').textContent = "Correct!!";
		document.getElementById('undo').disabled = true;
	}
	else {
		console.log("wrong");
		document.getElementById('status').textContent = "Not quite there";
	}
}

function droptile(tileindex){

	tileArray[tileindex].scale.set(1,1,1);
	tileArray[tileindex].material.color.set(tileColor);
	tileArray[tileindex].userData['picked'] = false;
	
	tileArray[tileindex].add(labelArray[winningOrder[tileindex]]);	

	inHand = false;
	tileInHand = -1;
}

function onPointerClick(event) {
	// raycaster.setFromCamera( pointer, camera );

	// const intersects = raycaster.intersectObjects( scene.children, false );


	if (!inHand) {
		if (INTERSECTED) {			
			if (INTERSECTED.userData['canPick'] && !INTERSECTED.userData['picked']) { //When user clicks on tile to be 'picked'	
				
				INTERSECTED['picked'] = true;
				inHand = true;
				while (INTERSECTED.children.length){
					INTERSECTED.remove(INTERSECTED.children[0]);
				}				
				tileInHand = idsOrderDict[INTERSECTED.id];		
				scene.remove(INTERSECTED);
				//console.log(labelArray[tileInHand]);
				document.getElementById('status').textContent = "TilePicked : " + testWord[winningOrder[tileInHand]];
				INTERSECTED = null;
		}}}
	else {		
	

		if (!INTERSECTED) { //when tile is in hand but user clicks on empty space				
			tileArray[tileInHand].position.set(tilePos[tileInHand],0,0);
			scene.add(tileArray[tileInHand]);
			droptile(tileInHand);
			document.getElementById('status').textContent = "";
		}
		else if(!INTERSECTED.userData['canPick']) { //tile to be placed on slot			
			var slotno = idsOrderDictSlot[INTERSECTED.id];
			slotArray[slotno].add(tileArray[tileInHand]);
			tileArray[tileInHand].position.copy(slotArray[slotno]);
			tileArray[tileInHand].position.set(0,0,0.01);

			moveset.push(tileInHand);
			tileArray[tileInHand].userData['parentSlot'] = slotno;
			slotArray[slotno].userData['childTile'] = tileInHand;
			droptile(tileInHand);

			document.getElementById("undo").disabled = false; 
			document.getElementById('status').textContent = "";
			if (moveset.length === numLetters) {
				checkwin();
			}
		}
		
		

	}   
}

function undoMove() {
	if (moveset.length === 0) {
		//console.log("No move to Undo");
		document.getElementById("status").textContent = "No move to Undo"; 
		document.getElementById("undo").disabled = true; 
	}
	else {
		var movedTile = moveset.pop();//moveset[moveset.length-1];
		var placedSlot = tileArray[movedTile].userData['parentSlot'];
		tileArray[movedTile].userData['parentSlot'] = -1;

		while (slotArray[placedSlot].children.length){
			slotArray[placedSlot].remove(slotArray[placedSlot].children[0]);
		}

		slotArray[placedSlot].userData['childTile'] = -1;

		tileArray[movedTile].position.set(tilePos[movedTile],0,0);
		scene.add(tileArray[movedTile]);
		droptile(movedTile);

	}
}

document.querySelector("#undo").addEventListener("click", () => {
	undoMove();
	})
document.querySelector("#controlButton").addEventListener("click", () => {
	while (moveset.length>0) {
		undoMove();
	}
	document.getElementById('status').textContent = "Game Restarted";
})

function render() {

	// theta += 0.1;

	// camera.position.x = radius * Math.sin( THREE.MathUtils.degToRad( theta ) );
	// camera.position.y = radius * Math.sin( THREE.MathUtils.degToRad( theta ) );
	// camera.position.z = radius * Math.cos( THREE.MathUtils.degToRad( theta ) );
	// camera.lookAt( scene.position );

	// camera.updateMatrixWorld();

	// find intersections

	raycaster.setFromCamera( pointer, camera );

	const intersects = raycaster.intersectObjects( scene.children, false );

	if ( intersects.length > 0 ) {

		if ( INTERSECTED != intersects[ 0 ].object ) {

			// if ( INTERSECTED ) {
			INTERSECTED = intersects[ 0 ].object;
			
			// }INTERSECTED.material.color.setHex( INTERSECTED.currentHex );
			
			if (INTERSECTED.userData['canPick'] && !inHand){
			//if (true){
			
			INTERSECTED.currentHex = INTERSECTED.material.color.getHex();
			INTERSECTED.material.color.setHex( 0xff0000 );
			INTERSECTED.scale.set(1.25,1.25,1.25);			
			}
			else if (!INTERSECTED.userData['canPick'] && inHand){
				INTERSECTED.material.opacity = 0.5;
			}
		}

	} else {

		if ( INTERSECTED ) {
			if (INTERSECTED.userData['canPick']){
				INTERSECTED.material.color.setHex( INTERSECTED.currentHex );
				INTERSECTED.scale.set(1,1,1);}
			else {
				INTERSECTED.material.opacity = 1;
			}
		}

		INTERSECTED = null;

	}

	renderer.render( scene, camera );

}
function animate() {
	requestAnimationFrame( animate );
	
	// for (let i = 0; i < numLetters; i++) {
	// 	tileArray[i].rotation.y += 0.01;
	// 	}
	//.render( scene, camera );
	labelRenderer.render( scene, camera );
	stats.update();
	render();
}

if ( WEBGL.isWebGLAvailable() ) {

	// Initiate function or other initializations here
	animate();

} else {

	const warning = WebGL.getWebGLErrorMessage();
	document.getElementById( 'container' ).appendChild( warning );
}
