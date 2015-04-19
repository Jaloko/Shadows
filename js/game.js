(function() {
    var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
    window.requestAnimationFrame = requestAnimationFrame;
})();
// GAME VARIABLES
var canvas, le, fr;
var keys = [];
var mousePos = {
	x : 0,
	y : 0
};
var time;
var countdownTimer;
var beaconsLit;
var beaconsMaxLit = 0;
var levelTimer = 3;
var currentLevel = 0;
var levelStatus = "Menu";
var levelCompleteTimer;
var score = 0;
var ambientLightVal = 10;
var soundMuted = false;
var gamePaused = false;
var spaceToggle = true;
var timeTaken = 0;

// PLAYER VARIABLES
var player;
var playerPulse = {
	pulse: 40,
	pulseSwitch: false
}
// BEACON VARIABLES
var beacons = [];

// DOOR VARIABLES
var doors = [];
var movingDoors = [];

var sounds = {
	countdown : new Audio("sound/countdown.wav"),
	finalCountdown: new Audio("sound/final-countdown.wav"),
	beaconActive : new Audio("sound/beacon.wav"),
	doorOpen : new Audio("sound/door-open.wav"),
	levelComplete : new Audio("sound/level-complete.wav"),
	buttonPress : new Audio("sound/button-press.wav"),
	death : new Audio("sound/death.wav")
}

function setupEventListeners() {
    canvas.addEventListener('mousemove', function(evt) {
        mousePos = getMousePos(canvas, evt);
    }, false);

    canvas.addEventListener("mousedown", function(evt) {
        if(evt.button == 0) {

        }
    }, false);

    canvas.addEventListener("mouseup", function(evt) {
        if(evt.button == 0) {

        }
    }, false);

    document.body.addEventListener("keydown", function(e) {
        keys[e.keyCode] = true;
    });
     
    document.body.addEventListener("keyup", function(e) {
        keys[e.keyCode] = false;
    });    
}

function init() {
    canvas = document.getElementById("canvas");
    setupEventListeners();
    le = new LightingEngine(canvas);

    // Start Lighting Engine
    le.init();

    // Start Font Rendering Engine
    fr = new FontRenderer(canvas);
   	fr.init();
   	fr.setFont("Verdana");
	fr.setFontSize(30);
	fr.setColour(255, 255, 255);

    // Begin Menu
    newGame();
    cleanVariables();
    loadLevel(menuLevel);
    update();
}

/***
GAME FUNCTIONS
***/
function cleanVariables() {
	le.lights = [];
	le.foreground = [];
	le.background = [];
	beacons = [];
	doors = [];
	movingDoors = [];
	levelTimer = 3;
	countdownTimer = 30 * 60;
	beaconsLit = 0;
	beaconsMaxLit = 0;
	ambientLightVal = 10;
	time = new Date().getTime();
	initPlayer();
}

function newGame() {
	score = 0;
	currentLevel = 0;
	initPlayer();
}

function initPlayer() {
	// Init player
    le.setAmbientLight(10, 10, 10, 255);
    le.setLightColour(50, 170, 255);
    le.createPointLight(200, 200);
    player = le.getLight(0);
    player.setPosition(le.canvas.width / 2, le.canvas.height / 2);	
}

function loadBackground(texture) {
	for(var x = 0; x < (le.canvas.width / 50) + 1; x++) {
    	for(var y = 0; y < (le.canvas.height / 50) + 1; y++) {
    		var xx = x * 50, yy = y * 50;
			var faceSize = 50;
			var textureURL = texture;
			var isForeground = false;
			le.createSquare(xx, yy, faceSize, textureURL, isForeground);
		}
    }
}

