var b2Vec2 = Box2D.Common.Math.b2Vec2;
var b2BodyDef = Box2D.Dynamics.b2BodyDef;
var b2Body = Box2D.Dynamics.b2Body;
var b2FixtureDef = Box2D.Dynamics.b2FixtureDef;
var b2Fixture = Box2D.Dynamics.b2Fixture;
var b2World = Box2D.Dynamics.b2World;
var b2MassData = Box2D.Collision.Shapes.b2MassData;
var b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape;
var b2CircleShape = Box2D.Collision.Shapes.b2CircleShape;
var b2DebugDraw = Box2D.Dynamics.b2DebugDraw;
var b2Transform = Box2D.Common.Math.b2Transform;
var b2Mat22 = Box2D.Common.Math.b2Mat22;

// Global Variables
var physics, lastFrame = new Date().getTime();
var maxBodyCount = 14;

var NOTE_TYPES = ["C", "Cs", "D", "Ds", "E", "F", "Fs", "G", "Gs", "A", "As",
		"B"];
var sounds = [];
var kick;
var INSTRUMENTS = ["piano", "guitar", "violin", "flute"];
var SONGS_DATA = [{
	"name" : "edelweiss",
	"roles" : {
		"bell" : {
			numOfNotes : 17,
			data : [8, 4, 17, 10, 4, 12, 8, 2, 2, 3, 4, 14, 13, 8, 4, 17, 10,
					4, 12, 8, 4, 4, 5, 6, 16, 16, 11, 1, 1, 6, 5, 4, 8, 4, 16,
					9, 7, 11, 7, 15, 13, 8, 4, 17, 10, 4, 12, 8, 4, 4, 5, 6,
					16, 16]
		},
		"flute" : {
			numOfNotes : 17,
			data : [8, 4, 17, 10, 4, 12, 8, 2, 2, 3, 4, 14, 13, 8, 4, 17, 10,
					4, 12, 8, 4, 4, 5, 6, 16, 16, 11, 1, 1, 6, 5, 4, 8, 4, 16,
					9, 7, 11, 7, 15, 13, 8, 4, 17, 10, 4, 12, 8, 4, 4, 5, 6,
					16, 16]
		},
		"piano" : {
			numOfNotes : 30,
			data : [5, 18, 18, 2, 19, 19, 5, 18, 18, 1, 20, 20, 5, 18, 18, 5,
					18, 18, 1, 20, 20, 2, 19, 19, 5, 21, 18, 2, 19, 19, 5, 18,
					18, 1, 20, 20, 5, 18, 18, 2, 19, 19, 5, 18, 18, 22, 23, 24,
					25, 26, 27, 7, 10, 12, 10, 12, 10, 7, 10, 12, 10, 12, 10,
					8, 10, 13, 10, 13, 10, 8, 10, 13, 10, 13, 15, 6, 9, 11, 9,
					11, 9, 7, 9, 11, 9, 11, 9, 7, 10, 12, 10, 12, 10, 7, 10,
					12, 14, 16, 17, 5, 18, 18, 2, 19, 19, 5, 18, 18, 1, 20, 20,
					8, 10, 13, 10, 13, 10, 3, 4, 7, 4, 7, 4, 6, 8, 10, 13, 10,
					8, 6, 3, 28, 29, 30]
		}
	}
}];
var songs = {};
var currentSetting = {
	instrument : "piano"
};
var currentInstruKeys = "piano";
var RAND_NOTES = ["4C", "4D", "4E", "4G", "4A", "5C", "5D", "5E", "5G", "5A"];
var keyboard;
var currentScale;
var currentFrequency = 256;
var canvasW;
var canvasH;

// Createjs
var stage;
var queue;

window.onerror = function(error) {
	alert(error);
};

window.addEventListener("touchmove", function(e) {
	e.preventDefault();
});

window.gameLoop = function() {
	var tm = new Date().getTime();
	requestAnimationFrame(gameLoop);
	var dt = (tm - lastFrame) / 1000;
	if (dt > 1 / 15) {
		dt = 1 / 15;
	}
	stage.update();
	physics.step(dt);
	lastFrame = tm;
};

window.addEventListener("load", init);

