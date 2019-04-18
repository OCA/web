/* Copyright 2019 Alexandre Díaz <dev@redneboa.es>
   License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl). */
odoo.define('web_company_title.TitleChanger', function (require) {
    "use strict";

    var rpc = require('web.rpc');
    var core = require('web.core');
    var session = require('web.session');
    var web_client = require('web.web_client');

    core.bus.on('web_client_ready', null, function () {
        rpc.query({
            model: 'res.company',
            method: 'search_read',
            args: [[['id', '=', session.company_id]], ['name']],
        }).then(function (companies) {
            web_client.set_title_part('company', companies[0].name);
        });
    });

});
