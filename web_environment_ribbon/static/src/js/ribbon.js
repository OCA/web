/* Copyright 2015 Sylvain Calador <sylvain.calador@akretion.com>
   Copyright 2015 Javi Melendez <javi.melendez@algios.com>
   Copyright 2016 Antonio Espinosa <antonio.espinosa@tecnativa.com>
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl). */

odoo.define('web_environment_ribbon.ribbon', function(require) {
"use strict";

var $ = require('$');
var Model = require('web.Model');
var core = require('web.core');

var model = new Model('ir.config_parameter');

// Code from: http://jsfiddle.net/WK_of_Angmar/xgA5C/
function validStrColour(strToTest) {
    if (strToTest === "") { return false; }
    if (strToTest === "inherit") { return true; }
    if (strToTest === "transparent") { return true; }
    var image = document.createElement("img");
    image.style.color = "rgb(0, 0, 0)";
    image.style.color = strToTest;
    if (image.style.color !== "rgb(0, 0, 0)") { return true; }
    image.style.color = "rgb(255, 255, 255)";
    image.style.color = strToTest;
    return image.style.color !== "rgb(255, 255, 255)";
}

core.bus.on('web_client_ready', null, function () {
    var ribbon = $('<div class="test-ribbon"/>');
    $('body').append(ribbon);
    ribbon.hide();
    model.call('get_param', ['ribbon.name']).then(
        function (name) {
            if (name && name != 'False') {
                ribbon.html(name);
                ribbon.show();
            }
        }
    );
    // Get ribbon color from system parameters
    model.call('get_param', ['ribbon.color']).then(
        function (strColor) {
            if (strColor && validStrColour(strColor)) {
                ribbon.css('color', strColor);
            }
        }
    );
    // Get ribbon background color from system parameters
    model.call('get_param', ['ribbon.background.color']).then(
        function (strBackgroundColor) {
            if (strBackgroundColor && validStrColour(strBackgroundColor)) {
                ribbon.css('background-color', strBackgroundColor);
            }
        }
    );
});

}); // odoo.define
