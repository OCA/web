odoo.define("web_refresh.PivotController", function (require) {
    "use strict";

    const core = require("web.core");
    const PivotController = require("web.PivotController");
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

    PivotController.include({
        _wrCheckForUpdate: async function (model) {
            var measures = ["__count"].concat(
                this.renderer.props.measures.filter((m) => m !== "__count")
            );
            var result = await rpc.query({
                route: "/web_refresh/check_pivot",
                params: {
                    groups: this._wrWalkTable(
                        this.model.counts,
                        this.renderer.props.table,
                        measures
                    ),
                    model: model,
                    context: this.renderer.props.context,
                    domain: this.renderer.props.domain || [],
                    measures: measures,
                    groupby: this.renderer.props.rowGroupBys.concat(
                        this.renderer.props.colGroupBys
                    ),
                },
            });
            if (result) {
                core.bus.trigger("web_refresh_refresh");
            }
        },

        _wrWalkTable: function (counts, table, measures) {
            var rowMeasuresCount = this.renderer.props.rowGroupBys.length;
            var fieldsIndex = {};
            for (var i in measures) {
                fieldsIndex[measures[i]] = i;
            }

            function convertKey(part1, part2) {
                return part1
                    .concat(Array(rowMeasuresCount - part1.length).fill(undefined))
                    .concat(part2);
            }

            var groups = {};
            for (var row of table.rows) {
                for (var cell of row.subGroupMeasurements) {
                    var key = convertKey(...cell.groupId);
                    if (!(key in groups)) {
                        var count = counts[JSON.stringify(cell.groupId)];
                        if (!count) {
                            continue;
                        }
                        groups[key] = count.concat(
                            Array(measures.length - 1).fill(undefined)
                        );
                    }
                    groups[key][fieldsIndex[cell.measure]] = cell.value;
                }
            }
            return groups;
        },
    });

    return PivotController;
});
