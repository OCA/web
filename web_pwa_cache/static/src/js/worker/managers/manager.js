/* Copyright 2021 Tecnativa - Alexandre D. Díaz
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). */

odoo.define("web_pwa_cache.PWA.managers.Manager", function(require) {
    "use strict";

    const ParentedMixin = require("web.mixins").ParentedMixin;
    const OdooClass = require("web.Class");

    const SWManager = OdooClass.extend(ParentedMixin, {
        /**
         * @param {OdooClass} parent
         * @param {Object} options
         */
        init: function(parent, options) {
            this.setParent(parent);
            this.options = options || {};
            this._db = this.options.db || parent._db;
        },

        /**
         * @returns {Promise}
         */
        install: function() {
            return Promise.resolve();
        },

        /**
         * @returns {Promise}
         */
        start: function() {
            return Promise.resolve();
        },

        /**
         * @returns {Promise}
         */
        sendToPages: function() {
            return Promise.resolve();
        },

        /**
         * @returns {Boolean}
         */
        isActivated: function() {
            return this.getParent().isActivated();
        },
    });

    return SWManager;
});
