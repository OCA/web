/** @odoo-module **/
/* Copyright 2022 Tecnativa - Alexandre D. Díaz
 * Copyright 2022 Tecnativa - Carlos Roca
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl). */

import { Component, onMounted, onWillUnmount } from "@odoo/owl";
import { useService } from "@web/core/utils/hooks";

export class Refresher extends Component {
    setup() {
        super.setup();
        this.actionService = useService("action");

        onWillUnmount(this._cancelRefresh);

        onMounted(async () => {

            //console.debug("MOUNTED", this);

            const action    = await this.actionService.loadAction(this.env.config.actionId);
            const checkBox  = this.__owl__.bdom.el.querySelector('input#web_refresher_automatic');

            //console.debug("MOUNTED LOADED", action, checkBox);

            if (checkBox && action && action.context && action.context.web_refresher_autorefresh) {
                this._refreshInterval = Number(action.context.web_refresher_autorefresh) || 30;
                checkBox.checked = true;
                this._scheduleRefresh(this);
            }

            this._checkBox = checkBox;
            this._refreshInterval = this._refreshInterval || 30;
        });
    }

    async _doRefresh() {
        const viewAction = this.actionService.currentController.action;
        // Allow refresh reports
        if (["ir.actions.report", "ir.actions.client"].includes(viewAction.type)) {
            const options = {};
            if (this.env.config.breadcrumbs.length > 1) {
                const breadcrumb = this.env.config.breadcrumbs.slice(-1);
                await this.actionService.restore(breadcrumb.jsId);
            } else {
                options.clearBreadcrumbs = true;
            }
            return this.actionService.doAction(viewAction, options);
        }
        // Note: here we use the pager props, see xml
        const {limit, offset} = this.props;
        if (!limit && !offset) {
            return;
        }
        return this.props.onUpdate({offset, limit});
    }

    _scheduleRefresh(component) {
        component.__currentTimer = setTimeout(component._autoRefresh, component._refreshInterval*1000, "unused", component);
    }

    _cancelRefresh() {
        //console.log("_cancelRefresh", this);
        if (this.__currentTimer) {
            clearTimeout(this.__currentTimer);
        }
    }

    _autoRefresh(__unused, component) {
        // when called via setTimeout we have the component as second parameter. otherwise we're 'this'
        //TODO: use bind()?
        component = component || this;

        if (component.__owl__.status != 1) {
            console.warn("web_refresher component no longer active");
            return;
        }

        if (component._checkBox && component._checkBox.checked) {
            component._doRefresh();
            component._scheduleRefresh(component);
        }
    }
}

Refresher.template = "web_refresher.Button";
