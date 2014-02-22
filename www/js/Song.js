/**
 * 
 */

(function (window) {
	
	function Song(songData) {
		this.name = songData.name;
		this.pos = {};
		this.datas = {};
		this.defaultRole;
		var i = 0;
		for (var role in songData.roles) {
			if (i++ === 0) {
				this.defaultRole = role;
			}
			this.pos[role] = 0;
			this.datas[role] = songData.roles[role].data;
		}
	}
	
	Song.prototype.getNextSourceId = function(role) {
		role = role || this.defaultRole;
		var data = this.datas[role];
		var pos = (this.pos[role]++) % data.length;
		return this.name + "-" + role + "-" + data[pos];
	};
	
	Song.prototype.rewind = function() {
		for (var role in this.pos) {
			this.pos[role] = 0;
		}
	};
	
	window.Song = Song;
})(window);