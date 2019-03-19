/** @namespace */ 
(function(window){
	'use strict';

	/** 
	 * The app's templates
	 * 
	 * @namespace
	 * @alias window.app.Template
	 * @class
	 */
	function Template () {}

	/**
	 * Create the card of a restaurant
	 * Create a <div> HTML string and return it to insert into the page
	 * 
	 * @param {object} restaurant - The restaurant
	 * @returns {string} HTML string
	 */
	Template.prototype.card = function(restaurant){
		
		let template = 
				'<a id={{id}}></a>'
			+	'<h2 class="restaurantName">{{restaurantName}}</h2>'
			+	'<p class="address">{{address}}</p>'
			+	'<span class="stars">{{starsRange}}</span>'
			+	'<p class="score">{{score}}</p>';

		template = template.replace('{{id}}', restaurant.id);
		template = template.replace('{{restaurantName}}', restaurant.restaurantName);
		template = template.replace('{{address}}', restaurant.address);
		template = template.replace('{{starsRange}}', this._starsRating(restaurant.avg));
		template = template.replace('{{score}}', restaurant.avg.toFixed(1));

		let card = document.createElement("div");
		card.classList.add("card");
		card.classList.add("card" + restaurant.id);
		card.innerHTML = template;
		
		return card;
	}

	/**
	 * Create and return a modal window which contains the reviews of a restaurant
	 * 
	 * @param {object} restaurant - The restaurant
	 * @returns {object} Modal window
	 */
	Template.prototype.details = function(restaurant){
		if(!alertify.details){
			this._modal("details");
		}
		
		let content = this._contentDetails(restaurant)
		let modal = alertify.details(content);

		if(restaurant.picture == false){
			document.querySelector('#picture').classList.remove('menu-title');
			document.querySelector('#picture').classList.add('inactive');
		} 

		let cancel = document.querySelector('.reviews .footer .cancel');
		cancel.addEventListener('click', function(){
			alertify.details().close();
		})

		return modal;
	}

	/**
	 * Create and return a modal window which contains the picture of the restaurant
	 * 
	 * @param {string} name - The restaurant's name
	 * @param {string} src - The link of the picture
	 * @returns {object} Modal window
	 */
	Template.prototype.picture = function(name, src){
		if(!alertify.picture){
			this._modal("picture");
		}	

		let content = '<div class="pictureWrapper"><img rel="preload" class="picture" src="' + src + '" alt="' + name + '" /></div>';
		let modal = alertify.picture(content);
		alertify.picture().closeOthers();
		alertify.picture().set({onclose: function(){
			alertify.details().show();
		}})

		return modal;
	}

	/**
	 * Create a modal window template
	 * 
	 * @param {string} modalName - The modal's name
	 * @returns {object} Modal window
	 */
	Template.prototype._modal = function(modalName){
		alertify.dialog(modalName, function factory (){
			return {
				main: function(content){
					this.setContent(content);
				},
				setup:function(){
				    return { 
				       	options: {
				       		transition:'fade',
				       		resizable:false,
				       		movable: false,
			        		maximizable:false,
			        		pinnable:false,
			        		padding:false,
			        		frameless:true
				        }				        	
				    };
				}
			}
		})		
	}

	/**
	 * Create the content of the modal window which displays the restaurant's reviews
	 * Create and return a <div> HTML string 
	 * 
	 * @param {object} restaurant - The restaurant for which the card is created
	 * @returns {string} HTML <div>
	 */
	Template.prototype._contentDetails = function(restaurant){
		let template = 
			 '<div class="reviews">'
			+	'<div class="header">'
			+	   	'<h2 class="restaurantName">{{restaurantName}}</h2>'
			+		'<p class="address">{{address}}</p>'
			+		'<span class="stars">{{starsRange}}</span>'
			+		'<span class="score">{{average}}</span>'
			+	'</div>'
			+	'<div class="options">'
			+		'<div class="menu">'
			+			'<div class="menu-title" id="picture">Photo</div>'
			+		'</div>'
			+	'</div>'
			+	'<div class="ratings">{{ratings}}</div>'
			+	'<div class="footer">'
			+		'<div class="cancel">Fermer</div>'
			+	'</div>'
			+'</div>';	
			

		template = template.replace('{{restaurantName}}', restaurant.restaurantName);
		template = template.replace('{{address}}', restaurant.address);
		template = template.replace('{{starsRange}}', this._starsRating(restaurant.avg));
		template = template.replace('{{average}}', restaurant.avg.toFixed(1));
		template = template.replace('{{ratings}}', this._reviews(restaurant.ratings));

		return template;
	}

	/**
	 * Create the list of the restaurant's reviews
	 * Create and return a serie of <div> HTML string
	 * If the restaurant get no reviews, return a simple <p> HTML string
	 * 
	 * @param {array} ratings - The array of the restaurant's ratings
	 * @returns {string} HTML string
	 */
	Template.prototype._reviews = function(ratings){
		let review = '';
		if(ratings.length > 0){
			for(let i = 0; i < ratings.length; i++){
				let template = 
					 '<div class="review">'
					+	'<p class="userName">{{userName}}</p>'
					+	'<span class="stars">{{starsRange}}</span>'
					+	'<span class="score">{{ratings}}</span>'
					+	'<p class="comment">{{comment}}</p>'
					+'</div>';

				template = template.replace('{{userName}}', ratings[i].userName);
				template = template.replace('{{ratings}}', ratings[i].stars.toFixed(1));
				template = template.replace('{{starsRange}}', this._starsRating(ratings[i].stars));
				template = template.replace('{{comment}}', ratings[i].comment);
				review += template;
			}
			return review;	
		} else {
			return review = '<p>Pas de commentaires actuellement pour ce restaurant.</p>';
		}
		
	}

	/**
	 * Create the stars rating of a restaurant
	 * Create and return a HTML string
	 * 
	 * @param {number} rating - The rating or the average rating a restaurant get
	 * @returns {string} HTML string
	 */
	Template.prototype._starsRating = function(rating){
		let starsRange = '';
		let fullStar = '<i class="fas fa-star"></i>';
		let halfStar = '<i class="fas fa-star-half-alt"></i>';
		let emptyStar = '<i class="far fa-star"></i>';
		
		if(rating > 0){
			for(let i = 0; i < Math.floor(rating); i++){
        		starsRange += fullStar;    		
    		}
		}

    	if(rating % 1 !== 0){
    		starsRange += halfStar;
    	}
		
    	if(rating < 5){
    		for(let j = 0; j < Math.floor(5 - rating); j++){
    			starsRange += emptyStar;
    		}
    	}

    	return starsRange;
	}

	/**
	 * Create the content of a popup bound to a restaurant's marker
	 * 
	 * @param {string} name - The restaurant's name
	 * @param {number} average - The restaurant's average rating
	 * @param {string|number} id - The restaurant's id
	 * @returns {string} HTML <div>
	 */
	Template.prototype.popup = function(name, average, id){
		let template = 
			 '<div class="popup">'
			+	'<h3>{{restaurantName}}</h3>'
			+	'<span class="stars">{{starsRange}}</span>'
			+	'<p class="score">{{score}}</p>'
			+	'<a id="popup{{id}}">Plus d\'infos</a>'
			+ '</div>';

		template = template.replace("{{restaurantName}}", name);
		template = template.replace("{{starsRange}}", this._starsRating(average));
		template = template.replace("{{score}}", average.toFixed(1));
		template = template.replace("{{id}}", id);
		
		return template;
	}

	window.app = window.app || {};
	window.app.Template = Template;
})(window);