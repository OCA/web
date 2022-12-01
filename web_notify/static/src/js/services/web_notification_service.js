/** @odoo-module **/
import { loadJS } from "@web/core/assets";
import { registry } from "@web/core/registry";
import core from "web.core";

export const WebNotificationService = {
    dependencies: ["bus_service", "action", "notification", "rpc"],

    async start(env, { action, bus_service, notification }) {
        await loadJS("https://unpkg.com/sweetalert/dist/sweetalert.min.js");
        core.bus.on("web_client_ready", null, async () => {
            bus_service.addEventListener("notification", onNotification.bind(this));
        });

        function onNotification({ detail: notifications }) {
            for (const { payload, type } of notifications) {
                if (type === "web_notify_channel") {
                    displayWebNotification(payload);
                }
            }
        }

        function displayWebNotification(notif) {
            if (notif.beep) {
                const audio = new Audio();
                audio.src = this.env.session.url(
                    ["danger", "warning"].includes(notif.type_message)
                        ? "/web_notify/static/audio/warning.mp3"
                        : "/web_notify/static/audio/msg-alert.mp3"
                );
                Promise.resolve(audio.play()).catch((error) => {
                    console.error(error);
                });
            }

            if (notif.notify_ui === "sweet") {
                // eslint-disable-next-line no-undef
                swal({
                    icon:
                        notif.type_message === "danger" ? "error" : notif.type_message,
                    title: notif.title,
                    text: notif.message,
                    button: "OK",
                });
            } else {
                let buttons = [];

                if (notif.buttons) {
                    notif.buttons.forEach((button) => {
                        let params = {
                            name: button.name,
                            primary: button.primary,
                            onClick: () => { },
                        };

                        if (button.action) {
                            params.onClick = () => {
                                action.doAction(button.action);
                            };
                        }
                        buttons.push(params);
                    });
                }

                notification.add(notif.message, {
                    title: notif.title,
                    type: notif.type_message,
                    sticky: notif.sticky,
                    buttons: buttons,
                });
            }
        }
    },
};

registry.category("services").add("WebPushNotification", WebNotificationService);
