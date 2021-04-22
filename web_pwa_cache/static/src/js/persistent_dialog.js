odoo.define("web_pwa_cache.PersistentDialog", function(require) {
    "use strict";

    var Dialog = require("web.Dialog");
    var core = require("web.core");

    var PersistentDialog = Dialog.extend({
        init: function() {
            this._super.apply(this, arguments);
            core.bus.off("close_dialogs", this);
        },
    });

    return PersistentDialog;
});
