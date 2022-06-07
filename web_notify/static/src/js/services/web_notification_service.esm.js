/** @odoo-module **/

import {registry} from "@web/core/registry";

export const webNotificationService = {
    dependencies: ["notification"],

    start(env, {notification}) {
        const channel_success = "web_notify_success";
        const channel_danger = "web_notify_danger";
        const channel_warning = "web_notify_warning";
        const channel_info = "web_notify_info";
        const channel_default = "web_notify_default";
        const all_channels = [
            channel_success,
            channel_danger,
            channel_warning,
            channel_info,
            channel_default,
        ];

        function onMessage(message) {
            return notification.add(message.message, {
                type: message.type,
                title: message.title,
                sticky: message.sticky,
            });
        }

        function onNotification(notifications) {
            for (const {type, payload} of notifications) {
                if (all_channels.indexOf(type) > -1) {
                    onMessage(payload);
                }
            }
        }

        env.bus.on("WEB_CLIENT_READY", null, async () => {
            const legacyEnv = owl.Component.env;

            legacyEnv.services.bus_service.startPolling();
            legacyEnv.services.bus_service.onNotification(this, onNotification);
        });
    },
};

registry.category("services").add("webNotification", webNotificationService);
