/** @odoo-module **/
import {Markup} from "web.utils";
import {browser} from "@web/core/browser/browser";
import {registry} from "@web/core/registry";

export const webNotificationService = {
    dependencies: ["bus_service", "notification", "action"],

    start(env, {bus_service, notification, action}) {
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
                        buttons: buttons,
                    });
                });
            });
        }

        bus_service.addEventListener("notification", ({detail: notifications}) => {
            for (const {payload, type} of notifications) {
                if (type === "web.notify") {
                    displaywebNotification(payload);
                }
            }
        });
        bus_service.start();
    },
};

registry.category("services").add("webNotification", webNotificationService);
