(function(window){
	'use strict';

	function Slider () {
		this.$slider = document.getElementById('slider');						
  		this.$labels = document.querySelectorAll('.slider-labels li');

  		this._create();				
	}

	/**
	 * Instanciation of the double range slider
	 */
	Slider.prototype._create = function(){
		noUiSlider.create(this.$slider, {					
	    	start: [0, 5],									
	    	step: 1,									
	    	range: {										
	      	'min': [0],
	      	'max': [5]
	    	},
			format: wNumb({									
				decimals: 0,
			}),
	    	connect: true								
	  	});	

	  	this._activeValues();
	}

	/**
	 * Highlight the active values of the filter after the event 'update' occurs on it
	 */
	Slider.prototype._activeValues = function(){
		const self = this;
		this.$slider.noUiSlider.on('update', function(){
			
			self.$labels.forEach(function(li){
				li.classList.remove('active');
			})	

			self.$min = document.getElementById('value_0' + Math.round(self.getValues()[0]));
  			self.$max = document.getElementById('value_0' + Math.round(self.getValues()[1]));
			self.$min.classList.add('active');
			self.$max.classList.add('active');

		})	
	}

	/**
	 * Return the active values of the filter
	 */
	Slider.prototype.getValues = function(){
		this.values = this.$slider.noUiSlider.get();
		return this.values;
	}

	/**
	 * Define the 'change' event
	 * 
	 * @param {function} [handler] The function to fire when the event 'change' occurs
	 */
	Slider.prototype.changeValues = function(handler){
		const self = this;
		this.$slider.noUiSlider.on('change', function(){
			handler({
				min: self.getValues()[0],
				max: self.getValues()[1]
			});
		});
	}

	window.app = window.app || {};
	window.app.Slider = Slider;
})(window);