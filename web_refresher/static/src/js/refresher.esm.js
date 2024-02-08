/** @odoo-module **/
/* Copyright 2022 Tecnativa - Alexandre D. Díaz
 * Copyright 2022-2024 Tecnativa - Carlos Roca
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl). */

const {Component} = owl;

export class Refresher extends Component {
    _doRefresh() {
        // Allow refresh reports
        if (["ir.actions.report", "ir.actions.client"].includes(this.env.action.type)) {
            const options = {};
            const breadcrumbs = this.__owl__.parent.props.breadcrumbs;
            if (breadcrumbs.length) {
                return this.trigger("refresh-report", {
                    action: this.env.action,
                    controllerID: breadcrumbs.slice(-1).controllerID,
                });
            }
            options.clear_breadcrumbs = true;
            return this.trigger("do-action", {action: this.env.action, options});
        }
        // Note: here we use the pager props, see xml
        const {limit, currentMinimum} = this.props;
        return this.trigger("pager-changed", {currentMinimum, limit});
    }
}

Refresher.template = "web_refresher.Button";
