/**
 * 
 */

(function(window) {

	var GRAVITY = 30;
	var BRUSH_R = 15;

	function Physics(element, scale) {
		var gravity = new b2Vec2(0, GRAVITY);
		this.world = new b2World(gravity, true);
		this.element = element; // most likely the canvas element
		this.context = element.getContext("2d");
		this.scale = scale || 30;
		this.dtRemaining = 0;
		this.stepAmount = 1 / 60;
	}

	Physics.prototype.step = function(dt) {
		this.dtRemaining += dt;
		while (this.dtRemaining > this.stepAmount) {
			this.dtRemaining -= this.stepAmount;
			this.world.Step(this.stepAmount, 8, 3);
		}

		var body = this.world.GetBodyList();

		if (this.debugDraw) {
			this.world.DrawDebugData();
		} else {
//			this.context.clearRect(0, 0, this.element.width,
//					this.element.height);
		}

		var deadBodies = [];

		var drawLater = [];

		while (body) {
			var obj = body.GetUserData();
			if (obj) {
				obj.update();
				if (obj.details.dead)
					deadBodies.push(body);
				if (!this.debugDraw) {
					if ( obj.details.zIndex > 0) {
						drawLater.push(obj);
					} else {
						obj.draw(this.context);
					}
				}
				
			}

			body = body.GetNext();
		}

		for ( var i in drawLater) {
			drawLater[i].draw(this.context);
		}

		// Remove dead bodies
		for (var i = 0; i < deadBodies.length; i++) {
			this.world.DestroyBody(deadBodies[i]);
		}
	};

	Physics.prototype.debug = function() {
		this.debugDraw = new b2DebugDraw();
		this.debugDraw.SetSprite(this.context);
		this.debugDraw.SetDrawScale(this.scale);
		this.debugDraw.SetFillAlpha(0.3);
		this.debugDraw.SetLineThickness(1.0);
		this.debugDraw
				.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
		this.world.SetDebugDraw(this.debugDraw);
	};

	Physics.prototype.onMouseDown = function(callback) {

		function handleMouseDown(e) {
			e.preventDefault();
			callback(e);
		}

		this.element.addEventListener("mousedown", handleMouseDown);

	};

	Physics.prototype.onMouseUp = function(callback) {

		function handleMouseUp(e) {
			e.preventDefault();
			callback(e);
		}

		this.element.addEventListener("mouseup", handleMouseUp);

	};

	Physics.prototype.onClick = function(callback) {

		function handleClick(e) {
			e.preventDefault();
			callback(e);
		}

		this.element.addEventListener("click", handleClick);
	};

	Physics.prototype.rightClickToCreate = function(callback) {

		function handleRightClick(e) {
			e.preventDefault();
			callback(e);
		}

		this.element.addEventListener("contextmenu", handleRightClick);
	};

	Physics.prototype.onTouchEnd = function(callback) {

		function handleTouchEnd(e) {
			e.preventDefault();
			callback(e);
		}

		this.element.addEventListener("touchend", handleTouchEnd);
	};

	Physics.prototype.onTouchStart = function(callback) {

		function handleTouchStart(e) {
			e.preventDefault();
			callback(e);
		}

		this.element.addEventListener("touchstart", handleTouchStart);
	};

	Physics.prototype.collision = function() {
		this.listener = new Box2D.Dynamics.b2ContactListener();
		this.listener.BeginContact = function(contact) {
			var bodyA = contact.GetFixtureA().GetBody().GetUserData(), bodyB = contact
					.GetFixtureB().GetBody().GetUserData();

			if (bodyA.beginContact) {
				bodyA.beginContact(bodyB);
			}
			if (bodyB.beginContact) {
				bodyB.beginContact(bodyA);
			}
		};
		this.listener.EndContact = function(contact) {
			var bodyA = contact.GetFixtureA().GetBody().GetUserData(), bodyB = contact
					.GetFixtureB().GetBody().GetUserData();

			if (bodyA.endContact) {
				bodyA.endContact(bodyB);
			}
			if (bodyB.endContact) {
				bodyB.endContact(bodyA);
			}
		};

		this.listener.PostSolve = function(contact, impulse) {
			var bodyA = contact.GetFixtureA().GetBody().GetUserData(), bodyB = contact
					.GetFixtureB().GetBody().GetUserData();

			if (bodyA.postSolve) {
				bodyA.postSolve(contact, impulse);
			}
			if (bodyB.postSolve) {
				bodyB.postSolve(contact, impulse);
			}

		};
		this.world.SetContactListener(this.listener);
	};

	window.Physics = Physics;
})(window);
