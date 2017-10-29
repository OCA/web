/**
*    Copyright 2013 Matthieu Moquet
*    Copyright 2016-2017 LasLabs Inc.
*    Version 2.0.1
*    License MIT (https://opensource.org/licenses/MIT)
**/

(function() {
	'use strict';

	Darkroom.Plugin = Plugin;

	// Define a plugin object. This is the (abstract) parent class which
	// has to be extended for each plugin.
	function Plugin(darkroom, options) {
		this.darkroom = darkroom;
		this.options = Darkroom.Utils.extend(options, this.defaults);
		this.initialize();
	}

	Plugin.prototype = {
		defaults: {},
		initialize: function() { /* no-op */ }
	};

	// Inspired by Backbone.js extend capability.
	Plugin.extend = function(protoProps) {
		var parent = this;
		var child;

		if (protoProps && protoProps.hasOwnProperty('constructor')) {
			child = protoProps.constructor;
		} else {
			child = function() { return parent.apply(this, arguments); };
		}

		Darkroom.Utils.extend(child, parent);

		var Surrogate = function() { this.constructor = child; };
		Surrogate.prototype = parent.prototype;
		child.prototype = new Surrogate();

		if (protoProps) Darkroom.Utils.extend(child.prototype, protoProps);
		child.__super__ = parent.prototype;

		return child;
	};
})();
