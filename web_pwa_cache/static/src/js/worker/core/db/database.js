/* Copyright 2020 Tecnativa - Alexandre D. Díaz
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). */

odoo.define("web_pwa_cache.PWA.core.db.Database", function (require) {
    "use strict";

    const ParentedMixin = require('web.mixins').ParentedMixin;
    const OdooClass = require("web.Class");


    const Database = OdooClass.extend(ParentedMixin, {

        /**
         * @param {OdooClass} parent
         */
        init: function (parent, db_name) {
            ParentedMixin.init.call(this);
            this.setParent(parent);
            this._db_name = db_name;
        },

        /**
         * @override
         */
        setParent: function (parent) {
            ParentedMixin.setParent.call(this, parent);
        },

        /**
         * @param {Function} onupgradedb
         * @returns {Promise}
         */
        start: function (onupgradedb) {
            return Promise.resolve();
        },

        getDB: function () {
            throw new Error("Not implemented!");
        },
    });

    return Database;

 });