function loadLevel(level) {
	var faceSize = 50;
	var textureURL = "img/brick.png";
	var isForeground;
	currentLevel++;
	for(var x = 0; x < 20; x++) {
		for(var y = 0; y < 12; y++) {
			if(level[y][x] == 1) {
				textureURL = "img/brick.png";
				isForeground = true;
				le.createSquare(x * 50, y * 50, faceSize, textureURL, isForeground);
			} else if(level[y][x] == 2) {
				var beacon = {
					x: x * 50,
					y: y * 50,
					faceSize: 50,
					textureURL: "img/beacon.png",
					lightLit: false,
					lightIndex: null,
					index: 0,
					pulse: {
						pulse: 40,
						pulseSwitch: false
					}
				};
				isForeground = false;
				le.createSquare(beacon.x, beacon.y, beacon.faceSize, beacon.textureURL, isForeground);
				beacon.index = le.foreground.length - 1;
				beacons.push(beacon);
				beaconsMaxLit++;
			} else if(level[y][x] == 3) {
				textureURL = "img/hidden-brick-door.png";
				isForeground = true;
				le.createSquare(x * 50, y * 50, faceSize, textureURL, isForeground);
				doors.push(le.foreground.length - 1);
			} else if(level[y][x] == 4) {
				textureURL = "img/stone-brick.png";
				isForeground = true;
				le.createSquare(x * 50, y * 50, faceSize, textureURL, isForeground);
			} else if(level[y][x] == 5) {
				textureURL = "img/hidden-stone-brick-door.png";
				isForeground = true;
				le.createSquare(x * 50, y * 50, faceSize, textureURL, isForeground);
				doors.push(le.foreground.length - 1);
			} else if(level[y][x] == 7) {
				textureURL = "img/hidden-stone-brick-door.png";
				isForeground = true;
				le.createSquare(x * 50, y * 50, faceSize, textureURL, isForeground);
				var door = {
					index: le.foreground.length - 1,
					movement: "vertical",
					originalX: x * 50,
					originalY: y * 50,
					toggle: false
				}
				movingDoors.push(door);
			} else if(level[y][x] == 8) {
				textureURL = "img/wood-wall.png";
				isForeground = true;
				le.createSquare(x * 50, y * 50, faceSize, textureURL, isForeground);
			} else if(level[y][x] == 9) {
				textureURL = "img/wood-door.png";
				isForeground = true;
				le.createSquare(x * 50, y * 50, faceSize, textureURL, isForeground);
				doors.push(le.foreground.length - 1);
			} else if(level[y][x] == 10) {
				textureURL = "img/wood-door.png";
				isForeground = true;
				le.createSquare(x * 50, y * 50, faceSize, textureURL, isForeground);
				var door = {
					index: le.foreground.length - 1,
					movement: "vertical",
					originalX: x * 50,
					originalY: y * 50,
					toggle: false
				}
				movingDoors.push(door);
			} else if(level[y][x] == 11) {
				textureURL = "img/wood-door.png";
				isForeground = true;
				le.createSquare(x * 50, y * 50, faceSize, textureURL, isForeground);
				var door = {
					index: le.foreground.length - 1,
					movement: "horizontal",
					originalX: x * 50,
					originalY: y * 50,
					toggle: false
				}
				movingDoors.push(door);
			}
		}
    }
}

