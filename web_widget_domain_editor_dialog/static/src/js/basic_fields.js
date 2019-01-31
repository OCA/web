/* Copyright 2019 Tecnativa - David Vidal
* License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl). */

odoo.define("web_widget_domain_editor_dialog.basic_fields", function (require) {
    "use strict";

    var core = require("web.core");
    var basic_fields = require("web.basic_fields");
    var DomainEditorDialog = require(
        "web_widget_domain_editor_dialog.DomainEditorDialog");
    var _t = core._t;

    basic_fields.FieldDomain.include({
        _onShowSelectionButtonClick: function (event) {
            event.preventDefault();
            var _this = this;
            if (this.mode === 'readonly') {
                return this._super.apply(this, arguments);
            }
            var dialog = new DomainEditorDialog(this, {
                title: _t('Select records...'),
                res_model: this._domainModel,
                default_domain: this.value,
                readonly: false,
                disable_multiple_selection: false,
                no_create: true,
                on_selected: function (selected_ids) {
                    _this.domainSelector
                        .setDomain(this.get_domain(selected_ids))
                        .then(_this._replaceContent.bind(_this));
                    _this.trigger_up(
                        'domain_changed',
                        {child: _this, alreadyRedrawn: true});
                },
            }).open();
            this.trigger("dialog_opened", dialog);
            return dialog;
        },

    });
});
