/* Copyright 2020 Tecnativa - Alexandre Díaz
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html) */

odoo.define("web_pivot_computed_measure.PivotModel", function(require) {
    "use strict";

    const core = require("web.core");
    const PivotModel = require("web.PivotModel");

    const _t = core._t;

    PivotModel.include({
        _computed_measures: [],

        /**
         * Create a new computed measure
         *
         * @param {String} id
         * @param {String} field1
         * @param {String} field2
         * @param {String} operation
         * @param {String} name
         * @param {String} format
         * @returns a promise
         */
        createComputedMeasure: function(id, field1, field2, operation, name, format) {
            const measure = _.find(this._computed_measures, item => {
                return (
                    item.field1 === field1 &&
                    item.field2 === field2 &&
                    item.operation === operation
                );
            });
            if (measure) {
                return Promise.resolve();
            }
            const fieldM1 = this.fields[field1];
            const fieldM2 = this.fields[field2];
            const cmId = "__computed_" + id;
            const oper = operation.replace(/m1/g, field1).replace(/m2/g, field2);
            const oper_human = operation
                .replace(
                    /m1/g,
                    fieldM1.__computed_id ? "(" + fieldM1.string + ")" : fieldM1.string
                )
                .replace(
                    /m2/g,
                    fieldM2.__computed_id ? "(" + fieldM2.string + ")" : fieldM2.string
                );
            const cmTotal = this._computed_measures.push({
                field1: field1,
                field2: field2,
                operation: oper,
                name: name || oper_human,
                id: cmId,
                format: format,
            });

            return this._createVirtualMeasure(this._computed_measures[cmTotal - 1]);
        },

        /**
         * Create and enable a measure based on a 'fake' field
         *
         * @private
         * @param {Object} cmDef
         * @param {List} fields *Optional*
         * @returns a promise
         */
        _createVirtualMeasure: function(cmDef, fields) {
            const arrFields = fields || this.fields;
            // This is a minimal 'fake' field info
            arrFields[cmDef.id] = {
                // Used to format the value
                type: cmDef.format,
                // Used to print the header name
                string: cmDef.name,
                // Used to know if is a computed measure field
                __computed_id: cmDef.id,
            };
            this.trigger_up("add_measure", {
                id: cmDef.id,
                def: arrFields[cmDef.id],
            });
            return this._activeMeasures([cmDef.field1, cmDef.field2, cmDef.id]);
        },

        /*
         * @private
         * @param {List of Strings} fields
         */
        _activeMeasures: function(fields) {
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
        _isMeasureEnabled: function(field) {
            return _.contains(this.data.measures, field);
        },

        /**
         * Helper function to add computed measure fields data into a 'subGroupData'
         *
         * @private
         * @param {Object} subGroupData
         */
        _fillComputedMeasuresData: function(subGroupData) {
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
        _prepareData: function(group, groupSubdivisions) {
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
        _getGroupSubdivision: function() {
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
        load: function(params) {
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

        /**
         * Load the computed measures in context. This is used by filters.
         *
         * @override
         */
        reload: function(handle, params) {
            if ("context" in params) {
                this._computed_measures =
                    params.context.pivot_computed_measures ||
                    params.computed_measures ||
                    [];
            }
            for (const cmDef of this._computed_measures) {
                this._createVirtualMeasure(cmDef);
            }
            const fieldNames = Object.keys(this.fields);
            for (const fieldName of fieldNames) {
                const field = this.fields[fieldName];
                if (field.__computed_id) {
                    const cm = _.find(this._computed_measures, {
                        id: field.__computed_id,
                    });
                    if (!cm) {
                        delete this.fields[fieldName];
                        this.data.measures = _.without(this.data.measures, fieldName);
                        this.trigger_up("remove_measure", {
                            id: fieldName,
                        });
                    }
                }
            }
            return this._super.apply(this, arguments);
        },

        /**
         * Add the computed measures to the state. This is used by filters.
         *
         * @override
         */
        get: function() {
            const res = this._super.apply(this, arguments);
            res.computed_measures = this._computed_measures;
            return res;
        },

        /**
         * Adds a rule to deny that measures can be disabled if are being used by a computed measure.
         * In the other hand, when enables a measure analyzes it to active all involved measures.
         *
         * @override
         */
        toggleMeasure: function(field) {
            if (this._isMeasureEnabled(field)) {
                // Measure is disabled
                const umeasures = _.filter(this._computed_measures, item => {
                    return item.field1 === field || item.field2 === field;
                });
                if (umeasures.length && this._isMeasureEnabled(umeasures[0].id)) {
                    return Promise.reject(
                        _t(
                            "This measure is currently used by a 'computed measure'. Please, disable the computed measure first."
                        )
                    );
                }
            } else {
                // Mesaure is enabled
                const toEnable = [];
                const toAnalize = [field];
                while (toAnalize.length) {
                    const afield = toAnalize.shift();
                    const fieldDef = this.fields[afield];
                    if (fieldDef.__computed_id) {
                        const cm = _.find(this._computed_measures, {
                            id: fieldDef.__computed_id,
                        });
                        toAnalize.push(cm.field1, cm.field2);
                        const toEnableFields = [];
                        if (!this.fields[cm.field1].__computed_id) {
                            toEnableFields.push(cm.field1);
                        }
                        if (!this.fields[cm.field2].__computed_id) {
                            toEnableFields.push(cm.field2);
                        }
                        toEnableFields.push(afield);
                        toEnable.push(toEnableFields);
                    }
                }
                if (toEnable.length) {
                    return this._activeMeasures(_.flatten(toEnable.reverse()));
                }
            }
            return this._super.apply(this, arguments);
        },
    });
});