function beaconLogic() {
	for(var i = 0; i < beacons.length; i++) {
		var beaconRange = 0;
		if(player.location.x >= beacons[i].x - beaconRange && player.location.x <= beacons[i].x + beacons[i].faceSize + beaconRange) {
			if(player.location.y >= beacons[i].y - beaconRange && player.location.y <= beacons[i].y + beacons[i].faceSize + beaconRange) {
				activateBeacon(i);
				if(soundMuted == false) {
					sounds.beaconActive.play();
				}
				if(currentLevel == 5 && beaconsLit == 2) {
					for(var d = 0; d < doors.length; d++) {
						le.getForeground(doors[d]).setPosition(-1000, -1000);
					}
					if(soundMuted == false) {
						sounds.doorOpen.play();
					}
				} else if(currentLevel == 6 && beaconsLit == 2) {
					le.getForeground(doors[0]).setPosition(-1000, -1000);
					le.getForeground(doors[1]).setPosition(-1000, -1000);
					if(soundMuted == false) {
						sounds.doorOpen.play();
					}
				} else if(currentLevel == 6 && beaconsLit == 3) {
					le.getForeground(doors[2]).setPosition(-1000, -1000);
					le.getForeground(doors[3]).setPosition(-1000, -1000);
					if(soundMuted == false) {
						sounds.doorOpen.play();
					}
				} else if(currentLevel == 7 && beaconsLit == 2) {
					le.getForeground(doors[2]).setPosition(-1000, -1000);
					le.getForeground(doors[4]).setPosition(-1000, -1000);
					if(soundMuted == false) {
						sounds.doorOpen.play();
					}
				} else if(currentLevel == 7 && beaconsLit == 3) {
					le.getForeground(doors[5]).setPosition(-1000, -1000);
					if(soundMuted == false) {
						sounds.doorOpen.play();
					}
				} else if(currentLevel == 7 && beaconsLit == 4) {
					le.getForeground(doors[1]).setPosition(-1000, -1000);
					le.getForeground(doors[3]).setPosition(-1000, -1000);
					if(soundMuted == false) {
						sounds.doorOpen.play();
					}
				} else if(currentLevel == 7 && beaconsLit == 5) {
					le.getForeground(doors[0]).setPosition(-1000, -1000);
					if(soundMuted == false) {
						sounds.doorOpen.play();
					}
				} else if(currentLevel == 8 && beaconsLit == 1) {
					le.getForeground(doors[1]).setPosition(-1000, -1000);
					le.getForeground(doors[2]).setPosition(-1000, -1000);
					if(soundMuted == false) {
						sounds.doorOpen.play();
					}
				} else if(currentLevel == 8 && beaconsLit == 2) {
					le.getForeground(doors[0]).setPosition(-1000, -1000);
					if(soundMuted == false) {
						sounds.doorOpen.play();
					}
				} else if(currentLevel == 8 && beaconsLit == 3) {
					le.getForeground(doors[3]).setPosition(-1000, -1000);
					if(soundMuted == false) {
						sounds.doorOpen.play();
					}
				} else if(currentLevel == 8 && beaconsLit == 4) {
					le.getForeground(doors[4]).setPosition(-1000, -1000);
					if(soundMuted == false) {
						sounds.doorOpen.play();
					}
				} else if(currentLevel == 9 && beaconsLit == 1) {
					le.getForeground(doors[3]).setPosition(-1000, -1000);
					if(soundMuted == false) {
						sounds.doorOpen.play();
					}
				} else if(currentLevel == 9 && beaconsLit == 2) {
					le.getForeground(doors[1]).setPosition(-1000, -1000);
					le.getForeground(doors[2]).setPosition(-1000, -1000);
					if(soundMuted == false) {
						sounds.doorOpen.play();
					}
				} else if(currentLevel == 9 && beaconsLit == 3) {
					le.getForeground(doors[0]).setPosition(-1000, -1000);
					if(soundMuted == false) {
						sounds.doorOpen.play();
					}
				} else if(currentLevel == 9 && beaconsLit == 4) {
					le.getForeground(doors[6]).setPosition(-1000, -1000);
					le.getForeground(doors[7]).setPosition(-1000, -1000);
					if(soundMuted == false) {
						sounds.doorOpen.play();
					}
				} else if(currentLevel == 9 && beaconsLit == 5) {
					le.getForeground(doors[8]).setPosition(-1000, -1000);
					if(soundMuted == false) {
						sounds.doorOpen.play();
					}
				} else if(currentLevel == 9 && beaconsLit == 6) {
					le.getForeground(doors[4]).setPosition(-1000, -1000);
					le.getForeground(doors[5]).setPosition(-1000, -1000);
					if(soundMuted == false) {
						sounds.doorOpen.play();
					}
				} else if(currentLevel == 10 && beaconsLit == 1) {
					le.getForeground(doors[0]).setPosition(-1000, -1000);
					if(soundMuted == false) {
						sounds.doorOpen.play();
					}
				} else if(currentLevel == 10 && beaconsLit == 2) {
					le.getForeground(doors[1]).setPosition(-1000, -1000);
					if(soundMuted == false) {
						sounds.doorOpen.play();
					}
				} else if(currentLevel == 10 && beaconsLit == 3) {
					le.getForeground(doors[3]).setPosition(-1000, -1000);
					le.getForeground(doors[4]).setPosition(-1000, -1000);
					if(soundMuted == false) {
						sounds.doorOpen.play();
					}
				} else if(currentLevel == 10 && beaconsLit == 4) {
					le.getForeground(doors[2]).setPosition(-1000, -1000);
					if(soundMuted == false) {
						sounds.doorOpen.play();
					}
				} else if(currentLevel == 11 && beaconsLit == 1) {
					le.getForeground(doors[1]).setPosition(-1000, -1000);
					if(soundMuted == false) {
						sounds.doorOpen.play();
					}
				} else if(currentLevel == 11 && beaconsLit == 2) {
					le.getForeground(doors[2]).setPosition(-1000, -1000);
					if(soundMuted == false) {
						sounds.doorOpen.play();
					}
				} else if(currentLevel == 11 && beaconsLit == 3) {
					le.getForeground(doors[0]).setPosition(-1000, -1000);
					if(soundMuted == false) {
						sounds.doorOpen.play();
					}
				} else if(currentLevel == 12 && beaconsLit == 2) {
					le.getForeground(doors[0]).setPosition(-1000, -1000);
					if(soundMuted == false) {
						sounds.doorOpen.play();
					}
				} else if(currentLevel == 12 && beaconsLit == 4) {
					le.getForeground(doors[1]).setPosition(-1000, -1000);
					if(soundMuted == false) {
						sounds.doorOpen.play();
					}
				} else if(currentLevel == 13 && beaconsLit == 4) {
					le.getForeground(doors[0]).setPosition(-1000, -1000);
					le.getForeground(doors[1]).setPosition(-1000, -1000);
					if(soundMuted == false) {
						sounds.doorOpen.play();
					}
				} else if(currentLevel == 14 && beaconsLit == 1) {
					le.getForeground(doors[2]).setPosition(-1000, -1000);
					if(soundMuted == false) {
						sounds.doorOpen.play();
					}
				} else if(currentLevel == 14 && beaconsLit == 2) {
					le.getForeground(doors[0]).setPosition(-1000, -1000);
					if(soundMuted == false) {
						sounds.doorOpen.play();
					}
				} else if(currentLevel == 14 && beaconsLit == 3) {
					le.getForeground(doors[1]).setPosition(-1000, -1000);
					if(soundMuted == false) {
						sounds.doorOpen.play();
					}
				} else if(currentLevel == 14 && beaconsLit == 4) {
					le.getForeground(doors[3]).setPosition(-1000, -1000);
					if(soundMuted == false) {
						sounds.doorOpen.play();
					}
				} else if(currentLevel == 15 && beaconsLit == 1) {
					le.getForeground(doors[1]).setPosition(-1000, -1000);
					if(soundMuted == false) {
						sounds.doorOpen.play();
					}
				} else if(currentLevel == 15 && beaconsLit == 3) {
					le.getForeground(doors[0]).setPosition(-1000, -1000);
					if(soundMuted == false) {
						sounds.doorOpen.play();
					}
				}
			}
		}
	}
}

