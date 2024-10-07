import {markup} from "@odoo/owl";
import {registry} from "@web/core/registry";

export const webNotificationService = {
    dependencies: ["bus_service", "notification", "action"],

    start(env, {bus_service, notification: notificationService, action}) {
        function displayWebNotification(notification) {
            let buttons = [];
            if (notification.action) {
                const params = notification.action.context?.params || {};

                buttons = [
                    {
                        name: params.button_name || env._t("Open"),
                        primary: true,
                        onClick: async () => {
                            await action.doAction(notification.action);
                        },
                        ...(params.button_icon && {icon: params.button_icon}),
                    },
                ];
            }

            const notificationRemove = notificationService.add(
                markup(notification.message),
                {
                    title: notification.title,
                    type: notification.type,
                    sticky: notification.sticky,
                    className: notification.className,
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
