/* Copyright 2021 Therp BV {https://therp.nl>.
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
 */

odoo.define("web_advanced_search.select_create_list_controller", function (require) {
    "use strict";
    require("web.view_dialogs");
    var controller_registry = require("web.select_create_controllers_registry");
    require("web._select_create_controllers_registry");
    var selectCreateController = controller_registry.SelectCreateListController;
    
    selectCreateController.include({
        async _update(state, params) {
            return this._super(state, params).then(
                this.trigger_up("controller_update", {state: state})
            );
        },
    });
});
