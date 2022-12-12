import {loadGLTF,loadAudio} from "./static/libs/loader.js";
//import {mockWithVideo} from '../../libs/camera-mock';
//import {WEBGL} from "./static/libs/three.js-r132/examples/jsm/WebGL.js";
//import {CSS2DRenderer,CSS2DObject} from "./static/libs/three.js-r132/examples/jsm/renderers/CSS2DRenderer.js";
import {CSS3DRenderer,CSS3DObject} from "./static/libs/three.js-r132/examples/jsm/renderers/CSS3DRenderer.js";
import Stats from './static/libs/three.js-r132/examples/jsm/libs/stats.module.js';

const THREE = window.MINDAR.IMAGE.THREE;

let camera, scene, raycaster, renderer,cssRenderer, stats,labelRenderer;
let root;

let INTERSECTED;
let theta = 0;

const tileColor = 'DarkSlateGray';
const slotColor = 'Silver';
//var testWord = "COHORT";
var testWord = "COHORT";

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


var clicked = false;
var detected = false; //to chech when object is on screen

function tileCreator(tileIndex) {

	const textElement = document.createElement("div");
    textElement.style.fontSize = "60px";
	textElement.style.background = tileColor;
	textElement.style.color = 'White';
	textElement.innerHTML = testWord[winningOrder[tileIndex]];
	textElement.style.padding = "30px";
	textElement.visible = false;	
	textElement.name = tileIndex;
	textElement.class = 0;
	
    const tile = new CSS3DObject(textElement);	
	
	
	textElement.addEventListener('pointerdown', () => {tileClick(textElement.name)});
	
	tile.userData = {'canPick':true,'picked':false,'parentSlot':-1}; //type 0 - tile
	return tile; 
}
function slotCreator(tileIndex) {
	const textElement = document.createElement("div");
    textElement.style.fontSize = "120px";
	textElement.style.background = slotColor;
	textElement.style.color = 'White';
	textElement.innerHTML = "_";
	textElement.style.padding = "30px";
	textElement.visible = false;
    
	textElement.name = tileIndex;
	textElement.class = 1;
	textElement.addEventListener('pointerdown', () => {slotClick(textElement.name)});
	
	const slot = new CSS3DObject(textElement);
	slot.userData = {'canPick':false,'placed':false,'childTile':-1};
	//console.log(slot.element);
	return slot; 
}

function labelMaker(letter) {

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

function tileClick(tileIndex) {
	if (inHand) {
		tileArray[tileInHand].visible = true;
	}	
	tileArray[tileIndex].visible = false;

	tileArray[tileIndex].userData['picked'] = true;


	tileInHand = tileIndex;
	console.log("Tile picked",tileIndex,testWord[winningOrder[tileIndex]])
	inHand = true;
	document.getElementById('status').textContent = "Tile picked : " + testWord[winningOrder[tileInHand]];
	document.getElementById("dropButton").style.visibility = 'visible';
}

function slotClick(slotIndex) {
	//console.log(inHand,slotIndex,testWord[winningOrder[tileInHand]],slotArray[slotIndex].getChildByName(slotIndex))
	if (inHand && !slotArray[slotIndex].userData['placed']) {
		// console.log(slotArray[slotIndex]);
		// console.log(slotArray[slotIndex].element);

		slotArray[slotIndex].element.innerHTML = testWord[winningOrder[tileInHand]];
		slotArray[slotIndex].userData['placed'] = true;
		slotArray[slotIndex].userData['childTile'] = tileInHand;

		tileArray[tileInHand].userData['parentSlot'] = slotIndex;

		moveset.push(tileInHand);
		document.getElementById('undo').disabled = false;
		document.getElementById("undo").style.visibility = 'visible';
		document.getElementById("dropButton").style.visibility = 'hidden';

		if (moveset.length === numLetters) {
			checkwin();
		}

		console.log(moveset);
		tileInHand = -1;
		inHand = false;
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

		// while (slotArray[placedSlot].children.length){
		// 	slotArray[placedSlot].remove(slotArray[placedSlot].children[0]);
		// }
		slotArray[placedSlot].element.innerHTML = "_";

		slotArray[placedSlot].userData['childTile'] = -1;
		slotArray[placedSlot].userData['placed'] = false;
		tileArray[movedTile].visible = true;

		//tileArray[movedTile].position.set(tilePos[movedTile],0,0);
		//scene.add(tileArray[movedTile]);
		//droptile(movedTile);
	}
}

function dropTile(){
	if (inHand) {
		tileArray[tileInHand].visible = true;
		tileInHand = 1;
		inHand = false;
	}
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
		document.getElementById("undo").style.visibility = 'hidden';
	}
	else {
		console.log("wrong");
		document.getElementById('status').textContent = "Not quite there";
	}
}


