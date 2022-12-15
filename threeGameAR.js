//import {loadGLTF,loadAudio} from "./static/libs/loader.js";
//import {mockWithVideo} from '../../libs/camera-mock';
//import {WEBGL} from "./static/libs/three.js-r132/examples/jsm/WebGL.js";
//import {CSS2DRenderer,CSS2DObject} from "./static/libs/three.js-r132/examples/jsm/renderers/CSS2DRenderer.js";
import {CSS3DRenderer,CSS3DObject} from "./static/libs/three.js-r132/examples/jsm/renderers/CSS3DRenderer.js";
//import Stats from './static/libs/three.js-r132/examples/jsm/libs/stats.module.js';

const THREE = window.MINDAR.IMAGE.THREE;
//const mindarThree;
// monitorEvents(window);

// console.log(mindarThree);


const tileColor = 'DarkSlateGray';
const slotColor = 'Silver';
var testWord = "COHORT";
//const wordList = ["ABC","DEF"]
//var progress = wordList.length
//var testWord = wordList[0];

var numLetters;
const timeLimit = 15;
var timeRemaining = timeLimit;

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

var movecount = 0;
var gameStatus = 0; //0 -not started 1-loaded 2 - in progress 3-game finished
var detected = false; //to chech when object is on screen
const timer = new THREE.Clock({autoStart:false});

document.getElementById("dropButton").style.visibility = 'hidden';
document.getElementById("undo").style.visibility = 'hidden';
document.getElementById("timeP").style.visibility = 'hidden';
document.getElementById("timeP").innerText = 'Time : ' + timeLimit;
document.getElementById("instructions").style.display = 'none';
document.getElementById("scoreCard").style.display = 'none';


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
	return slot; 
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
	inHand = true;
	document.getElementById('status').textContent = "Tile picked : " + testWord[winningOrder[tileInHand]];
	document.getElementById("dropButton").style.visibility = 'visible';
}

function slotClick(slotIndex) {	
	if (inHand && !slotArray[slotIndex].userData['placed']) {

		slotArray[slotIndex].element.innerHTML = testWord[winningOrder[tileInHand]];
		slotArray[slotIndex].userData['placed'] = true;
		slotArray[slotIndex].userData['childTile'] = tileInHand;

		tileArray[tileInHand].userData['parentSlot'] = slotIndex;

		moveset.push(tileInHand);
		movecount += 1;
		document.getElementById('undo').disabled = false;
		document.getElementById("undo").style.visibility = 'visible';
		document.getElementById("dropButton").style.visibility = 'hidden';

		if (moveset.length === numLetters) {
			checkwin();
		}
		tileInHand = -1;
		inHand = false;
	}

}

function undoMove() {
	if (moveset.length === 0) {
		document.getElementById("status").textContent = "No moves to Undo"; 
		document.getElementById("undo").disabled = true; 
		document.getElementById("undo").style.visibility = 'hidden'; 
	}
	else {
		var movedTile = moveset.pop();
		var placedSlot = tileArray[movedTile].userData['parentSlot'];
		tileArray[movedTile].userData['parentSlot'] = -1;

		slotArray[placedSlot].element.innerHTML = "_";

		slotArray[placedSlot].userData['childTile'] = -1;
		slotArray[placedSlot].userData['placed'] = false;
		tileArray[movedTile].visible = true;
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
		if (testWord[winningOrder[slotArray[i].userData['childTile']]] != testWord[i]) {
			won = false;
			break;
		}
	}	
	if (won) {
		document.getElementById('status').textContent = "Correct!!";
		document.getElementById('undo').disabled = true;
		document.getElementById("undo").style.visibility = 'hidden';
		console.log(movecount,numLetters);
		gameStatus = 3;
		//create scorecard
		document.getElementById("scoreCard").style.display = 'block';
		document.getElementById('scoreCard').append(document.createElement('p').innerHTML = 'Your Score');
		document.getElementById("scoreCard").appendChild(document.createElement('br'));
		const p = [];
		p.push(document.createElement('p'));
		p[p.length-1].innerHTML = ("Undo Penalties : " + (movecount-numLetters)*5);		
		document.getElementById("scoreCard").appendChild(p[p.length-1]);
		
		p.push(document.createElement('p'));
		p[p.length-1].innerHTML = ("Score : " + (100-(movecount-numLetters)*5));		
		document.getElementById("scoreCard").appendChild(p[p.length-1]);

		p.push(document.createElement('p'));
		p[p.length-1].innerHTML = ("Time Bonus : " + timeRemaining*10);		
		document.getElementById("scoreCard").appendChild(p[p.length-1]);

		p.push(document.createElement('p'));
		p[p.length-1].innerHTML = ("Final Score : "+ (100-(movecount-numLetters)*5+timeRemaining*10));		
		document.getElementById("scoreCard").appendChild(p[p.length-1]);		
		document.getElementById('scoreCard').append(document.createElement('p').innerHTML = 'Refresh Browser window to play again');
		document.getElementById("controlButton").style.visibility = 'hidden';



		console.log("Undo Penalty : " + (movecount-numLetters)*5,
					"Score : " + (100-(movecount-numLetters)*5),
					"Time Bonus : " + timeRemaining*10,
					"Final Score : "+ (100-(movecount-numLetters)*5+timeRemaining*10));
	}
	else {
		document.getElementById('status').textContent = "Not quite there";
	}
}

