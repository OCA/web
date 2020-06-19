odoo.define("web_pwa_oca.systray.install", function(require) {
    "use strict";

    var UserMenu = require("web.UserMenu");

    if ("serviceWorker" in navigator) {
        window.addEventListener("load", function() {
            navigator.serviceWorker.register("/service-worker.js").then(function(reg) {
                console.log("Service worker registered.", reg);
            });
        });
    }

    var deferredInstallPrompt = null;

    UserMenu.include({
        start: function() {
            window.addEventListener(
                "beforeinstallprompt",
                this.saveBeforeInstallPromptEvent
            );
            return this._super.apply(this, arguments);
        },
        saveBeforeInstallPromptEvent: function(evt) {
            deferredInstallPrompt = evt;
            this.$.find("#pwa_install_button")[0].removeAttribute("hidden");
        },
        _onMenuInstallpwa: function() {
            deferredInstallPrompt.prompt();
            // Hide the install button, it can't be called twice.
            this.el.setAttribute("hidden", true);
            // Log user response to prompt.
            deferredInstallPrompt.userChoice.then(function(choice) {
                if (choice.outcome === "accepted") {
                    console.log("User accepted the A2HS prompt", choice);
                } else {
                    console.log("User dismissed the A2HS prompt", choice);
                }
                deferredInstallPrompt = null;
            });
        },
    });
});
