/* Copyright 2020 Tecnativa - Alexandre D. Díaz
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). */

odoo.define("web_pwa_cache.PWA.components.Component", function(require) {
    "use strict";

    const ParentedMixin = require("web.mixins").ParentedMixin;
    const OdooClass = require("web.Class");

    const SWComponent = OdooClass.extend(ParentedMixin, {
        /**
         * @param {OdooClass} parent
         */
        init: function(parent) {
            ParentedMixin.init.call(this);
            this.setParent(parent);
        },

        /**
         * @override
         */
        setParent: function(parent) {
            ParentedMixin.setParent.call(this, parent);
            this._db = parent._db;
            this._cache = parent._cache;
            this._sync = parent._managers.sync;
            this._config = parent._managers.config;
        },

        /**
         * @returns {Promise}
         */
        start: function() {
            return Promise.resolve();
        },

        /**
         * Wrapper
         * @returns {Promise}
         */
        isOfflineMode: function() {
            return this._config.isOfflineMode();
        },
    });

    return SWComponent;
});
