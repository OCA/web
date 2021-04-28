// Copyright 2021 Tecnativa - Alexandre Díaz
// License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
odoo.define("web_widget_one2many_product_picker.BasicController", function(require) {
    "use strict";

    const BasicController = require("web.BasicController");

    BasicController.include({
        /**
         * This is necessary to refresh 'one2many_product_picker' when some 'trigger_refresh_fields' fields changes.
         *
         * @override
         */
        _confirmChange: function(id, fields, e) {
            return this._super.apply(this, arguments).then(() => {
                const product_picker_widgets = _.filter(
                    this.renderer.allFieldWidgets[this.handle],
                    item => item.attrs.widget === "one2many_product_picker"
                );
                for (const widget of product_picker_widgets) {
                    const trigger_fields = widget.options.trigger_refresh_fields || [];
                    if (
                        _.difference(trigger_fields, fields).length !==
                        trigger_fields.length
                    ) {
                        widget._reset(this.model.get(this.handle), e);
                        // Force re-launch onchanges on 'pure virtual' records
                        widget.renderer.clearRecords();
                        widget._render();
                    }
                }
            });
        },
    });
});
