odoo.define("web_notify.webNotifyService", function (require) {
    "use strict";

    const {registry} = require("@web/core/registry");
    const ajax = require("web.ajax");
    const session = require("web.session");

    const webNotificationService = {
        dependencies: ["action", "notification", "rpc"],

        start(env, {notification}) {
            ajax.loadJS("https://unpkg.com/sweetalert/dist/sweetalert.min.js");

            /**
             * Displays the injected bus notification on user's screen
             * @param {notif} notif payload
             */
            function displayWebNotification(notif) {
                if (notif.beep) {
                    const audio = new Audio();
                    audio.src = session.url(
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
                            notif.type_message === "danger"
                                ? "error"
                                : notif.type_message,
                        title: notif.title,
                        text: notif.message,
                        button: "OK",
                    });
                } else {
                    notification.add(notif.message, {
                        title: notif.title,
                        type: notif.type_message,
                        sticky: notif.sticky,
                    });
                }
            }
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
        },
    };

    registry.category("services").add("webNotification", webNotificationService);
});
