/* Copyright 2021 Sergey Shebanin
 * License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl). */

odoo.define("web_responsive.website_apps", function (require) {
    "use strict";
    /*
     * We can't require anything from website here because `web_responsive` is not depends on `website`.
     * In this case we get NavbarWidget thought the WebRoot registry.
     */
    var publicRoot = require("web.public.root");
    var lazyloader = require("web.public.lazyloader");

    lazyloader.allScriptsLoaded.then(function () {
        var registry = publicRoot.publicRootRegistry.get();
        var navbar = registry.filter((item) => item.selector == "#oe_main_menu_navbar");
        if (navbar.length == 0) return;
        navbar[0].Widget.include({
            /**
             * Convert Apps Menu UI from JS cause we don't depend on `website` so standard way is not ours.
             * @override
             */
            start: function () {
                var menu = this.$el.find("#oe_applications");
                menu.addClass("o_responsive_loaded").after(
                    "<span class='o_menu_brand'>" +
                        menu.find("a.full").text() +
                        "</span>"
                );
                return this._super.apply(this, arguments);
            },
            /**
             * We don't need to load app menus
             * @override
             */
            async _loadAppMenus() {
                return Promise.resolve();
            },
            /**
             * We add a spinner for the user to understand the loading
             * @override
             */
            _onOeApplicationsShow: function () {
                var icon = $(document.querySelector("#oe_main_menu_navbar a.full > i"));
                icon.removeClass("fa fa-th-large").append(
                    $("<span/>", {class: "fa fa-spin fa-spinner"})
                );
                window.location.href = "/web#home";
                // Prevent dropdown to be showed
                return false;
            },
        });
    });
});
