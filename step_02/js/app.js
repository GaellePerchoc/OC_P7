(function(){
	'use strict';

	/** 
	 * Set up the application
	 */
	function App () {
		this.slider = new app.Slider();
		this.template = new app.Template();
		this.model = new app.Model();
		this.view = new app.View(this.template, this.slider);
		this.map = new app.Map()
		this.controller = new app.Controller(this.model,this.view, this.map);
	}

	const restaurant = new App();

	function setView (){
		restaurant.controller.setView();
	}

	window.addEventListener('load', setView);

})();