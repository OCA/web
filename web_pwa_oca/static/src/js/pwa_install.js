/* Copyright 2020 Lorenzo Battistini @ TAKOBI
   Copyright 2020 Tecnativa - Alexandre D. Díaz
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). */

odoo.define('web_pwa_oca.systray.install', function (require) {
    "use strict";

    var UserMenu = require('web.UserMenu');
    var WebClientObj = require("web.web_client");


    UserMenu.include({

        /**
         * We can't control if the UserMenu is loaded berfore PWA manager...
         * So check if need unhide the user menu options to install the PWA.
         *
         * @override
         */
        start: function () {
            var self = this;
            return this._super.apply(this, arguments).then(function () {
                if (WebClientObj.pwa_manager.canBeInstalled()) {
                    self.$el.find('#pwa_install_button')[0]
                        .removeAttribute('hidden');
                }
            });
        },

        /**
         * Handle 'Install PWA' user menu option click
         *
         * @private
         */
        _onMenuInstallpwa: function () {
            WebClientObj.pwa_manager.install();
        },
    });

});
