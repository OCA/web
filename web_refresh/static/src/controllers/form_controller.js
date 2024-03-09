odoo.define("web_refresh.FormController", function (require) {
    "use strict";

    const core = require("web.core");
    const FormController = require("web.FormController");

    /*
This file contains some code to make "Refresh on server changes" feature work.
There are three execution points to achieve it:

[   ] 1. Server patch to base model to collect all server changes
         and pass them to "bus.bus".
[*  ] 2. JS Controller patch and OWL Component that subscribes to longpolling
         notification and process some heuristics to determine if refresh
         is necessary. If heuristics don't match server request is performed.
[   ] 3. Server controller that makes db query and determine if refresh is
         necessary for current view state (domain, context, folds, etc.)

Asterisks [*] indicate how many code for this execution point is placed in this file.
*/

    FormController.include({
        _wrCheckForUpdate: function (model, changed_ids) {
            var visible_id = this.renderer.state.res_id;
            if (changed_ids.includes(visible_id)) {
                if (this.mode === "readonly") {
                    core.bus.trigger("web_refresh_refresh");
                } else if (!this.saving) {
                    // Cause Save will trigger notification we don't need to refresh in this case
                    core.bus.trigger("web_refresh_blocked");
                }
            }
        },
        /**
         * @override
         */
        // eslint-disable-next-line no-unused-vars
        _saveRecord: async function (recordID, options) {
            this.saving = true;
            var ret = await this._super(...arguments);
            this.saving = false;
            return ret;
        },
    });

    return FormController;
});
