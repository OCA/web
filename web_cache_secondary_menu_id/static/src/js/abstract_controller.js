odoo.define("web_cache_secondary_menu_id.AbstractController", function (require) {
    "use strict";

    var AbstractController = require("web.AbstractController");
    var sessionStorage = require("web.sessionStorage");

    AbstractController.include({
        start: function () {
            return this._super.apply(this, arguments).then(function () {
                window.onbeforeunload = function () {
                    // TLDR: Avoid losing URL param on page refresh.
                    // The onbeforeload() event will be executed just before
                    // page reload: we evaluate this sessionStorage key on
                    // doAction (doAction is executed on reload as well)
                    // and will not clear param from URL if found
                    sessionStorage.setItem(
                        "page_reloaded_preserve_secondary_menu",
                        true
                    );
                };
                // Both keys must be removed after the controller is started, so
                // the URL will be cleared when needed
                sessionStorage.removeItem("action_executed_from_secondary_menu_item");
                sessionStorage.removeItem("page_reloaded_preserve_secondary_menu");
            });
        },
    });
});
