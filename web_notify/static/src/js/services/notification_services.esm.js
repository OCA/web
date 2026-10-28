import {markup} from "@odoo/owl";
import {registry} from "@web/core/registry";
import {_t} from "@web/core/l10n/translation";

const NOTIFICATION_TYPES = ["warning", "danger", "success", "info"];

export const webNotificationService = {
    dependencies: ["bus_service", "notification", "action"],

    start(env, {bus_service, notification: notificationService, action}) {
        function displayWebNotification(notification) {
            let buttons = [];
            if (notification.action) {
                const params = notification.action.context?.params || {};

                buttons = [
                    {
                        name: params.button_name || _t("Open"),
                        primary: true,
                        onClick: async () => {
                            await action.doAction(notification.action);
                        },
                        ...(params.button_icon && {icon: params.button_icon}),
                    },
                ];
            }

            // The v20 notification schema only accepts warning/danger/success/info:
            // "default" is shown as a neutral notification (see web_notify.scss).
            const isDefault = !NOTIFICATION_TYPES.includes(notification.type);
            const className = [
                notification.className,
                isDefault && "o_web_notify_default",
            ]
                .filter(Boolean)
                .join(" ");
            const notificationRemove = notificationService.add(
                notification.html ? markup(notification.message) : notification.message,
                {
                    title: notification.title,
                    type: isDefault ? "info" : notification.type,
                    sticky: Boolean(notification.sticky),
                    className,
                    buttons: buttons.map((button) => {
                        const onClick = button.onClick;
                        button.onClick = async () => {
                            await onClick();
                            notificationRemove();
                        };
                        return button;
                    }),
                }
            );
        }

        bus_service.subscribe("web_notify", (payload) => {
            displayWebNotification(payload);
        });
        bus_service.start();
    },
};

registry.category("services").add("webNotification", webNotificationService);
