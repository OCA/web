odoo.define("web_refresh.ListController", function (require) {
    "use strict";

    const core = require("web.core");
    const ListController = require("web.ListController");
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

    ListController.include({
        _wrCheckForUpdate: async function (model, changed_ids) {
            var visible_ids = this.renderer.state.res_ids;
            if (_.intersection(visible_ids, changed_ids).length !== 0) {
                this._wrRequestUpdate();
            } else {
                var result = false;
                if (this.renderer.state.groupedBy) {
                    // Grouped list mode
                    var groups = this._wrWalkIntoGroups(1, this.renderer.state.data);

                    result = await rpc.query({
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
                } else {
                    // Plain list mode
                    result = await rpc.query({
                        route: "/web_refresh/check_list",
                        params: {
                            ids: visible_ids,
                            model: model,
                            context: this.renderer.state.context,
                            domain: this.renderer.state.domain || [],
                            limit: this.renderer.state.limit,
                            offset: this.renderer.state.offset,
                            orderby: rpc._serializeSort(this.renderer.state.orderedBy),
                        },
                    });
                }
                if (result) {
                    this._wrRequestUpdate();
                }
            }
        },

        _wrWalkIntoGroups: function (level, groups) {
            var ret = [];
            if (level < this.renderer.state.groupedBy.length) {
                for (const group of groups) {
                    ret.push({
                        id: group.domain[0][2],
                        count: group.count,
                        offset: group.offset,
                        limit: group.limit,
                        groups: this._walkIntoGroups(level + 1, group.data),
                    });
                }
            } else {
                for (const group of groups) {
                    ret.push({
                        id: group.domain[0][2],
                        count: group.count,
                        ids: group.res_ids,
                        offset: group.offset,
                        limit: group.limit,
                    });
                }
            }
            return ret;
        },

        /**
         * @override
         * Detect situation then list goes from edit to readonly mode without view refresh
         */
        // eslint-disable-next-line no-unused-vars
        _setMode: function (mode, recordID) {
            var trigger_reload = mode === "readonly" && this.mode !== mode;
            var ret = this._super.apply(this, arguments);
            if (trigger_reload) {
                core.bus.trigger("web_refresh_reloaded", mode);
            }
            return ret;
        },
    });

    return ListController;
});