function activateBeacon(index) {
	if(beacons[index].lightLit == false) {
	    le.setLightColour(Math.random() * 255, Math.random() * 255, Math.random() * 255);
	    le.createPointLight(beacons[index].x + beacons[index].faceSize / 2, beacons[index].y + beacons[index].faceSize / 2);
	    beacons[index].lightIndex = le.lights.length - 1;
	    beacons[index].lightLit = true;
	    beaconsLit++;
	   	score += Math.floor((countdownTimer / 60) * 5);
	}
}

function pulseBeacons() {
	for(var i = 0; i < beacons.length; i++) {
		if(beacons[i].lightIndex != null) {
			beacons[i].pulse = pulseLight(beacons[i].pulse.pulse, beacons[i].pulse.pulseSwitch, 20, 60);
			le.getLight(beacons[i].lightIndex).setIntensity(beacons[i].pulse.pulse);	
		}
	}
}

function pulsePlayer() {
	playerPulse = pulseLight(playerPulse.pulse, playerPulse.pulseSwitch, 20, 60);
	player.setIntensity(playerPulse.pulse);	
}

function pulseLight(pulse, pulseSwitch, min, max) {
	if(pulse >= max) {
		pulseSwitch = false;
	} else if(pulse <= min) {
		pulseSwitch = true;
	}
	if(pulseSwitch) {
		pulse+= 0.5;
	} else if(!pulseSwitch) {
		pulse-= 0.5;
	}
	return { pulse: pulse, pulseSwitch: pulseSwitch };
}

