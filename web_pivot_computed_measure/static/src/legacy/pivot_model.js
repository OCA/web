/* Copyright 2020 Tecnativa - Alexandre Díaz
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html) */

odoo.define("web_pivot_computed_measure.PivotModel", function (require) {
    "use strict";
    const PivotModel = require("web.PivotModel");

    PivotModel.include({
        _computed_measures: [],

        /*
         * @private
         * @param {List of Strings} fields
         */
        _activeMeasures: function (fields) {
            let needLoad = false;
            for (const field of fields) {
                if (!this._isMeasureEnabled(field)) {
                    this.data.measures.push(field);
                    needLoad = true;
                }
            }
            if (needLoad) {
                return this._loadData();
            }
            return Promise.resolve();
        },

        /*
         * @private
         * @param {String} field
         */
        _isMeasureEnabled: function (field) {
            return _.contains(this.data.measures, field);
        },

        /**
         * Helper function to add computed measure fields data into a 'subGroupData'
         *
         * @private
         * @param {Object} subGroupData
         */
        _fillComputedMeasuresData: function (subGroupData) {
            for (const cm of this._computed_measures) {
                if (!this._isMeasureEnabled(cm.id)) return;
                if (subGroupData.__count === 0) {
                    subGroupData[cm.id] = false;
                } else {
                    // eslint-disable-next-line no-undef
                    subGroupData[cm.id] = py.eval(cm.operation, subGroupData);
                }
            }
        },

        /**
         * Fill the groupSubdivisions with the computed measures and their values
         *
         * @override
         */
        _prepareData: function (group, groupSubdivisions) {
            for (const groupSubdivision of groupSubdivisions) {
                for (const subGroup of groupSubdivision.subGroups) {
                    this._fillComputedMeasuresData(subGroup);
                }
            }
            this._super.apply(this, arguments);
        },

        /**
         * _getGroupSubdivision method invokes the read_group method of the
         * model via rpc and the passed 'fields' argument is the list of
         * measure names that is in this.data.measures, so we remove the
         * computed measures form this.data.measures before calling _super
         * to prevent an exception
         *
         * @override
         */
        _getGroupSubdivision: function () {
            const computed_measures = [];
            for (let i = 0; i < this.data.measures.length; i++)
                if (this.data.measures[i].startsWith("__computed_")) {
                    computed_measures.push(this.data.measures[i]);
                    this.data.measures.splice(i, 1);
                    i--;
                }
            const res = this._super.apply(this, arguments);
            $.merge(this.data.measures, computed_measures);
            return res;
        },

        /**
         * Load the computed measures in context. This is used by filters.
         *
         * @override
         */
        load: function (params) {
            this._computed_measures =
                params.context.pivot_computed_measures ||
                params.computed_measures ||
                [];
            const toActive = [];
            for (const cmDef of this._computed_measures) {
                params.fields[cmDef.id] = {
                    type: cmDef.format,
                    string: cmDef.name,
                    __computed_id: cmDef.id,
                };
                toActive.push(cmDef.field1, cmDef.field2, cmDef.id);
            }
            return this._super(params).then(() => {
                _.defer(() => {
                    for (const cmDef of this._computed_measures) {
                        this.trigger_up("add_measure", {
                            id: cmDef.id,
                            def: this.fields[cmDef.id],
                        });
                    }
                });
                this._activeMeasures(toActive);
            });
        },
    });
});
