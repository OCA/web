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
            notifications.forEach((notif) => {
                browser.setTimeout(() => {
                    const notificationRemove = notification.add(Markup(notif.message), {
                        title: notif.title,
                        type: notif.type,
                        sticky: notif.sticky,
                        className: notif.className,
                        messageIsHtml: notif.html,
                        buttons:
                            notif.action &&
                            notif.action.context &&
                            notif.action.context.params
                                ? [
                                      {
                                          name:
                                              notif.action.context.params.button_name ||
                                              env._t("Open"),
                                          primary: true,
                                          onClick: async function () {
                                              await action.doAction(notif.action);
                                              notificationRemove();
                                          },
                                          icon:
                                              notif.action.context.params.button_icon ||
                                              undefined,
                                      },
                                  ]
                                : [],
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
