/**
 * NYU 2013 Fall CSCI-GA 3303 Music Software Project course work Translated from
 * the Java File MusicScale.java
 * 
 * Using John Resig's simple JavaScript inheritance. Some overloading function
 * calls in super class are achieved by manually calling the corresponding
 * overloaded version
 */

var MusicalScale = Class
		.extend({
			init : function(fundamental) {
				this.DEFAULT_FUNDAMENTAL = 256;
			},

			getFactor : function(intervalNumber) {
				return this.getNumerator(intervalNumber)
						/ this.getDenominator(intervalNumber);
			},

			getFrequencyFinal : function(fundamental, intervalNumber) {
				var factor = this.getFactor(intervalNumber);
				var octave = Math.log(factor) / Math.log(2);
				octave = (octave >= 0) ? Math.floor(octave) : -Math
						.floor(-octave + 1);
				var octaveDenomFactor = Math.pow(2, octave);
				var factorAdjusted = factor / octaveDenomFactor;
				return (fundamental || this.DEFAULT_FUNDAMENTAL)
						* factorAdjusted;
			},

			buildIntervals : function(fundamental, startInterval, numOfInterval) {
				var intervals = [];
				for (var i = 0; i < numOfInterval; i++) {
					intervals.push(this.getFrequencyFinal(fundamental,
							startInterval++));
				}
				return intervals;
			}

		});

var PythagoreanScale = MusicalScale.extend({
	START_INTERVAL : -1,
	NUMBER_OF_INTERVALS : 13,
	DISCARDED_INTERVAL_INDEX : 6,

	getNumerator : function(intervalNumber) {
		if (intervalNumber < 0) {
			return this.getDenominatorHelper(-intervalNumber);
		}
		return Math.floor(Math.pow(3, intervalNumber));
	},

	getDenominatorHelper : function(intervalNumber) {
		return Math.floor(Math.pow(2, intervalNumber));
	},

	getDenominator : function(intervalNumber) {
		if (intervalNumber < 0) {
			return this.getNumeratorHelper(-intervalNumber);
		}
		return Math.floor(Math.pow(2, intervalNumber));
	},

	getNumeratorHelper : function(intervalNumber) {
		return Math.floor(Math.pow(3, intervalNumber));
	},

	buildIntervals : function(fundamental) {
		// Manually calling the base class's version, since the simple
		// inheritance
		// model doesn't support overloading super class functions
		var intervals = MusicalScale.prototype.buildIntervals.call(this,
				(fundamental || this.DEFAULT_FUNDAMENTAL), this.START_INTERVAL,
				this.NUMBER_OF_INTERVALS);
		intervals.sort(function(a, b) {
			return a - b;
		});
		intervals.splice(this.DISCARDED_INTERVAL_INDEX, 1);
		return intervals;

	}

});

var DodecaphonicScale = PythagoreanScale.extend({
	START_INTERVAL : -6,
	NUMBER_OF_INTERVALS : 13
});

var EvenTemperedScale = MusicalScale.extend({

	START_INTERVAL : 0,
	NUMBER_OF_INTERVALS : 12,

	getFactor : function(intervalNumber) {
		return Math.pow(2, 1 / 12 * intervalNumber);
	},

	buildIntervals : function(fundamental) {
		return MusicalScale.prototype.buildIntervals.call(this, fundamental,
				this.START_INTERVAL, this.NUMBER_OF_INTERVALS);
	}
});

var MeantoneScale = DodecaphonicScale.extend({

	START_INTERVAL : -6,
	NUMBER_OF_INTERVALS : 17,

	getFactor : function(intervalNumber) {
		return this._super(intervalNumber)
				* Math.pow(80 / 81, intervalNumber / 4);
	},

	buildIntervals : function(fundamental) {
		var intervals = MusicalScale.prototype.buildIntervals.call(this,
				fundamental, this.START_INTERVAL, this.NUMBER_OF_INTERVALS);
		intervals.sort(function(a, b) {
			return a - b;
		});
		return intervals;
	}

});

var PtolemyScale = DodecaphonicScale.extend({

	START_INTERVAL : -6,
	NUMBER_OF_INTERVALS : 13,

	ADJUSTMENTS : ["NONE", "SHARPEN", "SHARPEN", "SHARPEN", "NONE", "NONE",
			"NONE", "NONE", "NONE", "FLATTEN", "FLATTEN", "FLATTEN", "CHOSEN"],
	SYNTONIC_COMMA : 81 / 80,
	CHOSEN_DIMINISHED : 64 / 45,

	getFactor : function(intervalNumber) {
		var adjustment = 1;
		switch (this.ADJUSTMENTS[(intervalNumber - this.START_INTERVAL)
				% this.NUMBER_OF_INTERVALS]) {
			case "SHARPEN" :
				adjustment = this.SYNTONIC_COMMA;
				break;
			case "FLATTEN" :
				adjustment = 1 / this.SYNTONIC_COMMA;
				break;
			case "CHOSEN" :
				return this.CHOSEN_DIMINISHED;
			default :
				;
		}
		return this._super(intervalNumber) * adjustment;
	}
});

var ZarlinoScale = MusicalScale.extend({
	START_INTERVAL : 0,
	NUMBER_OF_INTERVALS : 9,

	getFactor : function(intervalNumber) {
		var octave = Math.floor(intervalNumber / 7);
		var factor = 1;
		switch (intervalNumber % 7) {
			case 0 :
				factor = 1;
				break;
			case 1 :
				factor = 9 / 8;
				break;
			case 2 :
				factor = 5 / 4;
				break;
			case 3 :
				factor = 4 / 3;
				break;
			case 4 :
				factor = 3 / 2;
				break;
			case 5 :
				factor = 5 / 3;
				break;
			case 6 :
				factor = 15 / 8;
				break;
			default :
				factor = 1;
		}
		return factor * Math.pow(2, octave);
	},

	buildIntervals : function(fundamental) {
		var intervals = MusicalScale.prototype.buildIntervals.call(this,
				fundamental, this.START_INTERVAL, this.NUMBER_OF_INTERVALS);

		return intervals;
	}

});

var RameauScale = ZarlinoScale;
