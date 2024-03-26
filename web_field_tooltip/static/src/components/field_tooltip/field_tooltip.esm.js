/** @odoo-module */

import {Component, markup} from "@odoo/owl";

import {FormViewDialog} from "@web/views/view_dialogs/form_view_dialog";
import {session} from "@web/session";
import {usePopover} from "@web/core/popover/popover_hook";
import {useService} from "@web/core/utils/hooks";

export class FieldTooltipPopover extends Component {}
FieldTooltipPopover.template = "web_field_tooltip.FieldTooltipPopover";

export class FieldTooltip extends Component {
    setup() {
        this.popover = usePopover();
        this.tooltipPopover = null;
        this.hasFieldTooltip = this.props.hasFieldTooltip;
        this.canManageTooltip = session.can_manage_tooltips;
        this.showAddHelper =
            session.can_manage_tooltips && session.tooltip_show_add_helper;
        this.fieldTooltip = this.props.field.field_tooltip;

        if (session.can_manage_tooltips) {
            this.dialogService = useService("dialog");
        }
    }

    get tooltipInfo() {
        const props = this.props;
        return {
            title: props.field.string,
            help: markup(this.tooltipText),
        };
    }

    get tooltipText() {
        return this.fieldTooltip.tooltip_text;
    }

    onClickTooltip(e) {
        e.preventDefault();
        e.stopPropagation();
        if (!this.canManageTooltip) {
            return;
        }
        const tooltipId = (this.fieldTooltip && this.fieldTooltip.id) || false;
        this.dialogService.add(FormViewDialog, {
            resModel: "ir.model.fields.tooltip",
            resId: tooltipId,
            context: {
                default_model: this.props.resModel,
                default_field_name: this.props.fieldName,
            },
        });
    }

    onMouseEnter(ev) {
        if (!this.hasFieldTooltip) {
            return;
        }
        this.closeTooltip();
        this.tooltipPopover = this.popover.add(
            ev.currentTarget,
            FieldTooltipPopover,
            this.tooltipInfo,
            {
                closeOnClickAway: true,
                position: "top",
                title: "title",
            }
        );
    }

    onMouseLeave() {
        this.closeTooltip();
    }

    closeTooltip() {
        if (this.tooltipPopover) {
            this.tooltipPopover();
            this.tooltipPopover = null;
        }
    }
}

FieldTooltip.template = "web_field_tooltip.FieldTooltip";