function init() {

	var pgbar = $("#loadingProgressbar");
	var pgLabel = $("#progressLabel");
	pgbar.progressbar({
		value : false,
		change : function() {
			pgLabel.text(pgbar.progressbar("value") + "%");
		},
		complete : function() {
			onload();
		}

	});

	var resList = [{
		id : "noteCrystalImg",
		src : "assets/imgs/note-crystal.png"
	}];

	// Load instruments audio files
	for (var k = 0; k < INSTRUMENTS.length; k++) {
		var instrument = INSTRUMENTS[k];
		for (var i = 4; i <= 5; i++) {
			for (var j = 0; j < NOTE_TYPES.length; j++) {
				resList.push({
					id : instrument + i + NOTE_TYPES[j],
					src : "assets/" + instrument + "/" + i + NOTE_TYPES[j]
							+ ".mp3"
				});
			}
		}
	}

	// load songs audio files
	for (var l = 0; l < SONGS_DATA.length; l++) {
		var songData = SONGS_DATA[l];
		var name = songData.name;
		var roles = songData.roles;
		for ( var role in roles) {
			for (var m = 0; m < roles[role].numOfNotes; m++) {
				resList.push({
					id : name + "-" + role + "-" + (m + 1),
					src : "assets/song/" + name + "/" + role + "/" + (m + 1)
							+ ".mp3"
				});
			}
		}
		songs[name] = new Song(songData);
	}

	// alert("!");

	// test();

	queue = new createjs.LoadQueue(false);
	queue.installPlugin(createjs.Sound);
	queue.addEventListener("progress", function(e) {
		pgbar.progressbar("value", Math.round(e.progress * 100));
	});
	queue.loadManifest(resList);
	queue.load();

}

function test() {

	var pythagIntervals = new PythagoreanScale(528).buildIntervals();
	var dodecaIntervals = new DodecaphonicScale(528).buildIntervals();
	var evenIntervals = new EvenTemperedScale(528).buildIntervals();
	var meanIntervals = new MeantoneScale(528).buildIntervals();
	var ptoIntervals = new PtolemyScale(528).buildIntervals();
	var zarIntervals = new ZarlinoScale(528).buildIntervals();

	console.log("Pythagorean Scale:" + pythagIntervals);
	console.log("Dodecaphonic Scale:" + dodecaIntervals);
	console.log("EvenTempered Scale:" + evenIntervals);
	console.log("Meantone Scale:" + meanIntervals);
	console.log("Ptolemy Scale:" + ptoIntervals);
	console.log("Zarlino Scale:" + zarIntervals);
}

function onload() {

	createjsInit();
	box2dInit();
	audioInit();
	uiInit();

	requestAnimationFrame(gameLoop);

};

function createjsInit() {
	stage = new createjs.Stage("myCanvas");
}

function box2dInit() {
	var canvas = document.getElementById("myCanvas");
	physics = new Physics(canvas);
	canvasW = canvas.width;
	canvasH = canvas.height;

	// physics.debug();

	var canvasWidth = physics.element.width;
	var canvasHeight = physics.element.height;

	// top
	new Body(physics, {
		color : "#e5e5e5",
		type : "static",
		x : canvasWidth / 2,
		y : -20,
		height : 20,
		width : canvasWidth
	});

	// buttom
	new Body(physics, {
		color : "#e5e5e5",
		type : "static",
		x : canvasWidth / 2,
		y : canvasHeight + 20,
		height : 20,
		width : canvasWidth
	});

	// left wall
	new Body(physics, {
		color : "#e5e5e5",
		type : "static",
		x : -10,
		y : canvasHeight / 2,
		height : 1000,
		width : 20
	});

	// right wall
	new Body(physics, {
		color : "#e5e5e5",
		type : "static",
		x : canvasWidth + 10,
		y : canvasHeight / 2,
		height : 1000,
		width : 20
	});
}

function audioInit() {

	if (touchable()) {

		physics.element.addEventListener("touchstart", function(e) {
			e.preventDefault();

			playWithSetting(currentSetting, e.touches.length);

			var touches = e.touches;
			for (var i = 0; i < touches.length; i++) {

				var offset = $("#myCanvas").offset();

				var posX = touches[i].clientX - offset.left;
				var posY = touches[i].clientY - offset.top;

				createNote(posX, posY);
				generateNoteEffect(posX, posY);
			}

		});
	}

	physics.element.addEventListener("click", function(e) {
		e.preventDefault();

		playWithSetting(currentSetting);

		createNote(e.offsetX, e.offsetY);
		generateNoteEffect(e.offsetX, e.offsetY);
	});

	var littleStar = ["4C", "4C", "4G", "4G", "4A", "4A", "4G"];
	var litterStarPos = 0;

	window.addEventListener("shake", function() {
		// sounds[littleStar[litterStarPos++ % littleStar.length] - 1].play();

		// createjs.Sound.play(currentInstruHome+ (littleStar[litterStarPos++ %
		// littleStar.length]));
		playWithSetting(currentSetting);

	});
}

