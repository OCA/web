odoo.define("web_notify.Notification", function (require) {
    "use strict";
    const {Notification} = require("@web/core/notifications/notification");
    const {patch} = require("web.utils");

    patch(Notification.props, "webNotifyProps", {
        type: {
            type: String,
            optional: true,
            validate: (t) =>
                ["warning", "danger", "success", "info", "default"].includes(t),
        },
    });
});
