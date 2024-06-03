odoo.define("web_responsive_cache_secondary_menu_id.AppsMenu", function (require) {
    "use strict";

    var AppsMenu = require("web.AppsMenu");
    var sessionStorage = require("web.sessionStorage");
    require("web_responsive");

    AppsMenu.include({
        /**
         * Immediately update URL when opening a main app by
         * clicking on widget "web_responsive.AppIcon". Without
         * this override you would only be able to retrieve the
         * menu ID from URL after do_push_state() execution.
         *
         * @override
         */
        _onAppsMenuItemClicked: function (ev) {
            var url = window.location.href;
            var searchParams = new URLSearchParams(url.split("#")[1]);
            var eventData = ev.currentTarget.dataset;
            if (eventData.menuId) {
                searchParams.set("menu_id", eventData.menuId);
                var new_url = url.split("#")[0] + "#" + searchParams.toString();
                window.history.pushState({}, "", new_url);
            }
            this._super.apply(this, arguments);
        },

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
