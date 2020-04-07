/* Copyright 2020 Trobz
   License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl). */
odoo.define("web_float_time_openchatter", function (require) {
  "use strict";

  var Message = require('mail.model.Message');
  var time_utils = require('web.field_utils');

  Message.include({
    _processTrackingValues: function () {
      this._super.apply(this, arguments);
      if (this.hasTrackingValues()) {
        _.each(this.getTrackingValues(), function (trackingValue) {
          if (trackingValue.field_type === 'float') {
            // If field uses `float_time` widget
            var _field_name = self.document.getElementsByName(trackingValue.field_name);
            if (_field_name.length > 0 && _field_name[0].textContent.includes(':')) {
              trackingValue.new_value = time_utils.format.float_time(trackingValue.new_value);
              trackingValue.old_value = time_utils.format.float_time(trackingValue.old_value);
            }
          }
        });
      }
    },
  })

});