function uiInit() {

	$.mobile.changePage("#homePage");

	currentScale = new PythagoreanScale();
	var intervals = currentScale.buildIntervals(256);

	keyboard = new Keyboard(800, 300, intervals, function(i) {
		var octave = Math.floor(i / 12);
		createjs.Sound.play(currentInstruKeys + (4 + octave)
				+ NOTE_TYPES[i % 12]);
	});

	keyboard.playMode = keyboard.SAMPLE;

	$("#kbContainer").append(keyboard.init());

	$("#leftPanelHome")
			.append(
					"<ul id='songChooser' ><li id='songLabel' data-role='list-divider'>Song</li>"
							+ "<li><select id='song-selector' name='select-1'></select></li></ul>");

	$("#songChooser").listview({
		inset : true,
		dividerTheme : "d"
	});

	for ( var name in songs) {
		var options = "";
		for ( var role in songs[name].datas) {
			options += "<option value='" + name + "-" + role + "'>" + role
					+ "</option>";
		}
		$("#song-selector").append(
				"<optgroup label=" + name[0].toUpperCase() + name.substr(1)
						+ ">" + options + "</optgroup>");

	}

	$("#song-selector").selectmenu();
	$("#song-selector").selectmenu("disable");

	$("#leftPanelHome").panel({
		display : "push"
	});

	$("#song-selector").change(function() {
		var values = this.value.split("-");
		currentSetting.song = {
			name : values[0],
			role : values[1]
		};

		// alert(this.value);
	});

	$('#instrumentBtnsHome input').click(
			function() {
				if (this.value === "songs") {
					$("#songLabel").text(
							"Song: " + SONGS_DATA[0].name[0].toUpperCase()
									+ SONGS_DATA[0].name.substr(1));
					var songSelector = $("#song-selector");
					songSelector.selectmenu("enable");
					var values = songSelector.val().split("-");
					currentSetting.song = {
						name : values[0],
						role : values[1]
					};
				} else {
					$("#song-selector").selectmenu("disable");
					currentSetting.song = null;
					for ( var s in songs) {
						songs[s].rewind();
					}
					currentSetting.instrument = this.value;
				}
				// alert(this.value);
			});

	$('#leftPanelHome').trigger("updatelayout");

	$("#scale-selector").selectmenu();
	$("#type-selector").selectmenu();
	$("#scale-selector").selectmenu("disable");
	$("#type-selector").selectmenu("disable");
	

	$('#instrumentBtnsKeys input').click(function() {
		if (this.value === "synthesizer") {
			keyboard.playMode = keyboard.SYNTHESIZE;
			$("#scale-selector").selectmenu("enable");
			$("#type-selector").selectmenu("enable");
			$("#frequency-slider").slider("enable");
		} else {
			currentInstruKeys = this.value;
			keyboard.playMode = keyboard.SAMPLE;
			$("#scale-selector").selectmenu("disable");
			$("#type-selector").selectmenu("disable");
			$("#frequency-slider").slider("disable");
		}
		// alert(this.value);
	});

	// TODO
	$("#scale-selector").change(
			function() {
				var scale = this.value;
				if (scale === "pythagorean") {
					currentScale = new PythagoreanScale();
				} else if (scale === "dodecaphonic") {
					currentScale = new DodecaphonicScale();
				} else if (scale === "eventempered") {
					currentScale = new EvenTemperedScale();
				} else if (scale === "ptolemy") {
					currentScale = new PtolemyScale();
				}
				keyboard.intervals = currentScale.buildIntervals($(
						"#frequency-slider").val());
				console.log(keyboard.intervals);
				// alert(this.value);
			});

	$("#type-selector").change(function() {
		keyboard.oscillatorType = parseInt(this.value);
	});


	$("#frequency-slider").on("slidestop", function() {
		keyboard.baseFrequency = parseInt(this.value);
		keyboard.intervals = currentScale.buildIntervals(keyboard.baseFrequency);
	});

}

function playWithSetting(setting, fingerNumber) {
	if (setting.song) {
		playSong(setting.song.name, setting.song.role);
	} else {
		if (!fingerNumber) {
			fingerNumber = Math.floor(Math.random() * 3 + 1);
			for (var i = 0; i < fingerNumber - 1; i++) {
				var posX = Math.random() * canvasW, posY = Math.random()
						* canvasH;
				createNote(posX, posY);
				generateNoteEffect(posX, posY);
			}
		}

		var instrument = setting.instrument || "piano";
		playRandom(fingerNumber, instrument);
	}
}

function playSong(name, role) {
	createjs.Sound.play(songs[name].getNextSourceId(role));
}

// TODO
function playRandom(fingerN, instrument) {
	var len = RAND_NOTES.length;
	var index = Math.floor(Math.random() * len);
	switch (fingerN) {
		case 1 :
			createjs.Sound.play(instrument + RAND_NOTES[index]);
			break;
		case 2 :
			createjs.Sound.play(instrument + RAND_NOTES[index]);
			createjs.Sound.play(instrument
					+ RAND_NOTES[randOffset(index, len, Math.random() > 0.5)]);
			break;
		case 3 :
			createjs.Sound.play(instrument + RAND_NOTES[index]);
			createjs.Sound
					.play(instrument + RAND_NOTES[randOffset(index, len)]);
			createjs.Sound.play(instrument
					+ RAND_NOTES[randOffset(index, len, true)]);
			break;
	}

}

