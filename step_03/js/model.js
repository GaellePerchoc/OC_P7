/** @namespace */ 
(function(window){
	'use strict';

	/** 
	 * Creates a new Model instance and hooks up the storage.
	 * 
	 * @namespace 
	 * @alias window.app.Model
	 * @class
	 * 
	 * @param {object} storage - 
	 */
	function Model (storage){
		this.storage = storage;
		this.restaurants;
	}

	/**
	 * Create new restaurants
	 *
	 * @param {object} data - The data to create
	 * @param {function} callback - The function to fire after the restaurant is created
	 */
	Model.prototype.create = function(data, callback) {
		if(data.type == "add"){
			this.restaurants.splice(data.index, 0, data.restaurant[0]);
			this.storage.save(data.restaurant, callback);
		} else {
			this.storage.save(data.restaurant, callback);	
		}
	}

	/**
	 * Find restaurants depending of the type of the query
	 *
	 * @param {string|number|object} query -
	 * If the query is the string or number, the model returns an unique restaurant
	 * If the query is an object, the model returns an array of restaurants 
	 * @param {function} callback - The function to fire after the restaurant of the array of restaurants have been found
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
				this.restaurants = this.storage.find(query.bds);
			}

			callback(this.restaurants.filter(function(restaurant){
				if(restaurant.avg >= query.values.min && restaurant.avg <= query.values.max){
					return restaurant;
				}
			}));
			
		}
	}

	/**
	 * Update an existing restaurant
	 *
	 * @param {string | number} id - The restaurant's id
	 * @param {boolean | object} data - The restaurant's properties to update
	 * @param {function} callback - The function to fire after the restaurant has been updated
	 */
	Model.prototype.update = function(id, data, callback) {
		const self = this;
		this.storage.save(data, function(restaurant){
			callback(restaurant);
		}, id);
	}

	/**
	 * Request the Street View Image Metadata of a restaurant and according to the response, 
	 * update the restaurant to inform whether a Street View Static Image exists for the specific place
	 *
	 * @param {object} restaurant - The restaurant's object
	 * @param {function} callback - The function to fire after the model has been updated
	 */
	Model.prototype._getPicture = function(restaurant, callback){
		let request = 
			  "https://maps.googleapis.com/maps/api/streetview/metadata?"
			+ "&location=" + restaurant.lat + "," + restaurant.long
			+ "&key=YOUR_API_KEY";

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