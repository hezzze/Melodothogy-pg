/**
 * 
 */
(function(window) {

	function Body(physics, details) {
		this.details = details = details || {};

		// Create the definition
		this.definition = new b2BodyDef();

		// Set up the definition
		for ( var k in this.definitionDefaults) {
			this.definition[k] = details[k] || this.definitionDefaults[k];
		}
		this.definition.position = new b2Vec2(details.x / physics.scale || 0,
				details.y / physics.scale || 0);
		this.definition.linearVelocity = new b2Vec2(details.vx / physics.scale
				|| 0, details.vy / physics.scale || 0);
		this.definition.userData = this;
		this.definition.type = details.type == "static"
				? b2Body.b2_staticBody
				: b2Body.b2_dynamicBody;

		// Create the Body
		this.body = physics.world.CreateBody(this.definition);

		// Create the fixture
		this.fixtureDef = new b2FixtureDef();
		for ( var l in this.fixtureDefaults) {
			this.fixtureDef[l] = details[l] || this.fixtureDefaults[l];
		}

		for ( var k in this.defaults) {
			this.details[k] = details[k] || this.defaults[k];
		}

		switch (details.shape) {
			case "circle" :
				details.radius = details.radius || this.defaults.radius;
				this.fixtureDef.shape = new b2CircleShape(details.radius
						/ physics.scale);
				break;
			case "polygon" :
				break;
			case "terrain" :
				break;
			case "block" :
			default :
				details.width = details.width || this.defaults.width;
				details.height = details.height || this.defaults.height;

				this.fixtureDef.shape = new b2PolygonShape();
				this.fixtureDef.shape.SetAsBox(details.width / 2
						/ physics.scale, details.height / 2 / physics.scale);
				break;
		}

		if (details.shape === "polygon") {

			var triContext = new poly2tri.SweepContext(details.points, {
				cloneArrays : true
			});

			triContext.triangulate();
			var triangles = triContext.getTriangles();
			for ( var i in triangles) {
				var verticesVec = [];
				for ( var j in triangles[i].points_) {
					var point = triangles[i].points_[j];
					verticesVec.push({
						x : point.x / physics.scale,
						y : point.y / physics.scale
					});
				}
				polyShape = new b2PolygonShape();
				polyShape.SetAsVector(verticesVec);
				this.fixtureDef.shape = polyShape;
				var fixture = this.body.CreateFixture(this.fixtureDef);
				if (details.isSensor)
					fixture.SetSensor(details.isSensor);
			}

		} else if (details.shape === "terrain") {
			var terrainTriangles = [];
			for (var i = 0; i < details.terrainPolys.length; i++) {
				var poly = details.terrainPolys[i];
				
				if (!poly.outer) continue;
				
				var triContext = new poly2tri.SweepContext(poly.outer, {
					cloneArrays : true
				});
				for ( var j in poly.holes) {
					triContext.addHole(poly.holes[j]);
				}

				try {
					triContext.triangulate();
				} catch (e) {

					console.log("I got this fixed!");

					var delta = 0.0001;
					var offsetted = [];
					for ( var k in poly.outer) {
						offsetted.push({
							x : poly.outer[k].x
									+ (Math.random() > 0.5 ? 1 : -1) * delta
									* k,
							y : poly.outer[k].y
									+ (Math.random() > 0.5 ? 1 : -1) * delta
									* k
						});
					}

					triContext = new poly2tri.SweepContext(offsetted, {
						cloneArrays : true
					});
					for ( var n in poly.holes) {
						triContext.addHole(poly.holes[n]);
					}

					triContext.triangulate();
				}
				terrainTriangles = terrainTriangles.concat(triContext
						.getTriangles()
						|| []);
			}

			for ( var i in terrainTriangles) {
				var verticesVec = [];
				for ( var j in terrainTriangles[i].points_) {
					var point = terrainTriangles[i].points_[j];
					verticesVec.push({
						x : point.x / physics.scale,
						y : point.y / physics.scale
					});
				}
				polyShape = new b2PolygonShape();
				polyShape.SetAsVector(verticesVec);
				this.fixtureDef.shape = polyShape;
				this.body.CreateFixture(this.fixtureDef);
			}

		} else {
			var fixture = this.body.CreateFixture(this.fixtureDef);
			if (details.isSensor)
				fixture.SetSensor(details.isSensor);
		}

		this.update = function() {
			details.life--;
			if (details.life < 0) {
				details.dead = true;
			}
		};

		this.draw = function(context) {
			var pos = this.body.GetPosition(), angle = this.body.GetAngle();

			context.save();
			context.translate(pos.x * physics.scale, pos.y * physics.scale);
			context.rotate(angle);

			if (this.details.color || this.details.patternImg) {
				context.fillStyle = this.details.color;

				switch (this.details.shape) {
					case "circle" :
						context.beginPath();
						context.arc(0, 0, this.details.radius, 0, Math.PI * 2);
						context.fill();
						break;
					case "polygon" :
						var points = this.details.points;
						context.beginPath();
						context.moveTo(points[0].x, points[0].y);
						for (var i = 1; i < points.length; i++) {
							context.lineTo(points[i].x, points[i].y);
						}
						context.fill();
						break;
					case "terrain" :

						if (this.details.patternImg) {
							var pattern = context.createPattern(
									this.details.patternImg, "repeat");
							context.fillStyle = pattern;

						}

						for ( var k in this.details.terrainPolys) {
							var poly = this.details.terrainPolys[k];

							if (!poly.outer) continue;
							
							context.beginPath();
							context.moveTo(poly.outer[0].x, poly.outer[0].y);
							for (var i = 1; i < poly.outer.length; i++) {
								context
										.lineTo(poly.outer[i].x,
												poly.outer[i].y);
							}
							context.closePath();
							context.fill();

						}

						for ( var k in this.details.terrainPolys) {
							var poly = this.details.terrainPolys[k];

							context.fillStyle = "black";
							var holes = poly.holes;
							for ( var i in holes) {
								var hole = holes[i];
								context.beginPath();
								context.moveTo(hole[0].x, hole[0].y);
								for (var j = 1; j < hole.length; j++) {
									context.lineTo(hole[j].x, hole[j].y);
								}
								context.fill();
							}

						}

						break;
					case "block" :
						context.fillRect(-this.details.width / 2,
								-this.details.height / 2, this.details.width,
								this.details.height);
					default :
						break;
				}
			}

			if (this.details.image) {
				context.drawImage(this.details.image, -this.details.width / 2,
						-this.details.height / 2, this.details.width,
						this.details.height);

			}

			context.restore();

		};

	}

	window.Body = Body;

	Body.prototype.defaults = {
		shape : "block",
		width : 120,
		height : 120,
		radius : 30,
		life : Infinity,
		dead : false,
		zIndex : 0
	};

	Body.prototype.fixtureDefaults = {
		density : 2,
		friction : 1,
		restitution : 0.2
	};

	Body.prototype.definitionDefaults = {
		active : true,
		allowSleep : true,
		angle : 0,
		angularVelocity : 0,
		awake : true,
		bullet : false,
		fixedRotation : false
	};

})(window);
