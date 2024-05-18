odoo.define("web_cache_secondary_menu_id.ActionManager", function (require) {
    "use strict";

    var ActionManager = require("web.ActionManager");
    var sessionStorage = require("web.sessionStorage");

    ActionManager.include({
        /*
         * The "easiest" way to achieve a consistent caching is to clear the
         * URL parameter "secondary_menu_id" every time an action is executed
         * and prevent it on specific case, instead of managing specific case
         * when it has to be cleared.
         *
         * Common case for clearing parameter is when user switch to another
         * APP menu. That is easy to intercept but it's harder to understand
         * when user trigger any action from a non-secondary menu item (e.g.
         * from the contextual action button) and even harder when user gets
         * simply redirected to another action by a generic button or link.
         *
         * In order to preserve the URL param we make use of:
         * - specific checks that depends from the requested action properties
         * - sessionStorage keys that are set when specific events are triggered.
             These keys will be propagated through the whole doAction process,
             then cleared after controller started
         */
        doAction: function (action) {
            // Check cases when param should not be cleared
            var action_executed_from_secondary_menu_item = sessionStorage.getItem(
                "action_executed_from_secondary_menu_item"
            );
            var action_should_preserve_secondary_menu = this._onActionPreserveSecondaryMenuParam(
                action
            );
            var preserve_reload = sessionStorage.getItem(
                "page_reloaded_preserve_secondary_menu"
            );

            if (
                !action_executed_from_secondary_menu_item &&
                action_should_preserve_secondary_menu === false &&
                !preserve_reload
            ) {
                // No reason to preserve URL "secondary_menu_id" parameter, clear it
                var url = window.location.href;
                var searchParams = new URLSearchParams(url.split("#")[1]);
                searchParams.delete("secondary_menu_id");
                var new_url = url.split("#")[0] + "#" + searchParams.toString();
                window.history.pushState({}, "", new_url);
            }
            return this._super.apply(this, arguments);
        },

        /*
         * In some cases even if the action isn't triggered by
         * a secondary menu click we still want to preserve
         * the menu reference in the URL. This method is build
         * to check the case depending on action parameters.
         * Will return true when the URL param must be preserved,
         * otherwise returns false.
         */
        _onActionPreserveSecondaryMenuParam: function (action) {
            if (!(typeof action === "object")) {
                // Could be object, string or int
                return false;
            }
            if (
                (action.target && action.target.toLowerCase() === "new") ||
                (action.type &&
                    action.type.toLowerCase() === "ir.actions.act_window_close")
            ) {
                // Preserve secondary menu ID param when target is new or type is "window close":
                // this should cover cases where user open a wizard then close it without any
                // kind of redirection, as in this case the user is still in the same menu
                return true;
            }
            return false;
        },
    });
});
