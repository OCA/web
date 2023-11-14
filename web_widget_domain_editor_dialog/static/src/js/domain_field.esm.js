/** @odoo-module **/
/* Copyright 2019 Tecnativa - David Vidal
 * Copyright 2024 Tecnativa - Carlos Roca
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl). */
import {DomainField} from "@web/views/fields/domain/domain_field";
import {DomainEditorDialog} from "./widget_domain_editor_dialog.esm";
import {patch} from "@web/core/utils/patch";

patch(DomainField.prototype, "web_widget_domain_editor_dialog.DomainField", {
    onButtonClick(ev) {
        ev.preventDefault();
        const self = this;
        if (this.props.readonly) {
            return this._super.apply(this, arguments);
        }
        if (!this.props.value) {
            this.props.value = "[]";
        }
        this.addDialog(DomainEditorDialog, {
            title: this.env._t("Select records..."),
            noCreate: true,
            multiSelect: true,
            resModel: this.getResModel(this.props),
            dynamicFilters: [
                {
                    description: this.env._t("Selected domain"),
                    domain:
                        this.getDomain(this.props.value).toList(
                            this.getContext(this.props)
                        ) || [],
                },
            ],
            context: this.getContext(this.props) || {},
            onSelected: function (resIds) {
                self.update(this.get_domain(resIds));
            },
        });
    },
});
