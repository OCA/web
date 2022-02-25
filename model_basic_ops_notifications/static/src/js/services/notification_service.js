/** @odoo-module **/

import { registry } from "@web/core/registry";

export const basicModelOpsNotificationService = {
    dependencies: ["notification"],

    start(env, { notification }) {
        env.bus.on("WEB_CLIENT_READY", null, async () => {
            const legacyEnv = owl.Component.env;
            legacyEnv.services.bus_service.onNotification(
                this,
                (notifications) => {
                    for (const { payload, type } of notifications) {
                        if (type === "notify-record-operation") {
                            notification.add(payload.message, {
                                type: payload.type,
                                sticky: payload.sticky,
                            });
                        }
                        if (type === "notify-record-created") {
                            //
                        }
                        if (type === "notify-record-modified") {
                            //
                        }
                        if (type === "notify-record-deleted") {
                            //
                        }
                    }
                }
            );
            legacyEnv.services.bus_service.startPolling();
        });
    },
};

registry
    .category("services")
    .add("basicModelOpsNotification", basicModelOpsNotificationService);
