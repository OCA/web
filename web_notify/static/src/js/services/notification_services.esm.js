/** @odoo-module **/
import {Markup} from "web.utils";
import {browser} from "@web/core/browser/browser";
import {registry} from "@web/core/registry";

export const webNotificationService = {
    dependencies: ["bus_service", "notification", "action", "orm"],

    start(env, {bus_service, notification, action, orm}) {
        let webNotifTimeouts = {};
        const displayedNotifications = {};
        /**
         * Displays the web notification on user's screen
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
                    const notificationRemove = notification.add(Markup(notif.message), {
                        title: notif.title,
                        type: notif.type,
                        sticky: notif.sticky,
                        className: notif.className,
                        buttons: buttons.map((button) => {
                            const onClick = button.onClick;
                            button.onClick = async () => {
                                await onClick();
                                notificationRemove();
                                await orm.call("res.users", "notify_dismiss", [
                                    notif.id,
                                ]);
                            };
                            return button;
                        }),
                        onClose: async () => {
                            await orm.call("res.users", "notify_dismiss", [notif.id]);
                        },
                    });
                    displayedNotifications[notif.id] = notificationRemove;
                });
            });
        }

        bus_service.addEventListener("notification", ({detail: notifications}) => {
            for (const {payload, type} of notifications) {
                if (type === "web.notify") {
                    displaywebNotification(payload);
                } else if (type === "web.notify.dismiss") {
                    const notifId = payload[0].id;
                    if (displayedNotifications[notifId]) {
                        displayedNotifications[notifId]();
                        delete displayedNotifications[notifId];
                    }
                }
            }
        });

        bus_service.start();
    },
};

registry.category("services").add("webNotification", webNotificationService);
