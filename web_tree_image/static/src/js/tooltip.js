odoo.define('web_tree_image.web_tree_image', function(require) {
"use strict";

var ListRenderer = require('web.ListRenderer');

	ListRenderer.include({
	    events: _.extend({}, ListRenderer.prototype.events, {
	    	'mouseover tbody tr td .o_field_image': '_onHoverRecord_img',
	    }),
		_onHoverRecord_img: function (event) {
			var img_src = $(event.currentTarget).children('.img-responsive').attr('src')
	    	$(event.currentTarget).tooltip({
	    		title: "<img src="+img_src+" />",
	    		delay: 0,
	    	});
		}
	});
})
