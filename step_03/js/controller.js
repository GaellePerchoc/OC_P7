(function(window){
	'use strict';

	function Controller (model, view, map){
		this.model = model;
		this.view = view;
		this.map = map;
		this.heap = 20;

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
					self.map.render("cursor", null);

					self.view.render("addRestaurant", result);
					
					self.view.bind("addRestaurantCancel");
					
					self.view.bind("addRestaurantDone", function(restaurant, index){
						self.addRestaurant(restaurant, index);
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

		this.view.bind("previousRestaurants", function(index, sliderValues){
			self.showPreviousRestaurants(index, sliderValues);
		})

		this.view.bind("nextRestaurants", function(index, sliderValues){
			self.showNextRestaurants(index, sliderValues);
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
				self.showRestaurants();
			})
		})
	}

	/**
	 * Update the list of the restaurant according to the new values of the filter
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
			self._show(0, restaurants);
		})
	}

	/**
	 * Show the first restaurants of the list depending of the map's bounds and the values of the filter
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
		this.map.search(function(results){		
			if(results){
				self.model.create({type: 'search', restaurant: results}, function(){
					self.model.read(query, function(restaurants){
						self._show(0, restaurants);
					})
				})
			} else {
				self.model.read(query, function(restaurants){
					self._show(0, restaurants);
				})
			}	
			
		})	
	}

	/**
	 * Show the next restaurants from the current list
	 *
	 * @param {number} [index] The index in the list from which start to show
	 * @param {array} [sliderValues] The values min and max of the slider
	 */
	Controller.prototype.showNextRestaurants = function(index, sliderValues){
		let query = {
			type: 'nextPage',
			values: {
				min: sliderValues[0],
				max: sliderValues[1]
			}
		}

		const self = this;
		this.model.read(query, function(restaurants){
			self._show(index,restaurants);
		})
	}

	/**
	 * Show the previous restaurants from the current list
	 *
	 * @param {number} [index] The index in the list from which start to show
	 * @param {array} [sliderValues] The values min and max of the slider
	 */	
	Controller.prototype.showPreviousRestaurants = function(index, sliderValues){
		let query = {
			type: 'previousPage',
			values: {
				min: sliderValues[0],
				max: sliderValues[1]
			}
		}

		const self = this;
		this.model.read(query, function(restaurants){
			self._show(index, restaurants);
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
			if(restaurant.user_total != 0 && restaurant.ratings.length == 0){
				self.map.getDetails(restaurant.id, function(result){
					if(result){
						self.addReview(restaurant.id, {type: 'getReviews', reviews: result});
					} else {
						self._reviews(restaurant, id);
					}	
				})
			} else {
				self._reviews(restaurant, id)
			}
		})
	}

	/**
	 * Add a new restaurant
	 *
	 * @param {object} [restaurant] The restaurant to create
	 * @param {number} [index] The index to insert the restaurant in the temporary list of restaurants
	 */
	Controller.prototype.addRestaurant = function(restaurant, index){
		const self = this;
		this.model.create({type: 'add', index: index, restaurant: [restaurant]}, function(){
			self._show(index, self.model.restaurants);
		});
	}

	/**
	 * Add a new review
	 *
	 * @param {string|number} [id] The restaurant's id to which add a new review
	 * @param {object} [review] The review to add
	 */
	Controller.prototype.addReview = function(id, review){
		const self = this;
		this.model.update(id, review, function(restaurant){
			console.log(restaurant);
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
			self.view.bind("addReviewCancel");
			self.view.bind("addReviewDone", function(result){
				self.addReview(id, {type: 'addReview', reviews: [result]});
			})
		});
	}

	/**
	 * Show cards and markers of the restaurants
	 *
	 * @param {number} [index] The index from which to start
	 * @param {array} [list] The list of restaurants to show
	 */
	Controller.prototype._show = function(index, list){
		this.view.render("resetList");
		this.view.render("scrollTop");
		this.view.render("nextButton", {
			length: list.length, 
			heap: this.heap, 
			index: index
		});
		this.view.render("prevButton", {
			heap: this.heap, 
			index: index
		});
		this.map.render("resetMarkers");
		
		for(let i = index; i < (index + this.heap) ; i++){
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

	/**
	 * Show the restaurant's reviews
	 *
	 * @param {object} [restaurant] The restaurant
	 * @param {string} [id] The restaurant's id
	 */
	Controller.prototype._reviews = function(restaurant, id){
		this.view.render("showReviews", restaurant);

		if(restaurant.picture == true){
			let picture = 
				 "https://maps.googleapis.com/maps/api/streetview?"
				+ "size=600x400"
				+ "&location=" + restaurant.lat + "," + restaurant.long
				+ "&key=API_KEY";
			this._bindShowPicture(restaurant.restaurantName, picture);
		}

		this._bindAddReview(id);
	}

	window.app = window.app || {};
	window.app.Controller = Controller;

})(window);