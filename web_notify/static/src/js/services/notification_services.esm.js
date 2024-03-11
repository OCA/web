/** @odoo-module **/
import {Markup} from "web.utils";
import {browser} from "@web/core/browser/browser";
import {registry} from "@web/core/registry";

export const webNotificationService = {
    dependencies: ["notification", "action"],

    start(env, {notification, action}) {
        let webNotifTimeouts = {};
        /**
         * Displays the web notification on user's screen
         */
        function displaywebNotification(notifications) {
            Object.values(webNotifTimeouts).forEach((notif) =>
                browser.clearTimeout(notif)
            );
            webNotifTimeouts = {};
            notifications.forEach(function (notif) {
                browser.setTimeout(function () {
                    let buttons = [];

                    if (notif.action) {
                        buttons = [
                            {
                                name: env._t("Open"),
                                primary: true,
                                onClick: async () => {
                                    await action.doAction(notif.action);
                                },
                            },
                        ];
                    }
                    notification.add(Markup(notif.message), {
                        title: notif.title,
                        type: notif.type,
                        sticky: notif.sticky,
                        className: notif.className,
                        messageIsHtml: notif.html,
                        buttons: buttons,
                    });
                });
            });
        }
        env.bus.on("WEB_CLIENT_READY", null, async () => {
            const legacyEnv = owl.Component.env;
            legacyEnv.services.bus_service.onNotification(this, (notifications) => {
                for (const {payload, type} of notifications) {
                    if (type === "web.notify") {
                        displaywebNotification(payload);
                    }
                }
            });
            legacyEnv.services.bus_service.startPolling();
        });
    },
};

registry.category("services").add("webNotification", webNotificationService);
