odoo.define("web_access_rule_buttons.web_access_rule_buttons", function (require) {
    "use strict";

    var MockServer = require("web.MockServer");

    MockServer.include({
        async _performRpc(route, args) {
            if (args.method === "check_access_rule_all") {
                return {
                    read: true,
                    create: true,
                    write: true,
                    unlink: true,
                };
            }
            return this._super(...arguments);
        },
    });
});
