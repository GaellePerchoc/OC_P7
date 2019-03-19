/** @namespace */
(function(){
	'use strict';

	/** 
	 * Set up the application.
	 * 
	 * @namespace
	 * @alias window.App
	 * @class
	 */
	function App () {
		this.slider = new app.Slider();
		this.template = new app.Template();
		this.storage = new app.Storage();
		this.model = new app.Model(this.storage);
		this.view = new app.View(this.template, this.slider);
		this.map = new app.Map()
		this.controller = new app.Controller(this.model, this.view, this.map);
	}

	const restaurant = new App();

	function setView (){
		restaurant.controller.setView();
	}

	window.addEventListener('load', setView);

})();