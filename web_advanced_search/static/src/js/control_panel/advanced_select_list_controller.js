/* Copyright 2021 Therp BV {https://therp.nl>.
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
 */
odoo.define("web_advanced_search.select_create_list_controller", function (require) {
    "use strict";
    const controller_registry = require("web.select_create_controllers_registry");
    const selectCreateController = controller_registry.SelectCreateListController;

    selectCreateController.include({
        async _update(state, params) {
            return this._super(state, params).then(
                this.trigger_up("controller_update", {state: state})
            );
        },
    });
});
