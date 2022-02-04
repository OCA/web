/* Copyright 2019 Tecnativa - David Vidal
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl). */

odoo.define("web_widget_domain_editor_dialog.basic_fields", function (require) {
    "use strict";

    const {_t} = require("web.core");
    const {FieldDomain} = require("web.basic_fields");
    const DomainEditorDialog = require("web_widget_domain_editor_dialog.DomainEditorDialog");

    FieldDomain.include({
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
                    // Trigger from domainSelector instead of _this
                    // for execute https://github.com/odoo/odoo/blob/15.0/addons/web/static/src/legacy/js/widgets/domain_selector.js#L623
                    _this.domainSelector.trigger_up("domain_changed", {
                        child: _this,
                        noRedraw: true,
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
