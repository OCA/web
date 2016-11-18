/* Copyright 2016 LasLabs Inc.
 * License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl.html).
 */

odoo.define('web_session_allow_public.demo', function(require){
  "use strict";

  var Model = require('web.Model');
  var Tour = require("web.Tour");
  var Core = require('web.core');
  
  var _t = Core._t;
  
  Tour.register({
    id: "test_web_session_allow_public",
    name: _t("Demonstrate availability of session"),
    path: '/',
    mode: 'test',
    steps: [
      {
        wait: 5000,
        onload: function() {
          new Model('website.menu')
            .call('search_read', [])
            .then(function(result) {
              console.log('Model call was a success!');
              console.log(result);
            });
        }
      }
    ],
  });

});