function checkKeys() {
	// Up
	if(levelStatus === "In Progress") {
		var moveSpeed = 5;
		if(keys[87]) {
			var amount = 10;
			if(checkCollision(false, amount)) {
				player.setPosition(player.location.x, player.location.y + moveSpeed);
			}
		}
		// Down
		if(keys[83]) {
			var amount = -10;
			if(checkCollision(false, amount - 1)) {
				player.setPosition(player.location.x, player.location.y - moveSpeed);
			}
		}
		// Left
		if(keys[65]) {
			var amount = -10;
			if(checkCollision(true, amount - 1)) {
				player.setPosition(player.location.x - moveSpeed , player.location.y);
			}
		}
		// Right
		if(keys[68]) {
			var amount = 10;
			if(checkCollision(true, amount)) {
				player.setPosition(player.location.x + moveSpeed, player.location.y);
			}
		}
	}

	if(keys[32]) {
		if(spaceToggle) {
			spaceToggle = false;
			if(levelStatus === "Menu") {
				if(soundMuted == false) {
					sounds.buttonPress.play();
				}
				levelStatus = "Started";
				newGame();
				cleanVariables();
				loadBackground("img/dirt-floor.png");
				loadLevel(level1);
			} else if(levelStatus === "In Progress") {
				beaconLogic();
			} else if(levelStatus === "Waiting") {
				if(soundMuted == false) {
					sounds.buttonPress.play();
				}
				levelStatus = "Started";
				cleanVariables();
				if(currentLevel == 1) {
					loadBackground("img/dirt-floor.png");
				    loadLevel(level2);
				} else if(currentLevel == 2) {
					loadBackground("img/dirt-floor.png");
				    loadLevel(level3);
				} else if(currentLevel == 3) {
					loadBackground("img/dirt-floor.png");
				    loadLevel(level4);
				} else if(currentLevel == 4) {
					loadBackground("img/dirt-floor.png");
				    loadLevel(level5);
				} else if(currentLevel == 5) {
					loadBackground("img/wood-plank-floor.png");
				    loadLevel(level6);
				} else if(currentLevel == 6) {
					loadBackground("img/wood-plank-floor.png");
				    loadLevel(level7);
				} else if(currentLevel == 7) {
					loadBackground("img/wood-plank-floor.png");
				    loadLevel(level8);
				} else if(currentLevel == 8) {
					loadBackground("img/wood-plank-floor.png");
				    loadLevel(level9);
				} else if(currentLevel == 9) {
					loadBackground("img/wood-plank-floor.png");
				    loadLevel(level10);
				} else if(currentLevel == 10) {
					loadBackground("img/grass.png");
				    loadLevel(level11);
				} else if(currentLevel == 11) {
					loadBackground("img/grass.png");
				    loadLevel(level12);
				} else if(currentLevel == 12) {
					loadBackground("img/grass.png");
				    loadLevel(level13);
				} else if(currentLevel == 13) {
					loadBackground("img/grass.png");
				    loadLevel(level14);
				} else if(currentLevel == 14) {
					loadBackground("img/grass.png");
				    loadLevel(level15);
				} else {
					levelStatus = "Won";
				}			
			} else if(levelStatus === "Game Over") {
				if(soundMuted == false) {
					sounds.buttonPress.play();
				}
				newGame();
			    cleanVariables();
			    loadBackground("img/dirt-floor.png");
			    loadLevel(level1);
			    levelStatus = "Started";
			} else if(levelStatus === "Won") {
				if(soundMuted == false) {
					sounds.buttonPress.play();
				}
				newGame();
			    cleanVariables();
			    loadLevel(menuLevel);
				levelStatus = "Menu";
			}
		}
	} else if(keys[32] == false) {
		spaceToggle = true;
	}
}

