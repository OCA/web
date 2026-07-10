import { registry } from "@web/core/registry";
import { markup } from "@odoo/owl";
import { simpleNotificationService } from "@bus/simple_notificaition_service";

export const webNotificationService = {
    dependencies: ["bus_service", "notification", "action"],
    start(env, { bus_service, notification: notificationService, action }) {
        function displayWebNotification(payload) {
            let buttons = [];
            if (payload.action) {
                const params = payload.action.context?.params || {};
                buttons = [{
                    name: params.button_name || env._t("Open"),
                    primary: true,
                    onClick: async () => {
                        await action.doAction(payload.action);
                    },
                    ...(params.button_icon && { icon: params.button_icon }),
                }];
            }

            const removeNotif = notificationService.add(markup(payload.message), {
                title: payload.title,
                type: payload.type,
                sticky: payload.sticky,
                className: payload.className,
                messageIsHtml: payload.html,
                buttons: buttons.map(btn => {
                    const onClick = btn.onClick;
                    btn.onClick = async () => {
                        await onClick();
                        removeNotif();
                    };
                    return btn;
                }),
            });
        }

        bus_service.subscribe("web_notify", (payload) => {
            displayWebNotification(payload);
        });
        bus_service.start();
    },
};

registry.category("services").add("web_notification", webNotificationService);


// /** @odoo-module **/

// import {markup} from "@odoo/owl";
// import {browser} from "@web/core/browser/browser";
// import {registry} from "@web/core/registry";

// export const webNotificationService = {
//     dependencies: ["bus_service", "notification", "action"],

//     start(env, {bus_service, notification, action}) {
//         let webNotifTimeouts = {};
//         /**
//          * Displays the web notification on user's screen
//          * @param {*} notifications
//          */
//         function displaywebNotification(notifications) {
//             Object.values(webNotifTimeouts).forEach((notif) =>
//                 browser.clearTimeout(notif)
//             );
//             webNotifTimeouts = {};
//             notifications.forEach((notif) => {
//                 browser.setTimeout(() => {
//                     var buttons = [];
//                     if (notif.action) {
//                         const params =
//                             (notif.action.context && notif.action.context.params) || {};
//                         buttons = [
//                             {
//                                 name: params.button_name || env._t("Open"),
//                                 primary: true,
//                                 onClick: async () => {
//                                     await action.doAction(notif.action);
//                                 },
//                                 ...(params.button_icon && {icon: params.button_icon}),
//                             },
//                         ];
//                     }
//                     const notificationRemove = notification.add(markup(notif.message), {
//                         title: notif.title,
//                         type: notif.type,
//                         sticky: notif.sticky,
//                         className: notif.className,
//                         buttons: buttons.map((button) => {
//                             const onClick = button.onClick;
//                             button.onClick = async () => {
//                                 await onClick();
//                                 notificationRemove();
//                             };
//                             return button;
//                         }),
//                     });
//                 });
//             });
//         }

//         bus_service.addEventListener("notification", ({detail: notifications}) => {
//             for (const {payload, type} of notifications) {
//                 if (type === "web.notify") {
//                     displaywebNotification(payload);
//                 }
//             }
//         });
//         bus_service.start();
//     },
// };

// registry.category("services").add("webNotification", webNotificationService);
