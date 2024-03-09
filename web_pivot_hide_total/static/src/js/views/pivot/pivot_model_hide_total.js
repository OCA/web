odoo.define("web.PivotModelHideTotal", function (require) {
    "use strict";

    const {_t} = require("web.core");

    const PivotModel = require("web.PivotModel");

    const PivotModelHideTotal = PivotModel.extend({
        /**
         * @override
         */
        _getTableHeaders: function () {
            var colGroupBys = this._getGroupBys().colGroupBys;
            var height = colGroupBys.length + 1;
            var measureCount = this.data.measures.length;
            var originCount = this.data.origins.length;
            var leafCounts = this._getLeafCounts(this.colGroupTree);
            var headers = [];
            var measureColumns = [];

            // 1) generate col group rows (total row + one row for each col groupby)
            var colGroupRows = new Array(height).fill(0).map(function () {
                return [];
            });
            // Blank top left cell
            colGroupRows[0].push({
                height: height + 1 + (originCount > 1 ? 1 : 0),
                title: "",
                width: 1,
            });

            // Col groupby cells with group values
            /**
             * Recursive function that generates the header cells corresponding to
             * the groups of a given tree.
             *
             * @param {Object} tree
             * @param {Object} fields
             */
            function generateTreeHeaders(tree, fields) {
                var group = tree.root;
                var rowIndex = group.values.length;
                var row = colGroupRows[rowIndex];
                var groupId = [[], group.values];
                var isLeaf = !tree.directSubTrees.size;
                var leafCount = leafCounts[JSON.stringify(tree.root.values)];
                var cell = {
                    groupId: groupId,
                    height: isLeaf ? colGroupBys.length + 1 - rowIndex : 1,
                    isLeaf: isLeaf,
                    label:
                        rowIndex === 0
                            ? undefined
                            : fields[colGroupBys[rowIndex - 1].split(":")[0]].string,
                    title: group.labels[group.labels.length - 1] || _t("Total"),
                    width: leafCount * measureCount * (2 * originCount - 1),
                };
                row.push(cell);
                if (isLeaf) {
                    measureColumns.push(cell);
                }

                [...tree.directSubTrees.values()].forEach(function (subTree) {
                    generateTreeHeaders(subTree, fields);
                });
            }

            generateTreeHeaders(this.colGroupTree, this.fields);

            headers = headers.concat(colGroupRows);

            // 2) generate measures row
            var measuresRow = this._getMeasuresRow(measureColumns);
            headers.push(measuresRow);

            // 3) generate origins row if more than one origin
            if (originCount > 1) {
                headers.push(this._getOriginsRow(measuresRow));
            }

            return headers;
        },
    });

    return PivotModelHideTotal;
});
