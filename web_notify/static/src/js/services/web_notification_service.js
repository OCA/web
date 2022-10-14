/** @odoo-module **/

import {browser} from "@web/core/browser/browser";
import {ConnectionLostError} from "@web/core/network/rpc_service";
import {registry} from "@web/core/registry";
import ajax from "web.ajax";
import session from "web.session";

const webNotificationService = {
    dependencies: ["action", "notification", "rpc"],

    start(env, {action, notification, rpc}) {
        ajax.loadJS("https://unpkg.com/sweetalert/dist/sweetalert.min.js");
        env.bus.on("WEB_CLIENT_READY", null, async () => {
            const legacyEnv = owl.Component.env;
            legacyEnv.services.bus_service.onNotification(this, (notifications) => {
                for (const {payload, type} of notifications) {
                    if (type === "web_notify_channel") {
                        displayWebNotification(payload);
                    }
                }
            });
            legacyEnv.services.bus_service.startPolling();
        });

        /**
         * Displays the injected bus notification on user's screen
         */
        function displayWebNotification(notif) {
            if (notif.beep) {
                let audio = new Audio();
                audio.src = session.url("/web_notify/static/audio/alert.mp3");
                Promise.resolve(audio.play()).catch(() => {});
            }

            if (notif.notify_ui == "sweet") {
                swal({
                    icon: notif.type == "danger" ? "error" : notif.type,
                    title: notif.title,
                    text: notif.message,
                    button: "OK",
                });
            } else {
                notification.add(notif.message, {
                    title: notif.title,
                    type: notif.type,
                    sticky: notif.sticky,
                });
            }
        }
    },
};

registry.category("services").add("webNotification", webNotificationService);
