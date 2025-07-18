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
         * @param {Array} notifications
         */
        function displaywebNotification(notifications) {
            Object.values(webNotifTimeouts).forEach((notif) =>
                browser.clearTimeout(notif)
            );
            webNotifTimeouts = {};
            notifications.forEach((notif) => {
                browser.setTimeout(() => {
                    var buttons = [];
                    if (notif.action) {
                        const params =
                            (notif.action.context && notif.action.context.params) || {};
                        buttons = [
                            {
                                name: params.button_name || env._t("Open"),
                                primary: true,
                                onClick: async () => {
                                    await action.doAction(notif.action);
                                },
                                ...(params.button_icon && {icon: params.button_icon}),
                            },
                        ];
                    }
                    const notificationRemove = notification.add(Markup(notif.message), {
                        title: notif.title,
                        type: notif.type,
                        sticky: notif.sticky,
                        className: notif.className,
                        messageIsHtml: notif.html,
                        buttons: buttons.map((button) => {
                            const onClick = button.onClick;
                            button.onClick = async () => {
                                await onClick();
                                notificationRemove();
                            };
                            return button;
                        }),
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
