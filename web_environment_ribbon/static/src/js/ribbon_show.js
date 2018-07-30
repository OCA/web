/* Copyright 2015 Sylvain Calador <sylvain.calador@akretion.com>
   Copyright 2015 Javi Melendez <javi.melendez@algios.com>
   Copyright 2016 Antonio Espinosa <antonio.espinosa@tecnativa.com>
   Copyright 2017 Thomas Binsfeld <thomas.binsfeld@acsone.eu>
   Copyright 2017 Xavier Jiménez <xavier.jimenez@qubiq.es>
   Copyright 2018 David Arnold <dar@xoe.solutions>
   License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl). */

odoo.define('web_environment_ribbon.ribbon_show', function(require) {
"use strict";

    var core = require('web.core');
    var showRibbon = require('web_environment_ribbon.ribbon');
    core.bus.on('web_client_ready', null, showRibbon);

}); // odoo.define
