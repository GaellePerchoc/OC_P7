(function(window){
	'use strict';

	function Controller (model, view, map){
		this.model = model;
		this.view = view;
		this.map = map;

		const self = this;

		this.view.bind("setFilter", function(){
			self.showRestaurants()
		})

		this.view.bind("openFilter");
		this.view.bind("scroll");

		this.view.bind("getReviews", function(id){
			self.showReviews(id);
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
	 * Show the restaurants depending of the map's bounds and the values of the filter
	 */
	Controller.prototype.showRestaurants = function(){
		let query = {
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

		})
	}

	/**
	 * Bind the event to get the picture to the render of this picture
	 *
	 * @param {string} [name] The restaurant's name
	 * @param {string} [picture] The link of the picture
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
	 * Show cards and markers of the restaurants
	 *
	 * @param {array} [list] The list of restaurants to show
	 */
	Controller.prototype._show = function(list){
		this.view.render("resetList");
		this.map.render("resetMarkers");

		for(let i = 0; i < list.length; i++){
			if(list[i]){
				const self = this;
				this.view.render("showCard", list[i]);

				this.map.render("addMarker", {
					restaurant: list[i],
					addPopup: function(marker){
						self.map.render("addPopup", {
							marker: marker, 
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