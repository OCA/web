/* Copyright 2026 ForgeFlow S.L. (https://www.forgeflow.com)
 * License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl.html). */
import {LoadingIndicator} from "@web/webclient/loading_indicator/loading_indicator";
import {browser} from "@web/core/browser/browser";
import {onWillDestroy} from "@odoo/owl";
import {patch} from "@web/core/utils/patch";
import {session} from "@web/session";
import {useService} from "@web/core/utils/hooks";

export const DEFAULT_BLOCK_DELAY = 3000;

/**
 * Restore the pre-17.0 behaviour of the loading indicator: when a request
 * stays pending for longer than the configured delay, the whole UI is blocked
 * with the standard blurred overlay and centered spinner until every pending
 * request has been answered.
 */
patch(LoadingIndicator.prototype, {
    setup() {
        super.setup();
        this.uiService = useService("ui");
        this.blockUITimer = null;
        this.shouldUnblock = false;
        onWillDestroy(() => this.unblockUI());
    },
    get blockUIDelay() {
        const delay = parseInt(session.web_loading_block_ui_delay, 10);
        return Number.isNaN(delay) ? DEFAULT_BLOCK_DELAY : Math.max(delay, 0);
    },
    requestCall({detail}) {
        const wasIdle = this.state.count === 0;
        super.requestCall(...arguments);
        if (detail.settings.silent || !wasIdle) {
            return;
        }
        browser.clearTimeout(this.blockUITimer);
        this.blockUITimer = browser.setTimeout(() => {
            if (this.state.count) {
                this.shouldUnblock = true;
                this.uiService.block();
            }
        }, this.blockUIDelay);
    },
    responseCall() {
        super.responseCall(...arguments);
        if (this.state.count === 0) {
            this.unblockUI();
        }
    },
    unblockUI() {
        browser.clearTimeout(this.blockUITimer);
        this.blockUITimer = null;
        if (this.shouldUnblock) {
            this.uiService.unblock();
            this.shouldUnblock = false;
        }
    },
});
