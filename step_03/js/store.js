/** @namespace */ 
(function(window){
	'use strict';

	/** 
	 * Creates a new client side storage object and will create an empty
	 * collection if no collection already exists.
	 * 
	 * @namespace
	 * @alias window.app.Storage
	 * @class
	 */
	function Storage (){
		this.adapter = new LocalStorage('DB_restaurants_S03');
		this.db = low(this.adapter);
		
		if(!this.db.has('restaurants').value()){
			this.db.defaults({restaurants:[]}).write();
		} 
	}

	/**
	 * Find and return an array of restaurants depending of the parameters of the request
	 *
	 * @param {object} query - The map's bounds
	 * @returns {array} Array of restaurants which fit the query
	 */
	Storage.prototype.find = function(query) {
		let restaurants = this.db.get('restaurants').value();
		let results = restaurants.filter(function(restaurant){
			if(restaurant.lat < query.northLat && restaurant.lat > query.southLat){
				if(restaurant.long < query.northLng && restaurant.long > query.southLng){
					return true;
				} 
			}
		})
		return results;
	}

	/**
	 * Save the given data into the DB.
	 * If there is no specified id, the data is an array of new restaurant(s).
	 * Otherwise, the id indicates which restaurant is to update
	 *
	 * @param {array|boolean} data - The data to save into the DB
	 * @param {function} callback - The function to fire after saving the data into the DB
	 * @param {string|number} [id] - The id of the restaurant to update
	 */
	Storage.prototype.save = function(data, callback, id){
		let restaurant;
		if(id){
			switch(typeof data){
				case "object":
					restaurant = this.db.get('restaurants')
										.find({id: id})
										.value();

					data.reviews.forEach(function(review){
						restaurant.ratings.unshift(review);
					})
					
					this.db.get('restaurants')
							.find({id: id})
							.assign({ratings: restaurant.ratings})
							.write();

					if(data.type == 'addReview'){
						this._average(restaurant);
					}

					break;
				case "boolean":
					this.db.get('restaurants')
							.find({id: id})
							.assign({picture: data})
							.write();
					break;
			}

			restaurant = this.db.get('restaurants')
								.find({id: id})
								.value();
			callback(restaurant)
			
		} else {
			const self = this;
			data.forEach(function(restaurant){
				// Check if the restaurant already exists in the DB
				if(self.db.get('restaurants').find({id: restaurant.id}).value()){
					return;
				}
				self.db.get('restaurants')
						.push(restaurant)
						.write();
			})
			callback();
		}
	}

	/**
	 * Calculate the average ratings of a restaurant
	 *
	 * @param {object} - restaurant - The restaurant
	 */
	Storage.prototype._average = function(restaurant){
		let avg = ((restaurant.avg * restaurant.user_total) + restaurant.ratings[0].stars) / (restaurant.user_total + 1);
		this.db.get('restaurants')
				.find({id: restaurant.id})
				.assign({avg: avg})
				.assign({user_total: ++restaurant.user_total})
				.write()
	}

	window.app = window.app || {};
	window.app.Storage = Storage;

})(window);