document.getElementById("undo").addEventListener("click", () => {
	undoMove();
})

document.getElementById("dropButton").addEventListener("click", () => {
	dropTile();
	document.getElementById('status').textContent = "Tile Dropped";
})

document.getElementById("showInfo").addEventListener("click", () => {
	console.log('show')
	document.getElementById('instructions').style.display = 'block';
})

function timeKeeper(){
	
	if ((timer.getElapsedTime() - (timeLimit-timeRemaining))> 0.1){			
		timeRemaining = Math.round((timeRemaining-0.1)*10)/10;

		document.getElementById("timeP").innerText = 'Time : ' + timeRemaining;			
	}
	if (gameStatus === 3 || timeRemaining<=0) {
		console.log(Math.round(((timeLimit-timer.getElapsedTime())*10))/10,timeRemaining,timeLimit-timer.getElapsedTime());
		gameStatus +=1;
		timer.stop();
		return;
	}
}

document.addEventListener('DOMContentLoaded', () => {
	const start = async() => {	
		const mindarThree = new window.MINDAR.IMAGE.MindARThree({
			container: document.body,//document.body
			imageTargetSrc: './static/assets/targets.mind',
			});
		
	


	document.getElementById("controlButton").addEventListener("click", () => {
		console.log("clicked control",gameStatus)
		if (gameStatus == 0) {
			document.getElementById("splash").style.display = 'none';
			document.getElementById("instructions").style.display = 'none';
			document.getElementById("controlButton").style.visibility = 'hidden';
			document.getElementById("controlButton").textContent = 'Restart Game'
			document.getElementById("status").textContent = 'Looking for Marker'
			document.getElementById("showInfo").style.visibility = 'hidden'

			// start()
			mindarThree.start();
			gameStatus = 1;
		}
		else if (gameStatus ===2) {
			while (moveset.length>0) {
				undoMove();
			}
			movecount = 0;
			document.getElementById('status').textContent = "Game Restarted";

			
		}
		
	});

	const {renderer, cssRenderer, scene, cssScene, camera} = mindarThree;

	numLetters = testWord.length
	const clock = new THREE.Clock();
	var offset = 0.5*(1 - (numLetters%2));

	shuffle();

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

		for (let i = 0; i <numLetters; i++) {
			tileArray[i].visible = true;
			slotArray[i].visible = true;
		}
		
		document.getElementById("controlButton").style.visibility = 'visible';
		
		document.getElementById("status").style.visibility = 'visible';
		document.getElementById("status").textContent = "Game Started";
		
		document.getElementById("status").textContent = 'Game Started'
		document.getElementById("controlButton").style.hidden = 'visible';
		document.getElementById("dropButton").innerHTML = 'Drop Tile';
		gameStatus = 2;
		timer.start();
		document.getElementById('timeP').style.visibility = 'visible';
		//textObj.visible = true;
	}
  
	anchor.onTargetLost = () => {
		detected = false;
	}
	  
  
	  //set up raycasting

	//await mindarThree.start();

	  renderer.setAnimationLoop(() => {
		renderer.render(scene, camera);
		cssRenderer.render(cssScene, camera);
		if (gameStatus ===2 | gameStatus ===3){
			timeKeeper();
		}
			
		// console.log(timer.getElapsedTime());
	  });
	}
	start();
	// pause();
});

// start();

  