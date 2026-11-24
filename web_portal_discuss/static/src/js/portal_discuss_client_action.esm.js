/** @odoo-module **/

import {DiscussClientAction} from "@mail/core/public_web/discuss_client_action";
import {browser} from "@web/core/browser/browser";
import {patch} from "@web/core/utils/patch";

patch(DiscussClientAction.prototype, {
    getActiveId(props) {
        if (browser.location.pathname === "/my/discuss") {
            const channelId = new URL(browser.location.href).searchParams.get(
                "channel_id"
            );
            if (channelId && /^\d+$/.test(channelId)) {
                return `discuss.channel_${channelId}`;
            }
            return "mail.box_inbox";
        }
        return super.getActiveId(props) || "mail.box_inbox";
    },

    parseActiveId(rawActiveId) {
        return super.parseActiveId(rawActiveId || "mail.box_inbox");
    },
});