function checkCollision(axis, amount) {
	var dontMove = false;
	if(axis) {
		if(player.location.x + amount < 0 || player.location.x + amount >= le.canvas.width) {
			dontMove = true;
		}
	} else {
		if(player.location.y + amount < 0 || player.location.y + amount >= le.canvas.height) {
			dontMove = true;
		}
	}
	if(dontMove == false) {
		for(var i = 0; i < le.foreground.length; i++) {
			if(axis) {
				if(le.checkPointCollision(player.location.x + amount, player.location.y, le.getForeground(i))) {
					dontMove = true;
					break;
				}
			} else {
				if(le.checkPointCollision(player.location.x, player.location.y + amount, le.getForeground(i))) {
					dontMove = true;
					break;
				}
			}
		}
	}
	if(dontMove) {
		return false;
	} else {
		return true;
	}
}


// Get Mouse Position
function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
       	y: evt.clientY - rect.top
    };
}

function gameLogic() {
	checkKeys();
	if((countdownTimer > 0 && levelStatus == "In Progress") || levelStatus === "Started" || levelStatus === "Waiting") {
		if(levelStatus === "In Progress") {
			countdownTimer--;
		} 
		if(new Date().getTime() >= time + 1000) {
			if(levelStatus === "Started") {
				levelTimer--;
				if(levelTimer == -1) {
					levelStatus = "In Progress";
					time = new Date().getTime();
					if(soundMuted == false) {
						sounds.finalCountdown.play();
					}
				} else {
					if(soundMuted == false) {
						sounds.countdown.play();
					}
				}
			}
			time += 1000;
		}
		// Most of the logic is here
	} else if(countdownTimer <= 0) {
		levelStatus = "Game Over";
	} else if(levelStatus === "Complete") {
		if(ambientLightVal < 180) {
			ambientLightVal++;
		}
   		le.setAmbientLight(ambientLightVal, ambientLightVal, ambientLightVal, 255);
		if(new Date().getTime() >= levelCompleteTimer + 3000) {
			if(currentLevel == 15) {
				levelStatus = "Won";
			} else {
				levelStatus = "Waiting";
			}
		}
	}
}

function updateMovingDoors() {
	for(var i = 0; i < movingDoors.length; i++) {
		animateBlock(i);
	}
}

function animateBlock(i) {
	if(movingDoors[i].movement === "vertical") {
		var door = le.getForeground(movingDoors[i].index);
		if(movingDoors[i].originalY == door.y - 50) {
			movingDoors[i].toggle = true;
		} else if(movingDoors[i].originalY == door.y){
			movingDoors[i].toggle = false;
		}
		if(movingDoors[i].toggle) {
			door.setPosition(door.x, door.y-1);
		} else {
			door.setPosition(door.x, door.y+1);
		}
		checkDoorPlayerCollision(i);
	} else 	if(movingDoors[i].movement === "horizontal") {
		var door = le.getForeground(movingDoors[i].index);
		if(movingDoors[i].originalX == door.x - 50) {
			movingDoors[i].toggle = true;
		} else if(movingDoors[i].originalX == door.x){
			movingDoors[i].toggle = false;
		}
		if(movingDoors[i].toggle) {
			door.setPosition(door.x - 1, door.y);
		} else {
			door.setPosition(door.x + 1, door.y);
		}
		checkDoorPlayerCollision(i);
	}
}

function checkDoorPlayerCollision(i) {
	if(le.checkPointCollision(player.location.x, player.location.y, le.getForeground(movingDoors[i].index))) {
		levelStatus = "Game Over";
		if(soundMuted == false) {
			sounds.death.play();
		} else {
			sounds.death.volume = 0;
			sounds.death.play();
		}
		sounds.death.addEventListener("ended", function() {
        	sounds.death.currentTime = 0;
         	player.location.x = -1500;
         	player.location.y = -1500;
    	});
	}
}

function muteAllSound(ele) {
	ele.blur();
	if(soundMuted == false) {
		muteSound(0);	
		soundMuted = true;
	} else {
		muteSound(1);	
		soundMuted = false;
	}
}

