odoo.define('web_notify.NotificationService', function (require) {
"use strict";

 	require('bus.BusService');

	var NotificationService = require('web.NotificationService');

	NotificationService.include({

		notify: function (params) {
			if (params.title.constructor == Object) {
			      var notif_datas = params.title;
			      params.type = notif_datas.type;
			      params.message = notif_datas.message;
			      params.sticky = notif_datas.sticky;
			      params.className = notif_datas.className;
			      params.title = notif_datas.title;
			      
			}; 	
			return this._super.apply(this, arguments);
			
		},

	});

});

