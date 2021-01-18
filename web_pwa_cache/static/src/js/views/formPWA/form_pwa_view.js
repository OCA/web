// Copyright 2020 Tecnativa - Alexandre Díaz
// License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
odoo.define("web_pwa_cache.FormPWAView", function (require) {
    "use strict";

    var FormView = require("web.FormView");
    var FormPWARenderer = require("web_pwa_cache.FormPWARenderer");
    var FormPWAController = require("web_pwa_cache.FormPWAController");
    var ViewRegistry = require("web.view_registry");
    var core = require("web.core");

    var _lt = core._lt;

    var FormPWAView = FormView.extend({
        config: _.extend({}, FormView.prototype.config, {
            Renderer: FormPWARenderer,
            Controller: FormPWAController,
        }),
        viewType: "formPWA",
        display_name: _lt("Form PWA"),
        icon: "fa-mobile",
        mobile_friendly: true,
    });

    ViewRegistry.add("formPWA", FormPWAView);

    return FormPWAView;
});
