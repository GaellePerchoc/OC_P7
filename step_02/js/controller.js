(function(window){
	'use strict';

	function Controller (model, view, map){
		this.model = model;
		this.view = view;
		this.map = map;

		const self = this;

		this.view.bind("setFilter", function(values){
			self.updateRestaurants(values.min, values.max);
		})

		this.view.bind("setCookieConsent");
		this.view.bind("openFilter");
		this.view.bind("scroll");

		this.view.bind("getReviews", function(id){
			self.showReviews(id);
		})

		this.view.bind("addRestaurantMode", {
			on: function(){
				self.map.render("cursor", "crosshair");
				self.map.bind("addRestaurant", function(result){
					self.map.unbind("click");
					self.view.render("addRestaurant", result);
					
					self.view.bind("addRestaurantCancel", function(){
						self.map.render("cursor", null)
					});
					
					self.view.bind("addRestaurantDone", function(restaurant){
						self.map.render("cursor", null)
						self.addRestaurant(restaurant);
					})
				})
			},

			off: function(){
				self.map.unbind("click");
				self.map.render("cursor", null);
			}
		})

		this.view.bind("mouseOverCard", function(id){
			self.map.render("mouseOverCard", id);
			
			self.view.bind("mouseLeaveCard", function(){
				self.map.render("mouseLeaveCard", id);
			}, id);
		})

		this.map.bind("dragend", function(){
			self.showRestaurants();
		})

		this.map.bind("zoomChanged", function(){
			self.showRestaurants();
		})

	}

	/**
	 * Set the view once the tiles of the map are loaded with the user's position and restaurants around
	 */
	Controller.prototype.setView = function(){
		const self = this;
		this.map.bind("tilesLoaded", function(){
			self.map.setUser(function(){
				self.getRestaurants();
			})
		})
	}

	/**
	 * Get the restaurants from a JSON File
	 */
	Controller.prototype.getRestaurants = function(){
		const self = this;

		const req = new XMLHttpRequest();
		req.onload = function(event){
			if (this.readyState === XMLHttpRequest.DONE) {
				let restaurants = JSON.parse(this.responseText);
				for(let i in restaurants){
					restaurants[i].id = i;
				}

				self.model.create(restaurants, function(){
					self.showRestaurants();
				});
			}
		}

		req.open('GET', './restaurants.json');
		req.overrideMimeType("text/plain");
		req.send();
	}

	/**
	 * Update the restaurants according to the new values of the filter
	 *
	 * @param {number} [min] The min value of the filter
	 * @param {number} [max] The max value of the filter
	 */
	Controller.prototype.updateRestaurants = function(min, max){
		let query = {
			type: "update",
			values: {
				min: min,
				max: max
			}
		}

		const self = this;
		this.model.read(query, function(restaurants){
			self._show(restaurants);
		})
	}

	/**
	 * Show the restaurants depending of the map's bounds and the values of the filter
	 */
	Controller.prototype.showRestaurants = function(){
		let query = {
			type: 'show',
			bds: this.map.bounds(),
			values: {
				min: this.view.slider.getValues()[0],
				max: this.view.slider.getValues()[1]
			}
		}

		const self = this;
		this.model.read(query, function(restaurants){
			self._show(restaurants);
		})
	}

	/**
	 * Show the reviews of a restaurant
	 *
	 * @param {string|number} [id] The restaurant's id
	 */
	Controller.prototype.showReviews = function(id){
		id = id.toString();
		
		const self = this;
		this.model.read(id, function(restaurant){

			self.view.render("showReviews", restaurant);

			if(restaurant.picture == true){
				let picture = 
					 "https://maps.googleapis.com/maps/api/streetview?"
					+ "size=600x400"
					+ "&location=" + restaurant.lat + "," + restaurant.long
					+ "&key=API_KEY";
				self._bindShowPicture(restaurant.restaurantName, picture);
			}

			self._bindAddReview(id);
		})
	}

	/**
	 * Add a new restaurant
	 *
	 * @param {object} [restaurant] The restaurant to create
	 */
	Controller.prototype.addRestaurant = function(restaurant){
		const self = this;
		this.model.create([restaurant], function(){
			self.showRestaurants();
		});
	}

	/**
	 * Add a new review
	 *
	 * @param {string|number} [id] The restaurant's id
	 * @param {object} [review] The review to add
	 */
	Controller.prototype.addReview = function(id, review){
		const self = this;
		this.model.update(id, review, function(restaurant){
			self.view.render("updateCard", restaurant);
			
			self.map.render("updatePopup",{
				id: restaurant.id, 
				content: self.view.render("popup", {
					name: restaurant.restaurantName, 
					id: restaurant.id, 
					average: restaurant.avg 
				})
			});
			
			self.showReviews(id);
		})
	}

	/**
	 * Bind the event to get the picture to the render of this picture
	 *
	 * @param {string} [name] The restaurant's object
	 * @param {string} [picture] The callback to fire after the model is created
	 */
	Controller.prototype._bindShowPicture = function(name, picture){
		const self = this;
		let restaurant = {
			name: name,
			src: picture
		}
		this.view.bind("getPicture", function(){
			self.view.render("showPicture", restaurant);
		})
	}

	/**
	 * Bind the event to add a new review
	 *
	 * @param {string|number} [id] The restaurant's id
	 */
	Controller.prototype._bindAddReview = function(id){
		const self = this;
		this.view.bind("addReviewMode", function(){
			self.view.render("addReview");
			self.view.bind("addReviewDone", function(review){
				self.addReview(id, review);
			})
		});
	}

	/**
	 * Show cards and markers of the restaurants
	 *
	 * @param {array} [list] The list of restaurants to show
	 */
	Controller.prototype._show = function(list){
		this.view.render("resetList");
		this.view.render("scrollTop");
		this.map.render("resetMarkers");

		for(let i = 0; i < list.length ; i++){
			if(list[i]){
				const self = this;
				this.view.render("showCard", list[i]);

				this.map.render("addMarker", {
					restaurant: list[i],
					addPopup: function(marker){
						self.map.render("addPopup", {
							marker: marker , 
							content: self.view.render("popup", {
								name: list[i].restaurantName, 
								id: list[i].id, 
								average: list[i].avg
							}), 
							showReviews: function(id){
								self.showReviews(id);
							}
						})
					},
					overMarker: function(id){
						self.view.render("cardHovered", id)
					},
					leaveMarker: function(id){
						self.view.render("cardNormal", id)
					}
				})

			}
		}
	}

	window.app = window.app || {};
	window.app.Controller = Controller;

})(window);