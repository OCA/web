/** @odoo-module **/

import {FormLabel} from "@web/views/form/form_label";
import {FormViewDialog} from "@web/views/view_dialogs/form_view_dialog";
import {patch} from "@web/core/utils/patch";
import {session} from "@web/session";
import {useService} from "@web/core/utils/hooks";

const web_field_tooltip = {
    setup() {
        super.setup();
        this.canManageTooltip = session.can_manage_tooltips;
        if (session.can_manage_tooltips) {
            this.dialogService = useService("dialog");
        }
    },

    get showTooltipAddHelper() {
        return session.tooltip_show_add_helper;
    },

    get hasFieldTooltip() {
        const props = this.props;
        return Boolean(props.record.fields[props.fieldName].field_tooltip);
    },

    get tooltipHelp() {
        let help = super.tooltipHelp;
        const field = this.props.record.fields[this.props.fieldName];
        if (field.field_tooltip) {
            help = [help, field.field_tooltip.tooltip_text].filter((x) => x).join("\n");
        }
        return help;
    },

    get hasTooltip() {
        let has_too_tip = super.hasTooltip;
        if (this.showTooltipAddHelper && !has_too_tip) {
            has_too_tip = true;
        }
        return has_too_tip;
    },

    get tooltipInfo() {
        if (odoo.debug) {
            if (this.hasFieldTooltip) {
                const field = this.props.record.fields[this.props.fieldName];
                if (this.props.fieldInfo.help) {
                    this.props.fieldInfo.help = [
                        this.props.fieldInfo.help,
                        field.field_tooltip.tooltip_text,
                    ]
                        .filter((x) => x)
                        .join("\n");
                } else {
                    this.props.record.fields[this.props.fieldName].help = [
                        field.help,
                        field.field_tooltip.tooltip_text,
                    ]
                        .filter((x) => x)
                        .join("\n");
                }
            }
        }
        return super.tooltipInfo;
    },

    onClickTooltip(ev) {
        ev.preventDefault();
        ev.stopPropagation();
        if (!this.canManageTooltip) {
            return;
        }
        const field = this.props.record.fields[this.props.fieldName];
        const fieldTooltip = field.field_tooltip;
        const tooltipId = (fieldTooltip && fieldTooltip.id) || false;
        this.dialogService.add(FormViewDialog, {
            resModel: "ir.model.fields.tooltip",
            resId: tooltipId,
            context: {
                default_model: this.props.record.resModel,
                default_field_name: field.name,
            },
        });
    },
};

patch(FormLabel.prototype, web_field_tooltip);
