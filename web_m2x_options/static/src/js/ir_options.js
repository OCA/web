/* Copyright 2020 Tecnativa - Carlos Roca
 *  * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl). */
odoo.define('web_m2x_options.ir_options', function (require) {
    "use strict";

    var rpc = require('web.rpc');

    return rpc.query({
        model: "ir.config_parameter",
        method: 'get_web_m2x_options',
    });
});
