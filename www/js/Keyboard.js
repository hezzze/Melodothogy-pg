/**
 * 
 */
(function(window) {

	var SINE = 0;
	var SQUARE = 1;
	var SAWTOOTH = 2;
	var TRIANGLE = 3;
	
	function Keyboard(width, height, intervals, callback) {
	
		this.intervals = intervals;
		this.oscillatorType = SINE;
		this.baseFrequency = 256;
		if (!intervals || !(intervals instanceof Array)
				|| !(intervals.length === 12))
			throw Error("Illegal intervals");
		var synths = [];
		var element;
		var keys = [];
		var numOfOctaves = 2;
		var keysPerOctave = 12;
		var numOfKeys = numOfOctaves * keysPerOctave;
		var whiteKeyWidth = width / numOfOctaves / 7;
		var whiteKeyHeight = height;
		var blackKeyWidth = whiteKeyWidth / 2;
		var blackKeyHeight = whiteKeyHeight * 0.6;
		var audioContext = getAudioContext();

		var playNote = function(self, i) {
			if (self.playMode === self.SYNTHESIZE || !callback) {
				var octave = Math.floor(i / 12);
				synths[i].play(self.intervals[i % 12] * Math.pow(2, octave), self.oscillatorType);
			} else {
				callback(i);
			}
		};

		var stopNote = function(self, i) {
			if (self.playMode === self.SYNTHESIZE || !callback) {
				synths[i].stop();
			}
		};

		var addEventListenersToKey = function(self, key, i, data) {
			key.addEventListener("mousedown", function(e) {
				e.preventDefault();
				e.target.style.backgroundColor = data.pushed;
				playNote(self, i);
			});

			key.addEventListener("mouseout", function(e) {
				e.preventDefault();
				e.target.style.backgroundColor = data.normal;
				stopNote(self, i);
			});

			key.addEventListener("mouseup", function(e) {
				e.preventDefault();
				e.target.style.backgroundColor = data.normal;
				stopNote(self, i);
			});

			if ('createTouch' in document) {
				key.addEventListener("touchstart", function(e) {
					e.preventDefault();
					e.target.style.backgroundColor = data.pushed;
					playNote(self, i);
				});

				key.addEventListener("touchend", function(e) {
					e.preventDefault();
					e.target.style.backgroundColor = data.normal;
					stopNote(self, i);
				});
			}
		};

		this.SYNTHESIZE = "synth";
		this.SAMPLE = "sample";
		this.playMode = "synth";

		this.init = function() {
			for (var k = 0; k < numOfKeys; k++) {
				synths[k] = new Synth(audioContext);
			}

			element = document.createElement("div");
			element.style.width = width + 'px';
			element.style.height = height + 'px';
			element.style.position = "relative";

			for (var i = 0; i < numOfKeys; i++) {

				switch (i % 12) {
					case 0 :
					case 2 :
					case 4 :
					case 5 :
					case 7 :
					case 9 :
					case 11 :
						keys[i] = document.createElement('div');
						$(element).append(keys[i]);
						$(keys[i]).attr(
								{
									style : "position: absolute; "
											+ "display: inline-block; "
											+ "background-color: white; "
											+ "width: " + whiteKeyWidth + "px;"
											+ "height: " + whiteKeyHeight
											+ "px;" + "border: 2px solid #000;"
								});
						$(keys[i]).css(
								"left",
								Math.ceil(i % 12 / 2) * whiteKeyWidth
										+ Math.floor(i / 12) * 7
										* whiteKeyWidth);
						addEventListenersToKey(this, keys[i], i, {
							normal : "white",
							pushed : "yellow"
						});

				}
			}

			for (i = 0; i < numOfKeys; i++) {

				switch (i % 12) {
					case 1 :
					case 3 :
					case 6 :
					case 8 :
					case 10 :
						keys[i] = document.createElement('div');
						$(element).append(keys[i]);
						$(keys[i]).attr(
								{
									style : "position: absolute; "
											+ "display: inline-block; "
											+ "background-color: black; "
											+ "width: " + blackKeyWidth + "px;"
											+ "height: " + blackKeyHeight
											+ "px;"
								});
						$(keys[i]).css(
								"left",
								(Math.floor(i % 12 / 2) + 1) * whiteKeyWidth
										- blackKeyWidth / 2
										+ Math.floor(i / 12) * 7
										* whiteKeyWidth);
						addEventListenersToKey(this, keys[i], i, {
							normal : "black",
							pushed : "yellow"
						});

				}
			}
			return element;
		};

		this.element = element;

	}

	function getAudioContext() {
		var audioContext;
		try {
			audioContext = window.AudioContext || window.webkitAudioContext;
		} catch (e) {
			alert("Web Audio API is not supported in this browser...");
		}
		return new audioContext();
	}

	window.Keyboard = Keyboard;
})(window);
