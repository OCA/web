odoo.define('web_pwa_oca.systray.install', function (require) {
"use strict";

var core = require('web.core');
var session = require('web.session');
var UserMenu = require('web.UserMenu');

var deferredInstallPrompt = null;

if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('/service-worker.js')
        .then(function (reg) {
          console.log('Service worker registered.', reg);
        });
  });
  window.addEventListener(
      'beforeinstallprompt',
      function(event) {
          deferredInstallPrompt = event;
      },
      false
  );
}

function setButtonClass(className) {
    var install_button = document.getElementById("pwa_install_button");
    if (install_button) {
        install_button.className = className;
    }
}

UserMenu.include({

    start: function() {
        var ret = this._super();
        if (deferredInstallPrompt) {
            setButtonClass('');
        }
        return ret;
    },

    on_menu_installpwa: function () {
        // Hide the install button, it can't be called twice.
        setButtonClass('hide');
        // Show the prompt
        deferredInstallPrompt.prompt();
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
