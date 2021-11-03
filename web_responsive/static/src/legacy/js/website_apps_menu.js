/* Copyright 2021 Sergey Shebanin
 * License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl). */

odoo.define("web_responsive.website_apps_menu", function (require) {
    "use strict";
    /*
     * We can't require anything from website here because `web_responsive` doesn't depend on `website`.
     * In this case we will try to get WebsiteNavbar class through the PublicRoot registry.
     * WebsiteNavbar can be unavailable if `website` is not installed. In this case this file do nothing.
     */
    const publicRoot = require("root.widget");
    const lazyloader = require("web.public.lazyloader");
    const registry = publicRoot._getRegistry();

    function patchNavbar() {
        const navbar = registry.get("WebsiteNavbar", false);
        if (!navbar) return false;
        navbar.Widget.include({
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
                const icon = $(
                    document.querySelector("#oe_main_menu_navbar a.full > i")
                );
                icon.removeClass("fa fa-th-large").append(
                    $("<span/>", {class: "fa fa-spin fa-spinner"})
                );
                window.location.href = "/web#home";
                // Prevent dropdown to be showed
                return false;
            },
        });
        const menu = $("#oe_applications");
        menu.addClass("o_responsive_loaded").after(
            "<span class='o_menu_brand'>" + menu.find("a.full").text() + "</span>"
        );
        return true;
    }
    // Try to patch navbar. If it is not in registry - make another try after lazyload
    if (!patchNavbar()) {
        lazyloader.allScriptsLoaded.then(patchNavbar);
    }
});
