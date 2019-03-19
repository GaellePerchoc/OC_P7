/** @namespace */ 
(function(window){
	'use strict';

	/** 
	 * Creates a new Model instance.
	 * 
	 * @namespace 
	 * @alias window.app.Model
	 * @class
	 */
	function Model (){
		this.restaurants = [];
		this.tempRestaurants;
	}

	/**
	 * Creates new restaurant(s)
	 *
	 * @param {array} data - An array of restaurants
	 * @param {function} callback - The function to fire after the restaurants are created
	 */
	Model.prototype.create = function(data, callback) {
		const self = this;	
		data.forEach(function(restaurant){
			// Check if the restaurant already exists in the DB
			let duplicate = self.restaurants.find(function(r){
				if(r.id == restaurant.id){
					return r;
				}
			})

			if(duplicate != undefined){
				return;
			}
			
			restaurant.avg = self._getAverage(restaurant.ratings);
			self.restaurants.push(restaurant);
		})

		callback();
	}

	/**
	 * Depending of the query, find a restaurant or a list of restaurants
	 *
	 * @param {string|number|object} query - The query to get restaurant(s) 
	 * @param {function} callback - The function to fire when the restaurant or the array of restaurants has been found
	 */
	Model.prototype.read = function(query, callback) {
		const self = this;
		if(typeof query == 'string' || typeof query == 'number'){

			let restaurant = this.restaurants.find(function(restaurant){
				if(restaurant.id == query){
					return true ;
				}
			})

			if(!restaurant.picture){
				self._getPicture(restaurant, callback);
			} else {
				callback(restaurant);
			}

		} else if(typeof query == 'object'){
			
			if(query.type == 'show'){
				this.tempRestaurants = this.restaurants.filter(function(restaurant){
					if(restaurant.lat < query.bds.northLat && restaurant.lat > query.bds.southLat){
						if(restaurant.long < query.bds.northLng && restaurant.long > query.bds.southLng){
							return restaurant;
						} 
					}
				})
			}

			let results = this.tempRestaurants.filter(function(restaurant){
				if(restaurant.avg >= query.values.min && restaurant.avg <= query.values.max){
					return restaurant;
				}
			})

			callback(results);
			
		}
	}

	/**
	 * Update an existing restaurant
	 *
	 * @param {string | number} id - The id's of the restaurant
	 * @param {boolean | object} data - The restaurant's parameter to update
	 * @param {function} callback - The function to fire after the restaurant is updated
	 */
	Model.prototype.update = function(id, data, callback) {
		const self = this;
		switch(typeof data){
			case 'boolean':
				this.restaurants.find(function(restaurant){
					if(restaurant.id == id){
						restaurant.picture = data;
						callback(restaurant);
					}
				})
				break;
			case 'object':
				this.restaurants.find(function(restaurant){
					if(restaurant.id == id){
						restaurant.ratings.unshift(data);
						restaurant.avg = self._getAverage(restaurant.ratings);
						callback(restaurant);
					}
				})
				break;
		}
	}

	/**
	 * Calculate the average rating of a restaurant
	 *
	 * @param {array} ratings - The restaurant's reviews
	 */
	Model.prototype._getAverage = function(ratings){
		let sum = 0
		if(ratings.length > 0){
			ratings.forEach(function(r){
				sum += r.stars;
			})	
			let average = sum / ratings.length;
			return average;
		} else {
			return sum;
		}
	}

	/**
	 * Request the Street View Image Metadata of a restaurant and according to the response, 
	 * update the restaurant to inform whether a Street View Static Image exists for the place
	 *
	 * @param {object} restaurant - The restaurant's object
	 * @param {function} callback - The function to fire after the model has been updated
	 */
	Model.prototype._getPicture = function(restaurant, callback){
		let request = 
			  "https://maps.googleapis.com/maps/api/streetview/metadata?"
			+ "&location=" + restaurant.lat + "," + restaurant.long
			+ "&key=YOU_API_KEY";

		const req = new XMLHttpRequest();
		const self = this;
		req.open('GET', request);
		req.overrideMimeType("text/plain");
		req.send();
		req.onload = function(){
			let result = JSON.parse(this.responseText);

			if(result.status == 'OK'){
				self.update(restaurant.id, true, callback);
			} else {
				self.update(restaurant.id, false, callback)
			}
		}
	}

	window.app = window.app || {};
	window.app.Model = Model;

})(window);