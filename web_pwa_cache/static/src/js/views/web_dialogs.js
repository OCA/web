odoo.define("web_pwa_cache.view_dialogs", function (require) {
    "use strict";

    var view_dialogs = require("web.view_dialogs");
    var WebClientObj = require("web.web_client");


    view_dialogs.FormViewDialog.include({
        /**
         * @override
         */
        open: function () {
            if (WebClientObj.pwa_manager.isPWAStandalone() && _.isEmpty(this.options.fields_view)) {
                this.options.fields_view = this.loadFieldView(this.dataset, this.options.view_id, 'formPWA');
                this.options.fields_view['form'] = this.options.fields_view['formPWA'];
                delete this.options.fields_view['formPWA'];
            }
            return this._super.apply(this, arguments);
        },
    });
});