function randOffset(index, length, downward) {
	var offset = Math.floor(Math.random() * 2) + 2;
	if (downward) {
		index -= offset;
		index = index < 0 ? index + length : index;
	} else {
		index = (index + offset) % length;
	}
	return index;

}

function createNote(posX, posY) {

	if (physics.world.GetBodyCount() < maxBodyCount) {

		var noteBody;

		if (touchable()) {
			noteBody = new Body(physics, {
				image : queue.getResult("noteCrystalImg"),
				width : 20,
				height : 35,
				shape : "circle",
				radius : 17.5,
				x : posX,
				y : posY,
				restitution : 0.7,
				life : 100
			}).body;

		} else {
			noteBody = new Body(physics, {
				id : "note",
				image : queue.getResult("noteCrystalImg"),
				width : 20,
				height : 35,
				shape : "polygon",
				x : posX,
				y : posY,
				restitution : 0.7,
				points : getNotePoints(),
				life : 100
			}).body;
		}

		noteBody.ApplyImpulse({
			x : Math.random() * 8 - 4,
			y : Math.random() * (-8)
		}, noteBody.GetWorldCenter());

	}

}

function generateNoteEffect(posX, posY, frequency) {

	var ls = [];
	var radius = 512 / (frequency || (Math.random() * 768 + 256)) * 100;
	var f = function(n) {
		return Math.floor(Math.random() * n);
	};

	for (var i = 0; i < 4; i++) {
		ls[i] = new createjs.Shape();
		ls[i].x = posX;
		ls[i].y = posY;
		ls[i].graphics.beginStroke(
				"rgb(" + f(255) + "," + f(255) + ", " + f(255) + ")")
				.drawCircle(0, 0, radius);
		stage.addChild(ls[i]);
	}

	createjs.Tween.get(ls[0]).to({
		scaleX : 0,
		alpha : 0.5
	}, 1000).to({
		scaleX : 1,
		alpha : 0
	}, 1000).call(function() {
		stage.removeChild(ls[0]);
	});

	createjs.Tween.get(ls[1]).to({
		scaleY : 0,
		alpha : 0.5
	}, 1000).to({
		scaleY : 1,
		alpha : 0
	}, 1000).call(function() {
		stage.removeChild(ls[1]);
	});

	createjs.Tween.get(ls[2]).to({
		skewX : Math.random() > 0.5 ? 360 : -360,
		alpha : 0
	}, 2000).call(function() {
		stage.removeChild(ls[2]);
	});

	createjs.Tween.get(ls[3]).to({
		skewY : Math.random() > 0.5 ? 360 : -360,
		alpha : 0
	}, 2000).call(function() {
		stage.removeChild(ls[3]);
	});

}

function getNotePoints() {
	var points = [];
	var a = [[18, 70 - 22], [18, 70 - 69], [24, 70 - 69], [38, 70 - 46],
			[40, 70 - 20], [35, 70 - 10], [30, 70 - 13], [33, 70 - 26],
			[29, 70 - 32], [23, 70 - 37], [24, 70 - 7], [18, 70 - 2],
			[10, 70 - 0], [3, 70 - 2], [1, 70 - 8], [3, 70 - 14], [9, 70 - 19]];
	for ( var i in a) {
		points.push({
			x : a[i][0] / 2 - 10,
			y : a[i][1] / 2 - 17.5
		});
	}
	return points;
}

function getAudioContext() {
	var audioContext;
	audioContext = window.AudioContext || window.webkitAudioContext;
	return new audioContext();
}

function touchable() {
	return 'createTouch' in document;
}

//
(function() {
	var lastTime = 0;
	var vendors = ['ms', 'moz', 'webkit', 'o'];
	for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
		window.requestAnimationFrame = window[vendors[x]
				+ 'RequestAnimationFrame'];
		window.cancelAnimationFrame = window[vendors[x]
				+ 'CancelAnimationFrame']
				|| window[vendors[x] + 'CancelRequestAnimationFrame'];
	}

	if (!window.requestAnimationFrame) {
		window.requestAnimationFrame = function(callback, element) {
			var currTime = new Date().getTime();
			var timeToCall = Math.max(0, 16 - (currTime - lastTime));
			var id = window.setTimeout(function() {
				callback(currTime + timeToCall);
			}, timeToCall);
			lastTime = currTime + timeToCall;
			return id;
		};
	}

	if (!window.cancelAnimationFrame) {
		window.cancelAnimationFrame = function(id) {
			clearTimeout(id);
		};
	}
}());
