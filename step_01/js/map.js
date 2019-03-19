/** @namespace */ 
(function(window){
	'use strict';

	const mapOptions = {
        backgroundColor: '#FFF',
        center: {lat: 48.853152, lng: 2.349891},
        zoom: 12,
        mapTypeControl: false, 
        fullscreenControl: false,
        streetViewControl: false,
        zoomControlOptions: { position: google.maps.ControlPosition.TOP_RIGHT }
    };

    const iconRestaurant = {
		path: 'M40,50a10,10 0 1,0 20,0a10,10 0 1,0 -20,0',
		scale: 0.7,
		strokeWeight: 7,
		strokeColor: '#FFC107',
		strokeOpacity: 1,
		fillColor: '#FFE082',
		fillOpacity: 1,
		origin: new google.maps.Point(0,0),
		anchor: new google.maps.Point(40, 50)
	};

    const iconRestaurantHovered = {
    	path: 'M40,50a10,10 0 1,0 20,0a10,10 0 1,0 -20,0',
		scale: 0.7,
		strokeWeight: 7,
		strokeColor: '#ffb300',
		strokeOpacity: 1,
		fillColor: '#ffb300',
		fillOpacity: 1,
		origin: new google.maps.Point(0,0),
		anchor: new google.maps.Point(40, 50)
    };

    const iconUser = 'M24,1C14.1,1,6,8.8,6,18.4c0,3.8,1.3,7.4,3.6,10.4l13.6,17.8c0.3,0.4,1,'
    				+ '0.5,1.4,0.2c0.1-0.1,0.1-0.1,0.2-0.2 l13.6-17.8c2.3-3,3.6-6.6,3.6-10.4C42,'
    				+ '8.8,33.9,1,24,1z M22.6,25.2c-3.8-0.8-6.3-4.4-5.5-8.2c0.8-3.8,4.4-6.3,8.2-5.5 c2.8,'
    				+ '0.6,5,2.7,5.5,5.5c0.7,3.8-1.8,7.5-5.5,8.2C24.4,25.4,23.5,25.4,22.6,25.2z';

    /** 
     * Creates a new Map instance which contains a google maps MVCObject.
     *
	 * @namespace
	 * @alias window.app.Map
	 * @class
	 */	
	function Map () {
		
		this.map = new google.maps.Map(document.getElementById("map"), mapOptions);
		this.markers = [];
		this.popups = [];
		this.geocoder = new google.maps.Geocoder();

		this._setOptions();

	}

	/**
	 * Set the style of the map
	 */
	Map.prototype._setOptions = function(){
		const self = this;
		const req = new XMLHttpRequest();
		req.onload = function(event){
			if (this.readyState === XMLHttpRequest.DONE) {
				let style = JSON.parse(this.responseText);
				self.map.setOptions({styles: style})
			}
		}

		req.open('GET', './styleMap.json');
		req.overrideMimeType("text/plain");
		req.send();
	}

	/**
	 * Set the location of the user on map and center the map on it, if the user allows it
	 *
	 * @param {function} callback - The function to fire after user has allowed (or not) to geolocate
	 */
	Map.prototype.setUser = function(callback){
		const self = this;
		if (navigator.geolocation) {                                                                                
	    	navigator.geolocation.getCurrentPosition(function(position) {                                             
	        	let pos = {                                                                                             
		       		lat: position.coords.latitude,
		       		lng: position.coords.longitude
	        	};

	        	self.map.setCenter(pos);

	        	let icon = {
	        		path: iconUser,
	        		scale: 0.8,
	        		strokeWeight:0,
			        fillColor: '#4E4946',
			        fillOpacity: 1,
			        origin: new google.maps.Point(0,0),
			        anchor: new google.maps.Point(25, 50)
	        	}

	        	new google.maps.Marker({
	        		position:pos,
	        		map: self.map,
	        		icon: icon
	        	})
	        	callback();
	        }, function(){
	        	callback();
	        })
    	} else {
    		callback();
    	}
	}

	/**
	 * Get and return the bounds of the map
	 * 
	 * @returns {object} The bounds of the map
	 */
	Map.prototype.bounds = function(){
		let bounds = this.map.getBounds();
		let bds = {
			northLat: bounds.getNorthEast().lat(),
			northLng: bounds.getNorthEast().lng(),
			southLat: bounds.getSouthWest().lat(),
			southLng: bounds.getSouthWest().lng()
		}
		return bds;
	}

	/**
	 * Bind an event to a specific handler
	 *
	 * @param {string} event - The name of the event
	 * @param {function} handler - A function bind to a given event
	 * @param {object} [parameter]
	 */
	Map.prototype.bind = function(event, handler, parameter){
		switch(event){
			case "dragend":
				this._dragend(handler);
				break;
			case "zoomChanged":
				this._zoomChanged(handler);
				break;
			case "tilesLoaded":
				this._tilesLoaded(handler);
				break;
			case "mouseOverMarker":
				this._mouseOverMarker(handler, parameter);
				break;
			case "mouseLeaveMarker": 
				this._mouseLeaveMarker(handler, parameter);
				break;
			case "clickedMarker":
				this._clickedMarker(handler, parameter.popup, parameter.marker);
				break;
			case "getReviews":
				this._getReviews(handler, parameter);
				break;
		}
	}

	/**
	 * Set the 'dragend' event
	 * 
	 * @param {function} handler - The function bound to this event
	 */
	Map.prototype._dragend = function(handler){
		const self = this;
		google.maps.event.addListener(this.map, 'dragend', function(){
			handler();
		})
	}

	/**
	 * Set the 'zoom changed' event
	 *
	 * @param {function} handler - The function bound to this event
	 */
	Map.prototype._zoomChanged = function(handler){
		const self = this;
		google.maps.event.addListener(this.map, 'zoom_changed', function(){
			handler(); 
		})
	}

	/**
	 * Set the 'tilesLoaded' event
	 *
	 * @param {function} handler - The function bound to this event
	 */
	Map.prototype._tilesLoaded = function(handler){
		const self = this;
		google.maps.event.addListener(this.map, 'tilesloaded', function(){
			google.maps.event.clearListeners(self.map, 'tilesloaded');
			handler(); 
		})
	}

	/**
	 * Set the 'mouseover' event on specific marker
	 *
	 * @param {function} handler The function bound to this event
	 * @param {object} marker - The marker on which the event has to be bound
	 */
	Map.prototype._mouseOverMarker = function(handler, marker){
		marker.addListener('mouseover', function(){
			marker.setOptions({
				icon: iconRestaurantHovered,
				zIndex: 100
			})
			handler(marker.id);
		})
	}

	/**
	 * Set the 'mouseout' event on marker
	 *
	 * @param {function} handler - The function bound to this event
	 * @param {object} marker - The marker on which the event has to be bound
	 */
	Map.prototype._mouseLeaveMarker = function(handler, marker){
		marker.addListener('mouseout', function(){
			marker.setOptions({
				icon: iconRestaurant,
				zIndex: 0
			})
			handler(marker.id)
		})
	}

	/**
	 * Set the 'click' event on marker : 
	 * It closes the opening popups whiche are not bound to the marker
	 * It open the bound popup
	 * It binds the event to get reviews to the popup linked to the marker
	 *
	 * @param {function} showReviews - The function bound to the event
	 * @param {object} popup - The popup bound to the marker
	 * @param {object} marker - The marker on which the event has to be bound
	 */
	Map.prototype._clickedMarker = function(showReviews, popup, marker){
		const self = this;
		marker.addListener("click", function(){
			self.popups.forEach(function(p){
				p.close();
			});
			popup.open(self.map, marker);
			self.bind("getReviews", showReviews, popup);
		})
	}

	/**
	 * Get the reviews of a restaurant from its popup
	 *
	 * @param {function} showReviews - The function bound to the event
	 * @param {object} popup - The popup from which the user gets the reviews
	 */
	Map.prototype._getReviews = function(showReviews, popup){
		const self = this;
		let onopen = google.maps.event.addListener(popup, 'domready', function (){
			onopen.remove();
			let a = document.querySelector('#popup' + popup.id);
			a.addEventListener("click", function getReviews (){
				a.removeEventListener("click", getReviews);
				popup.close();
				showReviews(popup.id);
			})
		})
	}

	/**
	 * Render the given command with the specified parameters
	 * 
	 * @param {string} command - The name of the command
	 * @param {string|number|object} [parameter]
	 */
	Map.prototype.render = function(command, parameter){
		switch(command){
			case "addMarker": 
				this._addMarker(parameter.restaurant, parameter.addPopup, parameter.overMarker, parameter.leaveMarker);
				break;
			case "resetMarkers":
				this._resetMarkers();
				break;
			case "mouseOverCard":
				this._mouseOverCard(parameter);
				break;
			case "mouseLeaveCard":
				this._mouseLeaveCard(parameter);
				break;
			case "addPopup":
				this._addPopup(parameter.marker, parameter.content, parameter.showReviews);
				break;
		}
	}

	/**
	 * Create marker and set its associated events
	 * 
	 * @param {object} restaurant - The restaurant relative to the created marker
	 * @param {function} addPopup - The function which associates a popup and its events to the marker
	 * @param {function} onOverMarker - The function to fire when the 'mouseover' event occurs
	 * @param {function} onLeaveMarker - The function to fire when the 'mouseout' event occurs
	 */
	Map.prototype._addMarker = function(restaurant, addPopup, onOverMarker, onLeaveMarker){
		const self = this;
		let duplicate = this.markers.find(function(marker){
			return marker.id == restaurant.id;
		})

		if(duplicate == undefined){
			let pos = {
				lat: parseFloat(restaurant.lat), 
				lng: parseFloat(restaurant.long)
			};

			let marker = new google.maps.Marker({
				position: new google.maps.LatLng(pos),
				map: self.map,
				id: restaurant.id,
				icon: iconRestaurant
			});
			
			this.bind("mouseOverMarker", onOverMarker, marker);
			this.bind("mouseLeaveMarker", onLeaveMarker, marker);
			this.markers.push(marker);
			addPopup(marker)
		}	
	}

	/**
	 * Delete the markers on map
	 */
	Map.prototype._resetMarkers = function(){
		this.markers.forEach(function(marker){
			marker.setMap(null);
		})
		this.markers = [];
	}

	/**
	 * Change the icon of the marker when the mouse's user is over the card bound to the marker
	 *
	 * @param {string|number} id - The marker's id 
	 */
	Map.prototype._mouseOverCard = function(id){
		this.markers.find(function(marker){
			if(marker.id == id){
				marker.setOptions({
					icon: iconRestaurantHovered,
					zIndex: 100
				})
			}
		})
	}

	/**
	 * Change the icon of the marker when the mouse's user leave the card bound to the marker
	 *
	 * @param {string|number} id - The id's marker 
	 */
	Map.prototype._mouseLeaveCard = function(id){
		this.markers.find(function(marker){
			if(marker.id == id){
				marker.setOptions({
					icon: iconRestaurant,
					zIndex: 0
				})
			}
		})
	}

	/**
	 * Create a popup and set its events to get the reviews
	 *
	 * @param {object} marker - The marker on which attach a popup
	 * @param {string} content - The content of the popup
	 * @param {function} showReviews - The function to fire when the 'click' event on marker occurs
	 */
	Map.prototype._addPopup = function(marker, content, showReviews){
		const self = this;
		let popup = new google.maps.InfoWindow({
			content: content,
			id: marker.id
		});
		this.popups.push(popup);
		this.bind("clickedMarker", showReviews, {
			popup: popup,
			marker: marker
		})
	}

	window.app = window.app || {};
	window.app.Map = Map;
})(window);