/* Copyright 2020 Tecnativa - Alexandre D. Díaz
/* Copyright 2022 Tecnativa - Sergio Teruel
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). */

odoo.define("web_pwa_oca.pwa_launch", ["web.core", "web_pwa_oca.PWAManager"], function (require) {
    "use strict";
    var core = require("web.core");
    var PWAManager = require("web_pwa_oca.PWAManager");

    core.bus.on("web_client_ready", null, function () {
        this.pwa_manager = new PWAManager(this);
        const def = this.pwa_manager.start();
        return Promise.all([def]);
    });
});

//# sourceMappingURL=/web/assets/1/53d1f81/web.assets_web.js.map
