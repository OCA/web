// Copyright 2021 Tecnativa - Alexandre Díaz
// License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
odoo.define("web_pwa_cache.BasicModel", function(require) {
    "use strict";

    const BasicModel = require("web.BasicModel");

    BasicModel.include({
        /**
         * Set a flag to know if the onchange comes from the service worker
         *
         * @override
         */
        _applyOnChange: function(values, record, viewType) {
            if (
                !_.isEmpty(values) &&
                Object.prototype.hasOwnProperty.call(values, "__is_pwa_sw_onchange")
            ) {
                delete values.__is_pwa_sw_onchange;
                record._onchange_from_sw = true;
            } else {
                record._onchange_from_sw = false;
            }
            return this._super.call(this, values, record, viewType);
        },

        /**
         * Force shadowed rpc when use '__pwa_sw_force_online' context in 'onchange' call
         *
         * @override
         */
        _rpc: function(params, options) {
            const force_sw_online = params.context && params.context.pwa_force_online;
            if (force_sw_online && params.method === "onchange") {
                options = options || {};
                options.shadow = true;
            }

            return this._super.call(this, params, options);
        },
    });
});
