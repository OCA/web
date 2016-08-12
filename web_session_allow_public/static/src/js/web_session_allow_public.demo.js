/* Copyright 2016 LasLabs Inc.
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
 */

odoo.define('web_session_allow_public.demo', function(require){
  "use strict";

  var Model = require('web.Model');
  var base = require('web_editor.base');
  
  base.ready().done(function() {
    new Model('website.menu')
      .call('search_read', [])
      .then(function(result) {
        console.log('Model call was a success!');
        console.log(result);
      });
  });

});
