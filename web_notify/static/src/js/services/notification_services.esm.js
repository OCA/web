import {markup} from "@odoo/owl";
import {_t} from "@web/core/l10n/translation";
import {registry} from "@web/core/registry";

export const webNotificationService = {
    dependencies: ["bus_service", "action", "notification_sound"],

    start(env, {bus_service, action, notification_sound: notificationService}) {
        function displayWebNotification(notification_sound) {
            let buttons = [];
            if (notification_sound.action) {
                const params = notification_sound.action.context?.params || {};

                buttons = [
                    {
                        name: params.button_name || _t("Open"),
                        primary: true,
                        onClick: async () => {
                            await action.doAction(notification_sound.action);
                        },
                        ...(params.button_icon && {icon: params.button_icon}),
                    },
                ];
            }
            const notificationRemove = notificationService.add(
                markup(notification_sound.message),
                {
                    title: notification_sound.title,
                    type: notification_sound.type,
                    sticky: notification_sound.sticky,
                    className: notification_sound.className,
                    buttons: buttons.map((button) => {
                        const onClick = button.onClick;
                        button.onClick = async () => {
                            await onClick();
                            notificationRemove();
                        };
                        return button;
                    }),
                    sound: notification_sound.sound,
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
