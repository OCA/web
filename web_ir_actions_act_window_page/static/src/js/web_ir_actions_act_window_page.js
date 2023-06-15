// Coding: utf-8
// (c) 2013-2015 Therp BV (<http://therp.nl>)
// (c) 2023 Hunki Enterprises BV (<https://hunki-enterprises.com>)
// License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html)
odoo.define("web.ir_actions_act_window_page", function(require) {
    "use strict";
    var ActionManager = require("web.ActionManager");
    ActionManager.include({
        _handleAction: function(action, options) {
            if (action.type === "ir.actions.act_window.page.prev") {
                return this._executeWindowActionPage(action, options, -1);
            }
            if (action.type === "ir.actions.act_window.page.next") {
                return this._executeWindowActionPage(action, options, 1);
            }
            return this._super.apply(this, arguments);
        },
        _executeWindowActionPage: function(action, options, direction) {
            const controller = this.getCurrentController();
            if (controller && controller.widget && controller.widget.pager) {
                if (
                    this.controllerStack.length > 1 &&
                    controller.widget.pager.state.size === 0
                ) {
                    // If whatever happened in the button action made the last record inaccessible
                    // switch back to the tree view
                    return this._restoreController(this.controllerStack.at(-2));
                }
                controller.widget.pager[direction > 0 ? "next" : "previous"]();
            }
            if (options && options.on_close && options.on_close.name !== "reload") {
                // Suppress reloads as the pager does it
                options.on_close();
            }
            return Promise.resolve();
        },
    });
});
