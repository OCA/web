odoo.define("web_pwa_cache.ActionManager", function (require) {
    "use strict";

    var ActionManager = require("web.ActionManager");
    require("web.ActWindowActionManager");

    /**
     * Here we try to force use 'formPWA' instead of 'form' in mobiles devices.
     * Thanks to this we don't need define the new view in the actions.
     */
    ActionManager.include({
        /**
         * This is launched when switch the view
         * (for example click on a record in a tree view).
         *
         * @override
         */
        _onSwitchView: function (ev) {
            var controller = this.controllers[ev.data.controllerID];
            var action = this.actions[controller.actionID];
            var view = _.findWhere(action.views, {
                type: ev.data.view_type,
            });
            // Disable/Enable pull to refresh feature
            $(".o_web_client").toggleClass("disable-pull-refresh", view.fieldsView.standalone || false);
            return this._super.apply(this, arguments);
        },

        /**
         * This is launched when switch the controller
         * (for example click on a record in a kanban view).
         * @override
         */
        _switchController: function (action, viewType, viewOptions) {
            var view = _.findWhere(action.views, {
                type: viewType,
            });
            // Disable/Enable pull to refresh feature
            $(".o_web_client").toggleClass("disable-pull-refresh", view.fieldsView.standalone || false);
            return this._super.apply(this, arguments);
        },

        _executeWindowAction: function (action, options) {
            return this._super.apply(this, arguments).then(function (result) {
                if (action.target !== "new") {
                    var views = result.views;
                    // select the first view to display, and optionally the main view
                    // which will be lazyloaded
                    var firstView = options.viewType && _.findWhere(views, {type: options.viewType});
                    if (!firstView) {
                        firstView = views[0];
                    }

                    $(".o_web_client").toggleClass("disable-pull-refresh", firstView.fieldsView.standalone || false);
                }
            })
        },
    });
});
