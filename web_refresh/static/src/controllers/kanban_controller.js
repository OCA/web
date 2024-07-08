odoo.define("web_refresh.KanbanController", function (require) {
    "use strict";

    const KanbanController = require("web.KanbanController");
    const rpc = require("web.rpc");

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

    KanbanController.include({
        _wrCheckForUpdate: async function (model, changed_ids) {
            var visible_ids = this.renderer.state.res_ids;
            if (visible_ids.some((r) => changed_ids.includes(r))) {
                this._wrRequestUpdate();
            } else {
                // Check if visible ids changed via server request
                var groups = [];
                for (const group of this.renderer.state.data) {
                    groups.push({
                        id: group.res_id,
                        count: group.count,
                        ids: group.res_ids,
                        limit: group.limit,
                    });
                }
                var result = await rpc.query({
                    route: "/web_refresh/check_groups",
                    params: {
                        groups: groups,
                        model: model,
                        context: this.renderer.state.context,
                        domain: this.renderer.state.domain || [],
                        orderby: rpc._serializeSort(this.renderer.state.orderedBy),
                        groupby: this.renderer.state.groupedBy,
                    },
                });
                if (result) {
                    this._wrRequestUpdate();
                }
            }
        },
    });

    return KanbanController;
});
