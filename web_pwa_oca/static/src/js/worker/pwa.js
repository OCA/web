"use strict";
/* eslint strict: ["error", "global"] */
/* eslint-disable no-undef, no-empty-function, no-implicit-globals,
no-unused-vars */
/* Copyright 2020 Tecnativa - Alexandre D. Díaz
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). */

/**
 * Services workers are a piece of software separated from the user page.
 * Here can't use 'Odoo Bootstrap', so we can't work with 'require' system.
 * When the service worker is called to be installed from the "pwa_manager"
 * this class is instantiated.
 */
var PWA = OdooClass.extend({

    // eslint-disable-next-line
    init: function (params) {
        // To be overridden
    },

    /**
     * @returns {Promise}
     */
    installWorker: function () {
        return Promise.resolve();
    },

    /**
     * @returns {Promise}
     */
    activateWorker: function () {
        return Promise.resolve();
    },

});
