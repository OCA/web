odoo.define("web_advanced_search.AdvancedSelectDialog", function (require) {
    "use strict";

    const { _lt, _t } = require("web.core");
    const Context = require("web.Context");
    const dialogs = require("web.view_dialogs");

    const AdvancedSelectDialog = dialogs.SelectCreateDialog.extend({
        /**
        * prepare buttons for dialog footer based on options
        *
        * Fully overide funtion to just show Select and Use Criteria.
        *
        * @private
        */
        _prepareButtons: function () {
            this.__buttons = [
                {
                    text: _t("Select"),
                    classes: "btn-primary o_select_button",
                    disabled: true,
                    close: true,
                    click: function () {
                        const records = this.viewController.getSelectedRecords();
                        const ids = records.map(record => record.res_id);
                        const names = records.map(record => record.data.display_name);
                        this.trigger_up(
                            "domain_selected",
                            { domain: [['id', 'in', ids]], names: names }
                        );
                    },
                },
                {
                    text: _t("Use criteria"),
                    classes: "btn-primary",
                    // TODO: get somehow the criteria selected...
                    click: this.create_edit_record.bind(this)
                },
                {
                    text: _t("Cancel"),
                    classes: "btn-secondary o_form_button_cancel",
                    close: true,
                },
            ];
        },
    });

    return {
        AdvancedSelectDialog: AdvancedSelectDialog
    };
});
