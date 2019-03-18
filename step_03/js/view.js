(function(window){
	'use strict';

	function View (template, slider) {
		this.template = template;
		this.slider = slider;

		this.$listContainer = document.querySelector('#list');
		this.$list = document.querySelector(".list");
		this.$filterMenu = document.querySelector('nav .menu:first-child');
		this.$filterMenuTitle = document.querySelector('nav .menu:first-child .menu-title');
		this.$filterMenuContent = document.querySelector('nav .menu:first-child .submenu');
		this.$addRestaurantButt = document.querySelector('nav .menu:nth-child(2) .menu-title');
		this.$cookieBanner = document.querySelector('#cookieBanner');
		this.$nextButt = document.querySelector('#list .more div');
		this.$previousButt = document.querySelector('#list .less div');
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
			case "addRestaurantMode":
				this._restaurantAddMode(handler.on, handler.off);
				break;
			case "addRestaurantDone": 
				this._addRestaurantDone(handler);
				break;
			case "addRestaurantCancel":
				this._addRestaurantCancel();
				break;
			case "addReviewMode":
				this._reviewAddMode(handler);
				break;
			case "addReviewDone":
				this._addReviewDone(handler);
				break;
			case "addReviewCancel":
				this._addReviewCancel();
				break;
			case "setCookieConsent":
				this._setCookieConsent();
				break;
			case "nextRestaurants": 
				this._nextRestaurants(handler);
				break;
			case "previousRestaurants":
				this._previousRestaurants(handler);
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
				self._scrollTo(self.$listContainer.offsetTop);
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
			if(window.scrollY + header.clientHeight < self.$listContainer.offsetTop - 200){
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
	 * Set the event to enter or cancel the mode to add a new restaurant
	 * 
	 * @param {function} [on] The function to fire to enter into the mode to add a new restaurant after the event occurs
	 * @param {function} [off] The function to fire to cancel the mode to add a new restaurant after the event occurs
	 */
	View.prototype._restaurantAddMode = function(on, off){
		const self = this;
		this.$addRestaurantButt.addEventListener("click", function(){
			if(!self.$addRestaurantButt.classList.contains('add')){
				self.$addRestaurantButt.classList.add('add');
				let cookie = getCookie("showInfo");
				if(!cookie){
					let modal = self.template.info();
					modal.show();
				}
				on();
			} else {
				self.$addRestaurantButt.classList.remove('add');
				off();
			}
		})
	}

	/**
	 * Set the event to confirm the add of a new restaurant
	 *
	 * @param {function} [handler] The function to fire to confirm the add of a new restaurant after the event occurs
	 */
	View.prototype._addRestaurantDone = function(handler){
		let confirm = document.querySelector('.addRestaurant .confirm');
		const self = this;
		if(confirm){
			confirm.addEventListener("click", function(){
				let inputName = document.querySelector('#restaurantName');
				if(inputName.value){
					let restaurant = {
						restaurantName: inputName.value,
						address: document.querySelector('#address').value,
						lat: parseFloat(document.querySelector('#address').dataset.lat),
						long: parseFloat(document.querySelector('#address').dataset.lng),
						id: Date.now().toString(),
						avg: 0,
						user_total: 0,
						ratings: []
					}
					alertify.addRestaurant().close();
					let index = self._getIndex();
					handler(restaurant, index);

				} else {
					inputName.style.borderBottom = '1px solid #f44336';
					inputName.addEventListener('click', function(){
						inputName.style.borderBottom = '1px solid #4E4946';
					})
				}
			})
		}
	}

	/**
	 * Set the event to cancel the add of a new restaurant
	 * 
	 */
	View.prototype._addRestaurantCancel = function(){
		let cancel = document.querySelector('.addRestaurant .cancel');
		cancel.addEventListener("click", function(){
			alertify.addRestaurant().close();
			
		})
	}

	/**
	 * Set the event to enter into the mode to add a new review
	 * 
	 * @param {function} [handler] The function to fire to enter into the mode after the event occurs
	 */
	View.prototype._reviewAddMode = function(handler){
		let addReview = document.querySelector('#addReview');
		addReview.addEventListener('click', function(){
			alertify.details().close();
			handler();
		})
	}

	/**
	 * Set the event to confirm the add of a new review
	 * 
	 * @param {function} [handler] The function to fire to confirme the add of a new review after the event occurs
	 */
	View.prototype._addReviewDone = function(handler){
		const self = this;
		let confirm = document.querySelector('.addReview .confirm');
		confirm.addEventListener("click", function(){
			let userName = document.querySelector('#userName');
			let comment = document.querySelector('#newReview');
			let stars = document.querySelectorAll('.starsRange input[type="radio"]');
			let star;
			stars.forEach(function(s){
				if(s.checked == true){
					star = s.value;
				}
			})
			if(star && userName.value && comment.value){
				let review = {
					stars: parseInt(star),
					userName: userName.value,
					comment: comment.value
				}
				alertify.addReview().close();
				handler(review);
			} else {
				self._addReviewFormControl(userName, comment, star);
			}
		})
	}

	/**
	 * Set the event to cancel the add of a new review
	 * 
	 */
	 
	View.prototype._addReviewCancel = function(){
		let cancel = document.querySelector('.addReview .cancel');
		cancel.addEventListener("click", function(){
			alertify.addReview().close();
			
		})
	}

	/**
	 * Highligh empty required inputs into the form to add a new review
	 * 
	 * @param {element} [userName] Element which hosts the username of the review
	 * @param {element} [comment] Element which hosts the new comment
	 * @param {number | undefined} [star] The rating of the new review if it has been defined
	 */
	View.prototype._addReviewFormControl = function(userName, comment, star){
		if(!userName.value){
			userName.style.borderBottom = '1px solid #f44336';
			userName.addEventListener('click', function(){
				userName.style.borderBottom = '1px solid #4E4946';
			})
		}

		if(!comment.value){
			comment.style.border = '1px solid #f44336';
			comment.addEventListener('click', function(){
				comment.style.border = '1px solid #D6D5D5';
			})
		}

		if(star == undefined){
			let labels = document.querySelectorAll('.starsRange label');
			labels.forEach(function(l){
				l.style.textShadow = '0px 0px 2px #f44336';
			})
					
			let starsRange = document.querySelector('.starsRange');
			starsRange.addEventListener('mouseover', function(){
				labels.forEach(function(l){
					l.style.textShadow = 'none';
				})
			})
		}
	}

	/**
	 * Set the events to get the user agreement of disagreement to use cookies
	 *
	 */
	View.prototype._setCookieConsent = function(){
		let cookie = getCookie('cookie');
		if(!cookie){
			this.$cookieBanner.style.display = "flex";
			this._acceptCookie();
			this._rejectCookie();
		}
	}

	/**
	 * Set the event to get the user agreement to use cookies
	 *
	 */
	View.prototype._acceptCookie = function(){
		const self = this;
		let accept = document.querySelector('#acceptCookie');
		accept.addEventListener("click", function(){
			setCookie("cookie", "ok", 30);
			self.$cookieBanner.style.display = "none";
		})
	}

	/**
	 * Set the event to get the user disagreement to use cookies
	 *
	 */
	View.prototype._rejectCookie = function(){
		const self = this;
		let reject = document.querySelector('#rejectCookie');
		reject.addEventListener("click", function(){
			self.$cookieBanner.style.display = "none";
		})
	}

	/**
	 * Set the event to get the next restaurants
	 * 
	 * @param {function} [handler] The function to fire after the event occurs
	 */
	View.prototype._nextRestaurants = function(handler){
		const self = this;
		this.$nextButt.addEventListener("click", function(e){
			let index = parseInt(e.target.className);
			let sliderValues = self.slider.getValues();
			handler(index, sliderValues);
		})
	}

	/**
	 * Set the event to get the previous restaurants
	 * 
	 * @param {function} [handler] The function to fire after the event occurs
	 */
	View.prototype._previousRestaurants = function(handler){
		const self = this;
		this.$previousButt.addEventListener("click", function(e){
			let index = parseInt(e.target.className);
			let sliderValues = self.slider.getValues();
			handler(index, sliderValues);
		})
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
			case "nextButton":
				this._nextButton(parameter.length, parameter.heap, parameter.index);
				break;
			case "prevButton":
				this._previousButton(parameter.heap, parameter.index);
				break;
			case "addRestaurant":
				this._addRestaurant(parameter);
				break;
			case "addReview":
				this._addReview();
				break;
			case "updateCard": 
				this.template.updateCard(parameter);
				break;
			case "scrollTop":
				this.$list.scrollTop = 0;
				break;
		}
	}

	/**
	 * Reset the restaurant's list
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

	/**
	 * Update the attributes of the next button
	 * 
	 * @param {number} [length] The length of the list of restaurants to display
	 * @param {number} [heap] The bunch of restaurants to display per page
	 * @param {number} [index] The index of the last restaurant displayed from the list
	 */
	View.prototype._nextButton = function(length, heap, index){
		this.$nextButt.className = "";
		if(length > (index + heap)) {
			this.$nextButt.parentNode.style.visibility = "visible";
			this.$nextButt.classList.add('' + (index + heap) + '');
		} else {
			this.$nextButt.parentNode.style.visibility = "hidden";
		}
	}

	/**
	 * Update the attributes of the previous button
	 *
	 * @param {number} [heap] The bunch of restaurants to display per page
	 * @param {number} [index] The index of the first restaurant to displayed
	 */
	View.prototype._previousButton = function(heap, index){
		this.$previousButt.className = "";
		if(index == 0){
			this.$previousButt.parentNode.style.visibility = "hidden";
		} else {
			this.$previousButt.parentNode.style.visibility = "visible";
			this.$previousButt.classList.add('' + (index - heap) + '');
		}
	}

	/**
	 * Display a modal window to add a restaurant
	 *
	 * @param {object} [restaurant] The restaurant to add
	 */
	View.prototype._addRestaurant = function(restaurant){
		let modal = this.template.addRestaurant(restaurant);
		modal.show();
	}

	/**
	 * Display the modal window to add a new review
	 */
	View.prototype._addReview = function(){
		let modal = this.template.addReview();
		modal.show();
	}

	/**
	 * Get the index of the first restaurant shown in the list
	 *
	 * @returns {number} The index of the 
	 */
	View.prototype._getIndex = function(){
		let index = this.$previousButt.className;
		if(index.trim() == ''){
			index = 0;
		} else {
			index = parseInt(index) + 20;
		}
		return index;
	}
	
	window.app = window.app || {};
	window.app.View = View;
})(window);