function makeVisible(){
	for (let i = 0; i <numLetters; i++) {
		tileArray[i].visible = true;
		slotArray[i].visible = true;
	}
	
	document.getElementById("controlButton").style.visibility = 'visible';
	
	document.getElementById("status").style.visibility = 'visible';
	document.getElementById("status").textContent = "Game Started";
}


document.addEventListener('DOMContentLoaded', () => {
	const start = async() => {
	
	  // initialize MindAR 
	  const mindarThree = new window.MINDAR.IMAGE.MindARThree({
		container: document.body,//document.body
		imageTargetSrc: './static/assets/targets.mind',
	  });
	  const {renderer, cssRenderer, scene, cssScene, camera} = mindarThree;
  
	  //create light
  
	// const light = new THREE.HemisphereLight(0xffffff,0xbbbbff,1);
	// scene.add(light);
	numLetters = testWord.length
	const clock = new THREE.Clock();
	var offset = 0.5*(1 - (numLetters%2));

	shuffle();
	document.getElementById("undo").disabled = true;
	document.getElementById("undo").style.visibility = 'hidden';//
	document.getElementById("controlButton").style.visibility = 'hidden';
	document.getElementById("dropButton").style.visibility = 'hidden';
	document.getElementById("status").style.visibility = 'hidden';


	document.querySelector("#undo").addEventListener("click", () => {
		undoMove();
		})
	document.querySelector("#controlButton").addEventListener("click", () => {
		while (moveset.length>0) {
			undoMove();
		}
		document.getElementById('status').textContent = "Game Restarted";
	})
	document.querySelector("#dropButton").addEventListener("click", () => {
		dropTile();
		document.getElementById('status').textContent = "Tile Dropped";
	})


	const anchor = mindarThree.addAnchor(0);
	const cssAnchor = mindarThree.addCSSAnchor(0);

	for (let i = 0; i < numLetters; i++) {
		tileArray[i] = tileCreator(i);	
		
		orderIdDict[i] = tileArray[i].id;
		idsOrderDict[tileArray[i].id] = i;
		tileIdsArr[i] = tileArray[i].id;

		tilePos[i] = 150*((i-(numLetters/2)) + offset);
		tileArray[i].position.set(tilePos[i],0,0);

		cssAnchor.group.add(tileArray[i])
		
		slotArray[i] = slotCreator(i);	
		
		orderIdDictSlot[i] = slotArray[i].id;
		idsOrderDictSlot[slotArray[i].id] = i;
		slotIdsArr[i] = slotArray[i].id;
		
		
		slotPos[i] = 175*((i-(numLetters/2)) + offset);
		slotArray[i].position.set(slotPos[i],300,0);
		cssAnchor.group.add(slotArray[i]);	
		
	};
	  anchor.onTargetFound = () => {
		detected = true;
		makeVisible(true);
		//textObj.visible = true;
	  }
  
	  anchor.onTargetLost = () => {
		detected = false;
	  }
	  
  
	  //set up raycasting
	  
	  //console.log(clicked)    
	  //document.querySelector("#AR-div").children[1].children[0].addEventListener('click',(e) => {
	  document.body.addEventListener('click',(e) => {
		const mouseX = (e.clientX / window.innerWidth)*2 -1;
		const mouseY = -((e.clientY/window.innerHeight)*2 -1);
		const mouse = new THREE.Vector2(mouseX, mouseY);
		const raycaster = new THREE.Raycaster();
		raycaster.setFromCamera(mouse,camera);
		const intersects = raycaster.intersectObjects(scene.children, true);
  
		//console.log(e,intersects,e.target.getAttribute('id'),e.target);
		
		if (intersects.length > 0 && detected) {
		  //console.log("detected and clicked")
		  let o = intersects[0].object;
		  if (o.userData['canPick'] && !inHand) {
			tileInHand = orderIdDict[o.id];
			o.visible = false;			
		  }
	  }});
	  // create anchor
  
	  // start AR
	  await mindarThree.start();
	  renderer.setAnimationLoop(() => {
		renderer.render(scene, camera);
		cssRenderer.render(cssScene, camera);
	  });
	}
	start();
  });
  