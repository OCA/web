/* Copyright 2019 Tecnativa - David Vidal
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl). */

odoo.define("web_widget_domain_editor_dialog.basic_fields", function (require) {
    "use strict";

    const core = require("web.core");
    const basic_fields = require("web.basic_fields");
    const DomainEditorDialog = require("web_widget_domain_editor_dialog.DomainEditorDialog");
    const _t = core._t;

    basic_fields.FieldDomain.include({
        _onShowSelectionButtonClick: function (event) {
            event.preventDefault();
            const _this = this;
            if (this.mode === "readonly") {
                return this._super.apply(this, arguments);
            }
            if (!this.value) {
                this.value = [];
            }
            const dialog = new DomainEditorDialog(this, {
                title: _t("Select records..."),
                res_model: this._domainModel,
                default_domain: this.value,
                readonly: false,
                disable_multiple_selection: false,
                no_create: true,
                on_selected: function (selected_ids) {
                    _this.inDomainEditor = true;
                    _this.domainSelector
                        .setDomain(this.get_domain(selected_ids))
                        .then(_this._replaceContent.bind(_this));
                    _this.trigger_up("domain_changed", {
                        child: _this,
                        alreadyRedrawn: true,
                    });
                },
            }).open();
            this.trigger("dialog_opened", dialog);
            return dialog;
        },
        _onDomainSelectorValueChange: function () {
            // This allows the domain editor to work with in dialog mode
            const inDialog = this.inDialog;
            if (this.inDomainEditor) {
                this.inDialog = false;
            }
            this._super.apply(this, arguments);
            this.inDialog = inDialog;
        },
    });
});
