(function(window){
	'use strict';

	
	function Template () {}

	/**
	 * Create the card of a restaurant
	 * Create a <div> HTML string and return it to insert into the page
	 * 
	 * @param {object} [restaurant] The restaurant
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
	 * Update the information on the restaurant's card after a new review has been added
	 * 
	 * @param {object} [restaurant] The restaurant whose card has to be updated
	 */
	Template.prototype.updateCard = function(restaurant){
		let card = document.querySelector('.card' + restaurant.id);
		let score = card.querySelector('.score');
		score.innerHTML = restaurant.avg.toFixed(1);

		let starsRating = card.querySelector('.stars');
		starsRating.innerHTML = this._starsRating(restaurant.avg);
	}

	/**
	 * Create and return a modal window which contains the reviews of a restaurant
	 * 
	 * @param {object} [restaurant] The restaurant
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
	 * @param {string} [name] The restaurant's name
	 * @param {string} [src] The link of the picture
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
	 * @param {string} [modalName] The modal's name
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
	 * @param {object} [restaurant] The restaurant for which the card is created
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
			+		'<div class="menu">'
			+			'<div class="menu-title" id="addReview">Donner un avis</div>'
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
	 * Create a list of the restaurant's reviews
	 * Create and return a serie of <div> HTML string
	 * If the restaurant get no reviews, return a simple <p> HTML string
	 * 
	 * @param {array} [ratings] The array of the restaurant's ratings
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
			return review = '<p>Pas de commentaires pour le moment. <br /> Donnez-nous votre avis !</p>';
		}
	}

	/**
	 * Create the stars rating of a restaurant
	 * Create and return a HTML string
	 * 
	 * @param {number} [rating] The rating or the average rating a restaurant get
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
	 * Create and return a modal window to add a new restaurant
	 * 
	 * @param {object} [restaurant] The restaurant to add
	 * @returns {object} Modal window
	 */
	Template.prototype.addRestaurant = function(restaurant){
		if(!alertify.addRestaurant){
			this._modal("addRestaurant");
		}
		
		let content = this._contentAddRestaurant(restaurant)
		let modal = alertify.addRestaurant(content);
		
		let cancel = document.querySelector('.addRestaurant .cancel');
		cancel.addEventListener("click", function(){
			alertify.addRestaurant().close();
			
		})
		alertify.addRestaurant().set({ 
			onclose: function(){
				let butt = document.querySelector('.add');
				butt.classList.remove('add');
			}
		})
		return modal;
	}

	/**
	 * Create and return a modal window to add a new review
	 * 
	 * @returns {object} Modal window
	 */
	Template.prototype.addReview = function(){
		if(!alertify.addReview){
			this._modal("addReview");
		}

		let content = this._contentAddReview();
		let modal = alertify.addReview(content);
		let cancel = document.querySelector('.addReview .cancel');
		cancel.addEventListener("click", function(){
			alertify.addReview().close();
		})
		alertify.addReview().closeOthers();
		alertify.addReview().set({ 
			onclose: function(){
				alertify.details().show();
			}
		})
		return modal;
	}

	/**
	 * Create and return a modal window to informs the user how to add a new restaurant
	 *
	 * @returns {object} Modal window
	 */
	Template.prototype.info = function(){
		if(!alertify.info){
			this._modal("info");
		}
		
		let content = this._infoContent();
		let modal = alertify.info(content);
		let cookieConsent = getCookie("cookie");
		if(!cookieConsent){
			document.querySelector('.noRepeat').style.display = "none";
		}
		let cancel = document.querySelector('.information .confirm');
		let cookie = document.querySelector('.information input');
		cancel.addEventListener("click", function(){
			if(cookie.checked == true){
				setCookie("showInfo", "no", 30);
			}
			alertify.info().close();
		})
		return modal;
	}

	/**
	 * Create the content of the modal window to add a new restaurant
	 * 
	 * @param {object} [restaurant] The restaurant to add
	 * @returns {string} HTML <div>
	 */
	Template.prototype._contentAddRestaurant = function(restaurant){
		let template = 
			 '<div class="form addRestaurant">'
			+	'<h2>Ajouter un restaurant</h2>'
			+	'<form>'
			+		'<div>'
			+			'<input id="restaurantName" type="text" placeholder="Nom du restaurant">'
			+		'</div>'
			+		'<div>'
			+			'<input id="address" type="text" value="{{address}}" data-lat="{{lat}}" data-lng="{{lng}}" disabled="disabled">'
			+		'</div>'
			+	'</form>'
			+	'<div class="footer">'
			+		'<div class="cancel">Annuler</div>'
			+		'<div class="confirm">Valider</div>'
			+	'</div>'
			+ '</div>';

		template = template.replace('{{lat}}', restaurant.lat);
		template = template.replace('{{lng}}', restaurant.lng);
		template = template.replace('{{address}}', restaurant.address);

		return template;
	}

	/**
	 * Create the content of the modal window to add a new review
	 * 
	 * @returns {string} HTML <div>
	 */
	Template.prototype._contentAddReview = function(){
		let template = 
			 '<div class="form addReview">'
			+	'<h2>Ajouter un avis</h2>'
			+	'<form>'
			+		'<div class="starsRange">'
			+			'<input type="radio" id="star5" name="rating" value="5"><label for="star5"></label>'
			+			'<input type="radio" id="star4" name="rating" value="4"><label for="star4"></label>'
			+			'<input type="radio" id="star3" name="rating" value="3"><label for="star3"></label>'
			+			'<input type="radio" id="star2" name="rating" value="2"><label for="star2"></label>'
    		+			'<input type="radio" id="star1" name="rating" value="1"><label for="star1"></label>'
    		+		'</div>'
    		+		'<div>'
    		+			'<input id="userName" type="text" placeholder="Votre nom">'		
    		+		'</div>'
    		+		'<div>'
    		+			'<textarea id="newReview" rows="10" placeholder="Votre avis"></textarea>'
    		+		'</div>'
    		+	'</form>'
    		+	'<div class="footer">'
    		+		'<div class="cancel">Annuler</div>'
    		+		'<div class="confirm">Valider</div>'
    		+	'</div>'
    		+'</div>';

		return template;
	}

	/**
	 * Create the content of the modal window which inform users how to add a new restaurant
	 * 
	 * @returns {string} HTML <div>
	 */
	Template.prototype._infoContent = function(){
		let template = 
			 '<div class=information>'
			+  '<h2>Ajouter un restaurant</h2>'
			+	'<div>'
			+ 		'Pour ajouter un restaurant, zoomer et cliquer sur l\'emplacement de votre choix.' 
			+ 		' Si vous souhaitez quitter le mode pour ajouter un restaurant, il faut cliquer à nouveau sur le bouton "ajouter un restaurant".'
			+	'</div>'
			+ 	'<div class="noRepeat">'
			+ 		'<input type="checkbox" id="info" name="info">'
			+		'<label for="info">Ne plus afficher ce message</label>'
			+ 	'</div>'
			+	'<div class="footer">'
    		+		'<div class="confirm">Ok</div>'
    		+	'</div>'
    		+ '</div>';

		return template;
	}

	/**
	 * Create the content of a popup bound to a restaurant's marker
	 * 
	 * @param {string} [name] The restaurant's name
	 * @param {number} [average] The restaurant's average rating
	 * @param {string|number} [id] The restaurant's id
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