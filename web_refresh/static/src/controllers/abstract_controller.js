odoo.define("web_refresh.AbstractController", function (require) {
    "use strict";

    const core = require("web.core");
    const AbstractController = require("web.AbstractController");

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

    AbstractController.include({
        custom_events: _.extend({}, AbstractController.prototype.custom_events, {
            web_refresh: "_wrOnRefresh",
        }),

        _wrOnRefresh: function (ev) {
            ev.stopPropagation();
            if (!ev.data.notification) {
                if (!this.mode || this.mode === "readonly") {
                    this.reload();
                } else {
                    core.bus.trigger("web_refresh_blocked");
                }
            } else if (this.modelName in ev.data.notification) {
                var changed_ids = ev.data.notification[this.modelName];
                this._wrCheckForUpdate(this.modelName, changed_ids);
            }
        },

        _updateRendererState: function () {
            var def = this._super.apply(this, arguments);
            def.then(() => {
                core.bus.trigger("web_refresh_reloaded", this.mode);
            });
            return def;
        },

        _wrRequestUpdate: function () {
            if (!this.mode || this.mode === "readonly") {
                core.bus.trigger("web_refresh_refresh");
            } else {
                core.bus.trigger("web_refresh_blocked");
            }
        },

        // Default behavior for unknown controllers
        // eslint-disable-next-line no-unused-vars
        _wrCheckForUpdate: function (model, changed_ids) {
            this._wrRequestUpdate();
        },
    });

    return AbstractController;
});
