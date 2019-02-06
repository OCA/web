/* Copyright 2015 Sylvain Calador <sylvain.calador@akretion.com>
   Copyright 2015 Javi Melendez <javi.melendez@algios.com>
   Copyright 2016 Antonio Espinosa <antonio.espinosa@tecnativa.com>
   Copyright 2017 Thomas Binsfeld <thomas.binsfeld@acsone.eu>
   Copyright 2017 Xavier Jiménez <xavier.jimenez@qubiq.es>
   License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl). */

odoo.define('web_company_background_color.background_color', function(require) {
"use strict";

    var $ = require('jquery');
    var rpc = require('web.rpc');
    var core = require('web.core');

    core.bus.on('web_client_ready', null, function () {
        // Get company background color from backend
        rpc.query({
            model: 'res.company',
            method: 'get_background_color',
        }).then(
            function (background_color) {
                if (background_color) {
                    // Compatibiliy with Odoo Community
                    var el = $('body').find('[class="navbar navbar-inverse"]')
                    el.css('background-color', background_color)
                    el.css('border-left-color', background_color)
                    el.css('border-right-color', background_color)
                    el.css('border-top-color', background_color)
                    el.css('border-bottom-color', background_color)
                    el.css('color', background_color)
                    var el = $('body').find('[class="navbar-collapse collapse"]')
                    el.find('[class="oe_menu_toggler"]').css('background-color', background_color)
                    el.find('[class="dropdown-toggle"]').css('background-color', background_color)
                    // Compatibiliy with Odoo Enterprise
                    $('body').find('[class="o_main_navbar"]').css('background-color', background_color)
                    // Compatibiliy with OCA web_responsive
                    $('body').find('[class="navbar navbar-default main-nav"]').css('background-color', background_color)
                }
            }
        );
    });
});
