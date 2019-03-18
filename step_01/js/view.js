(function(window){
	'use strict';

	function View (template, slider) {
		this.template = template;
		this.slider = slider;

		this.$list = document.querySelector("#list");
		this.$filterMenu = document.querySelector('.menu');
		this.$filterMenuTitle = document.querySelector('.menu-title');
		this.$filterMenuContent = document.querySelector('.submenu');
		this.$scroll = document.querySelector('#scroll');

		this.scrollCount = 0;
	}

	/**
	 * Bind each event which could happen into the view with the corresponding handler
	 * 
	 * @param {string} [event] 
	 * @param {function} [handler] 
	 * @param {string|number} [parameter] Optional
	 */
	View.prototype.bind = function(event, handler, parameter){
		switch(event){
			case "openFilter":
				this._openFilter();
				break;
			case "setFilter":
				this.slider.changeValues(handler);
				break;
			case "scroll":
				this._scrollOnClick();
				this._buttOnScroll();
				break;
			case "getReviews":
				this._getReviews(handler);
				break;
			case "getPicture":
				this._getPicture(handler);
				break;
			case "mouseOverCard":
				this._mouseOverCard(handler);
				break;
			case "mouseLeaveCard":
				this._mouseLeaveCard(handler, parameter);
				break;
		}
	}


	/**
	 * Set the event to open the filter
	 */
	View.prototype._openFilter = function(){
		const self = this;
		this.$filterMenuTitle.addEventListener("click", function(e){
			self.$filterMenuContent.classList.toggle('show');
			self.$filterMenuContent.addEventListener("mouseleave", function(){
				self.$filterMenuContent.classList.remove('show');
			})
			self.$filterMenu.addEventListener("mouseleave", function(){
				self.$filterMenuContent.classList.remove('show');
			})
		})
	}

	/**
	 * Scroll to the list or the map when user clicks on the scroll button
	 */
	View.prototype._scrollOnClick = function(){
		const self = this;
		this.$scroll.addEventListener("click", function(){
			if(self.scrollCount == 1){
				self._scrollTo(0);
			} else if(self.scrollCount == 0){
				self._scrollTo(self.$list.offsetTop);
			}
		})
	}

	/**
	 * Scroll to a specific location on the page
	 *
	 * @param {number} [top] The top property
	 */
	View.prototype._scrollTo = function(top) {
		window.scroll({
			behavior:'smooth',
			left:0,
			top:top
		})
	}
	
	/**
	 * On scroll, update the scroll button's appearance
	 */
	View.prototype._buttOnScroll = function(){
		const self = this;
		let header = document.querySelector('header');
		document.addEventListener('scroll', function(){
			if(window.scrollY + header.clientHeight < self.$list.offsetTop - 200){
				self.$scroll.classList.remove('up');
				self.$scroll.classList.add('down');
				self.scrollCount = 0;
			} else {
				self.$scroll.classList.remove('down');
				self.$scroll.classList.add('up');
				self.scrollCount = 1;
			}
		})
	}

	/**
	 * Set the event to get the reviews of a restaurant
	 *
	 * @param {function} [handler] The function to fire after the event occurs
	 */
	View.prototype._getReviews = function(handler){
		const self = this;
		this.$list.addEventListener("click", function(e){
			if(e.target.id.trim() != ''){
				handler(e.target.id);
			}
			
		})
	}

	/**
	 * Set the event to get the picture of a restaurant
	 * 
	 * @param {function} [handler] The function to fire after the event occurs
	 */
	View.prototype._getPicture = function(handler){
		let image = document.querySelector('#picture');
		image.addEventListener('click', function(){
			handler();
		})
	}

	/**
	 * Set the event that occurs when mouse is over a card
	 * 
	 * @param {function} [handler] The function to fire after the event occurs 
	 */
	View.prototype._mouseOverCard = function(handler){
		const self = this;
		this.$list.addEventListener("mouseover", function(e){
			if(e.target.id.trim() != ''){
				self.render("cardHovered", e.target.id);
				handler(e.target.id);
			}
		})
	}

	/**
	 * Set the event that occurs when mouse leave a card
	 * 
	 * @param {function} [handler] The function to fire after the event occurs
	 */
	View.prototype._mouseLeaveCard = function(handler, id){
		const self = this;
		let card = document.querySelector('.card' + id);
		if (card){
			card.addEventListener("mouseleave", function(e){
				self.render("cardNormal", id);
				handler(id);
			})
		}
	}

	/**
	 * Render the specified command with the given parameter
	 *
	 * @param {string} [command]
	 * @param {object} [parameter] Optionnal
	 */
	View.prototype.render = function(command, parameter){
		switch(command){
			case "resetList":
				this._resetList();
				break;
			case "showCard": 
				this._showCard(parameter);
				break;
			case "showReviews": 
				this._showReviews(parameter);
				break;
			case "showPicture":
				this._showPicture(parameter.name, parameter.src);
				break;
			case "popup":
				return this.template.popup(parameter.name, parameter.average, parameter.id);
				break;
			case "cardHovered":
				this._highlightCard(parameter);
				break;
			case "cardNormal":
				this._idleCard(parameter);
				break;
		}
	}

	/**
	 * Reset the list of restaurants
	 */
	View.prototype._resetList = function(){
		this.$list.innerHTML = " ";
	}

	/**
	 * Display the card of a restaurant
	 *
	 * @param {object} [restaurant] The restaurant
	 */
	View.prototype._showCard = function(restaurant){
		let card = this.template.card(restaurant);
		this.$list.appendChild(card);
	}

	/**
	 * Display a modal window which contains the restaurant's reviews
	 *
	 * @param {object} [restaurant] The restaurant to display
	 */
	View.prototype._showReviews = function(restaurant){
		let modal = this.template.details(restaurant);
		modal.show(); 
	}

	/**
	 * Display a modal window which contains the picture of a restaurant
   	 *
	 * @param {string} [name] The restaurant's name
	 * @param {string} [src] The link of the restaurant's picture
	 */
	View.prototype._showPicture = function(name, src){
		let modal = this.template.picture(name, src);
		modal.show()
	}

	/**
	 * Change the looking of a card when user put the cursor over the bound marker
	 *
	 * @param {string|number} [id] The restaurant's id
	 */
	View.prototype._highlightCard = function(id){
		let card = document.querySelector(".card" + id);
		if(card){
			card.style.boxShadow = "0px 0px 5px #D4D5D5";
			card.style.background = "#F5F5F5"; 
		}
	}

	/**
	 * Change the looking of a card when user's cursor leave the bound marker
	 *
	 * @param {string|number} [id] The restaurant's id
	 */
	View.prototype._idleCard = function(id){
		let card = document.querySelector(".card" + id);
		if(card){
			card.style.boxShadow = "none";
			card.style.background = "#FFF"; 
		}
	}

	window.app = window.app || {};
	window.app.View = View;
})(window);