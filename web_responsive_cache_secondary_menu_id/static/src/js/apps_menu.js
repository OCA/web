odoo.define("web_responsive_cache_secondary_menu_id.AppsMenu", function (require) {
    "use strict";

    var AppsMenu = require("web.AppsMenu");
    var sessionStorage = require("web.sessionStorage");
    require("web_responsive");

    AppsMenu.include({
        /*
         * Manage URL parameter "secondary_menu_id" when clicking
         * on widget "web_responsive.MenuSearchResults"
         */
        _searchResultChosen: function (event) {
            var url = window.location.href;
            var searchParams = new URLSearchParams(url.split("#")[1]);
            var eventData = event.currentTarget.dataset || event.target.dataset;
            if (eventData.parentId) {
                // Clicked on a secondary menu: update URL
                var secondary_menu_id = eventData.menuId;
                searchParams.set("secondary_menu_id", secondary_menu_id);
                var new_url = url.split("#")[0] + "#" + searchParams.toString();
                window.history.pushState({}, "", new_url);
                // Set session key in order to bypass parameter delete in doAction()
                sessionStorage.setItem(
                    "action_executed_from_secondary_menu_item",
                    true
                );
            } else if (!eventData.parentId && searchParams.get("secondary_menu_id")) {
                // Not a secondary menu: clear param if still in the URL
                searchParams.delete("secondary_menu_id");
                var new_url = url.split("#")[0] + "#" + searchParams.toString();
                window.history.pushState({}, "", new_url);
            }
            this._super.apply(this, arguments);
        },
    });
});
