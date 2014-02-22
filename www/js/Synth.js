/**
 * 
 */

(function(window) {

	function Synth(context) {
		this.context = context;
		this.isPlaying = false;

		try {
			var vco = context.createOscillator();
			vco.type = vco.SINE;

			var vca = context.createGain();
			vca.gain.value = 0;

			vco.connect(vca);
			vca.connect(context.destination);

			// this.vco = vco;
			// this.vca = vca;

			this.play = function(frequency, type) {
				if (type !== null) {
					vco.type = type; 
				}
				vco.frequency.value = frequency;
				vco.start(0);
				vca.gain.value = 0.5;
				this.isPlaying = true;
			};

			this.stop = function() {
				vca.gain.value = 0;
				this.isPlaying = false;
			};

		} catch (err) {
			alert(err.message);
		}

	}

	window.Synth = Synth;

})(window);