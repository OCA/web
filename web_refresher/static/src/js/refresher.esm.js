/** @odoo-module **/
/* Copyright 2022 Tecnativa - Alexandre D. Díaz
 * Copyright 2022 Tecnativa - Carlos Roca
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl). */

const {Component} = owl;
import {useService} from "@web/core/utils/hooks";

export class Refresher extends Component {
    setup() {
        super.setup();
        this.action = useService("action");
    }
    async _doRefresh() {
        const viewAction = this.action.currentController.action;
        // Allow refresh reports
        if (["ir.actions.report", "ir.actions.client"].includes(viewAction.type)) {
            const options = {};
            if (this.env.config.breadcrumbs.length > 1) {
                const breadcrumb = this.env.config.breadcrumbs.slice(-1);
                await this.action.restore(breadcrumb.jsId);
            } else {
                options.clearBreadcrumbs = true;
            }
            return this.action.doAction(viewAction, options);
        }
        // Note: here we use the pager props, see xml
        const {limit, offset} = this.props;
        if (!limit && !offset) {
            return;
        }
        return this.props.onUpdate({offset, limit});
    }
}

Refresher.template = "web_refresher.Button";
