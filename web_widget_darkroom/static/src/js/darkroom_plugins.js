/* Copyright 2016 LasLabs Inc.
 * License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl.html).
 */

odoo.define('web_widget_darkroom.darkroom_plugins', function(require){
  "use strict";
  
  var DarkroomPlugins = Object;
  DarkroomPlugins.extend = function(destination, source) {
    for (var property in source) {
      if (source.hasOwnProperty(property)) {
        destination[property] = source[property];
      }
    }
    return destination;
  };
  
  return DarkroomPlugins
  
});
