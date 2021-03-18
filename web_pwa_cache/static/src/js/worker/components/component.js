/* Copyright 2020 Tecnativa - Alexandre D. Díaz
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). */

odoo.define("web_pwa_cache.PWA.components.SWComponent", function(require) {
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
            this._odoodb = this.getParent()._odoodb;
            this._db = this.getParent()._db;
            this._dbmanager = this.getParent()._dbmanager;
            this._cache = this.getParent()._cachemanager;
            this._rpc = this.getParent()._rpc;
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
            return this.getParent().config.isOfflineMode();
        },
    });

    return SWComponent;
});
