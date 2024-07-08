/** @odoo-module **/
/* Copyright 2019 Tecnativa - David Vidal
 * Copyright 2024 Tecnativa - Carlos Roca
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl). */
import {_t} from "@web/core/l10n/translation";
import {patch} from "@web/core/utils/patch";
import {DomainEditorDialog} from "./widget_domain_editor_dialog.esm";
import {DomainField} from "@web/views/fields/domain/domain_field";

patch(DomainField.prototype, {
    onButtonClick(ev) {
        const self = this;
        ev.preventDefault();
        if (this.props.readonly) {
            return this._super.apply(this, arguments);
        }
        if (!this.props.value) {
            this.props.value = "[]";
        }
        this.addDialog(DomainEditorDialog, {
            title: _t("Select records..."),
            noCreate: true,
            multiSelect: true,
            resModel: this.getResModel(),
            dynamicFilters: [
                {
                    description: _t("Selected domain"),
                    domain: this.getEvaluatedDomain(),
                },
            ],
            context: this.getContext(),
            onSelected: function (resIds) {
                self.update(this.get_domain(resIds));
            },
        });
    },
});
