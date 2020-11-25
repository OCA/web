odoo.define('web_pwa_oca.systray.install', function (require) {
"use strict";

var core = require('web.core');
var session = require('web.session');
var UserMenu = require('web.UserMenu');

if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('/service-worker.js')
        .then(function (reg) {
          console.log('Service worker registered.', reg);
        });
  });
}

var deferredInstallPrompt = null;

UserMenu.include({

    start: function () {
        window.addEventListener('beforeinstallprompt', this.saveBeforeInstallPromptEvent, false);
        return this._super.apply(this, arguments);
    },

   saveBeforeInstallPromptEvent: function(event) {
        deferredInstallPrompt = event;
    },

    on_menu_installpwa: function () {

        deferredInstallPrompt.prompt();
        // Hide the install button, it can't be called twice.
        this.$('a[data-menu="installpwa"]').addClass('hidden');
        // Log user response to prompt.
        deferredInstallPrompt.userChoice
            .then(function (choice) {
              if (choice.outcome === 'accepted') {
                console.log('User accepted the A2HS prompt', choice);
              } else {
                console.log('User dismissed the A2HS prompt', choice);
              }
              deferredInstallPrompt = null;
            });
    },
});

});
