"use strict";
/* eslint strict: ["error", "global"] */
/* eslint-disable no-undef, no-implicit-globals, no-unused-vars */
/* Copyright 2020 Tecnativa - Alexandre D. Díaz
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). */


const SWComponent = OdooClass.extend(ParentedMixin, {

    /**
     * @param {OdooClass} parent
     */
    init: function (parent) {
        ParentedMixin.init.call(this);
        this.setParent(parent);
    },

    /**
     * @override
     */
    setParent: function (parent) {
        ParentedMixin.setParent.call(this, parent);
        this._odoodb = parent._odoodb;
        this._db = parent._db;
        this._cache = parent._cache;
        this._rpc = parent._rpc;
    },

    /**
     * @returns {Promise}
     */
    start: function () {
        return Promise.resolve();
    },

    /**
     * Wrapper
     * @returns {Promise}
     */
    isOfflineMode: function () {
        return this.getParent().config.isOfflineMode();
    },
});
