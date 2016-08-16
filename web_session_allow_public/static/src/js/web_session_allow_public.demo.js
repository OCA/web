/* Copyright 2016 LasLabs Inc.
 * License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl.html).
 */

odoo.define('web_session_allow_public.demo', function(require){
  "use strict";

  var Model = require('web.DataModel');
  var base = require('web_editor.base');
  
  base.ready().done(function() {
    new Model('website.menu')
      .query(['name'])
      .limit(1)
      .all()
      .then(function(result) {
        console.log('Model call was a success!');
        console.log(result);
      });
  });

});
