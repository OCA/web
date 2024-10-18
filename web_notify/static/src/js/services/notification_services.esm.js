/** @odoo-module **/
import {Markup} from "web.utils";
import {browser} from "@web/core/browser/browser";
import {registry} from "@web/core/registry";

export const webNotificationService = {
    dependencies: ["bus_service", "action", "notification_sound"],

    start(env, {bus_service, action, notification_sound}) {
        let webNotifTimeouts = {};
        /**
         * Displays the web notification with sound on user's screen
         * @param {*} notifications
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
                    const notificationRemove = notification_sound.add(Markup(notif.message), {
                        title: notif.title,
                        type: notif.type,
                        sticky: notif.sticky,
                        className: notif.className,
                        buttons: buttons.map((button) => {
                            const onClick = button.onClick;
                            button.onClick = async () => {
                                await onClick();
                                notificationRemove();
                            };
                            return button;
                        }),
                        sound: notif.sound,
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