function muteSound(val) {
	sounds.countdown.volume = val;
	sounds.finalCountdown.volume = val;
	sounds.beaconActive.volume = val;
	sounds.doorOpen.volume = val;
	sounds.levelComplete.volume = val;
	sounds.buttonPress.volume = val;
	sounds.death.volume = val;	
}

function pauseGame(ele) {
	ele.blur();
	if(gamePaused == false) {	
		gamePaused = true;
		timeTaken = time - new Date().getTime();
	} else {	
		gamePaused = false;
		time = new Date().getTime() + timeTaken;
	}
}

function gameHelp(ele) {
	ele.blur();
	alert("--Game Controls--\n" +
		"W A S D - To move\n" +
		"Spacebar - To power beacons\n\n" +
		"--Game Info--\n" +
		"Failing to activate all the beacons within the timer will kill you. " +
		"Also moving walls can squish (kill) you.");
}

/***
LOOP FUNCTIONS
***/
function update() {
	if(!gamePaused) {
		gameLogic();
		updateMovingDoors();
		if(beaconsLit === beaconsMaxLit && levelStatus === "In Progress") {
			levelStatus = "Complete";
			levelCompleteTimer = new Date().getTime();
			if(soundMuted == false) {
				sounds.levelComplete.play();
			}
		}
	}
	if(levelStatus === "Game Over") {
		player.setIntensity(player.intensity - 0.6);	
	} else {
		pulsePlayer();
	}
	pulseBeacons();
	le.update();
	render();
	requestAnimationFrame(update);	
}

function render() {
	le.render();
	if(levelStatus != "Menu") {
		fr.drawString("Time: " + Math.floor(countdownTimer / 60), 0, 25, 256, 32);
		fr.drawString("Score: " + score, le.canvas.width / 2 - 100, 25, 256, 32);
		fr.drawString("Beacons Lit: " + beaconsLit + "/" + beaconsMaxLit, le.canvas.width - 250, 25, 256, 32);
	}

	if(levelStatus === "Game Over") {
		fr.drawString("Game Over", le.canvas.width / 2 - 80, le.canvas.height / 2 - 20, 256, 32);
		fr.drawString("Press Space to start again!", le.canvas.width / 2 - 200, le.canvas.height / 2 + 45, 1024, 32);
	} else if(levelStatus === "Menu") {
		fr.setFontSize(80);
		fr.drawString("Shadows", le.canvas.width / 2 - 180, le.canvas.height / 3 * 2 - 60, 1024, 256);
		fr.setFontSize(30);
		fr.drawString("Press Space to start!", le.canvas.width / 2 - 155, le.canvas.height / 2 + 150, 1024, 32);
	} else if(levelStatus === "Started") {
		if(currentLevel >= 10) {
			fr.drawString("Level " + currentLevel, le.canvas.width / 2 - 60, le.canvas.height / 2 - 20, 256, 32);
		} else {
			fr.drawString("Level " + currentLevel, le.canvas.width / 2 - 50, le.canvas.height / 2 - 20, 256, 32);
		}
		fr.drawString("Starting in " + levelTimer, le.canvas.width / 2 - 90, le.canvas.height / 2 + 45, 256, 32);
	} else if(levelStatus === "Complete") {
		fr.drawString("Level Complete!", le.canvas.width / 2 - 110, le.canvas.height / 2, 256, 32);
	} else if(levelStatus === "Waiting") {
		fr.drawString("Press Space to start the next level!", le.canvas.width / 2 - 260, le.canvas.height / 2, 1024, 32);
	} else if(levelStatus === "Won") {
		fr.drawString("You have finished the game!", le.canvas.width / 2 - 220, le.canvas.height / 2 - 40, 1024, 32);
		fr.drawString("Your Final Score: " + score, le.canvas.width / 2 - 180, le.canvas.height / 2 + 5, 1024, 32);
		fr.drawString("Press Space for the Menu", le.canvas.width / 2 - 200, le.canvas.height / 2 + 55, 1024, 32);
	}
}