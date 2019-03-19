(function (window) {
	'use strict';

	/**
	 * Get the cookie
	 *
	 * @global
	 * @param {string} name The cookie's name
	 * @returns {string} The cookie || An empty string
	 */
	window.getCookie = function (name) {
		let cname = name + "=";
	    let decodedCookie = decodeURIComponent(document.cookie);
	    let ca = decodedCookie.split(';');
	    for(let i = 0; i < ca.length; i++) {
	        let c = ca[i];
	        while (c.charAt(0) == ' ') {
	            c = c.substring(1);
	        }
		    if (c.indexOf(cname) == 0) {
	            return c.substring(cname.length, c.length);
	        }
	    }

	    return "";
	}

	/**
	 * Set a cookie
	 *
	 * @global
	 * @param {object} name - The cookie's name
	 * @param {function} value - The cookie's value
	 * @param {number} days - The number of days the cookie would be set
	 */
	window.setCookie = function(name, value, days){
		let d = new Date();
		d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
		let expires = "expires="+ d.toUTCString();
		document.cookie = name + "=" + value + ";" + expires + ";path/=";
	}

	/**
	 * Delete a cookie
	 *
	 * @global
	 * @param {string} name - The cookie's name
	 */
	window.eraseCookie = function (name){
		setCookie(name, "", -1);
	}

})(window);