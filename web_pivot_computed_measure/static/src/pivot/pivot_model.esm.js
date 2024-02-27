/** @odoo-module **/
/* Copyright 2020 Tecnativa - Alexandre Díaz
 * Copyright 2022 Tecnativa - Carlos Roca
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html) */

import {PivotModel} from "@web/views/pivot/pivot_model";
import {patch} from "@web/core/utils/patch";
import {computeReportMeasures} from "@web/views/utils";
import {evalOperation} from "../helpers/utils.esm";

patch(PivotModel.prototype, "web_pivot_computed_measure.PivotModel", {
    /**
     * Add _computed_measures to avoid recompute them until page is recharged
     *
     * @override
     */
    setup() {
        this._super(...arguments);
        this._computed_measures = [];
    },

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
    addComputedMeasure(id, field1, field2, operation, name, format) {
        const measure = _.find(this._computed_measures, (item) => {
            return (
                item.field1 === field1 &&
                item.field2 === field2 &&
                item.operation === operation
            );
        });
        if (measure) {
            return Promise.resolve();
        }
        const fieldM1 = this.metaData.fields[field1];
        const fieldM2 = this.metaData.fields[field2];
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
    _createVirtualMeasure(cmDef, fields) {
        this._createVirtualField(cmDef, fields);
        // Activate computed field
        return this.toggleMeasure(cmDef.id);
    },
    _createVirtualField(cmDef, fields, config) {
        const arrFields = fields || this.metaData.fields;
        // This is a minimal 'fake' field info
        arrFields[cmDef.id] = {
            // Used to format the value
            type: cmDef.format,
            // Used to print the header name
            string: cmDef.name,
            // Referenced on payload prop at DropdownItem, used to interact with
            // created measures
            name: cmDef.id,
            // Used to know if is a computed measure field
            __computed_id: cmDef.id,
            // Operator used for group the measure added.
            group_operator: "sum",
        };
        const metaData = (config && config.metaData) || this.metaData;
        metaData.measures[cmDef.id] = arrFields[cmDef.id];
    },
    /**
     * Active the measures related to the 'fake' field
     *
     * @private
     * @param {List of Strings} fields
     */
    async _activeMeasures(fields) {
        let needLoad = false;
        for (const field of fields) {
            if (await !this._isMeasureEnabled(field)) {
                this.metaData.activeMeasures.push(field);
                needLoad = true;
            }
        }
        if (needLoad) {
            const config = {metaData: this.metaData, data: this.data};

            return this._loadData(config).then(() => {
                // Notify changes to renderer for show it on the pivot view
                this.notify();
            });
        }
        return Promise.resolve();
    },

    /**
     * Check if the measure is enabled
     *
     * @private
     * @param {String} field
     */
    _isMeasureEnabled(field, config) {
        const activeMeasures =
            (config && config.metaData.activeMeasures) ||
            this.metaData.activeMeasures ||
            [];
        return _.contains(activeMeasures, field);
    },

    /**
     * Helper function to add computed measure fields data into a 'subGroupData'
     *
     * @private
     * @param {Object} subGroupData
     */
    _fillComputedMeasuresData(subGroupData, config) {
        for (const cm of this._computed_measures) {
            if (!this._isMeasureEnabled(cm.id, config)) continue;
            if (subGroupData.__count === 0) {
                subGroupData[cm.id] = false;
            } else {
                // eslint-disable-next-line no-undef
                subGroupData[cm.id] = evalOperation(cm.operation, subGroupData);
            }
        }
    },

    /**
     * Fill the groupSubdivisions with the computed measures and their values
     *
     * @override
     */
    _prepareData(group, groupSubdivisions, config) {
        for (const groupSubdivision of groupSubdivisions) {
            for (const subGroup of groupSubdivision.subGroups) {
                this._fillComputedMeasuresData(subGroup, config);
            }
        }
        this._super(...arguments);
    },

    /**
     * _getGroupSubdivision method invokes the read_group method of the
     * model via rpc and the passed 'fields' argument is the list of
     * measure names that is in this.metaData.activeMeasures, so we remove the
     * computed measures form this.metaData.activeMeasures before calling _super
     * to prevent any possible exception.
     *
     * @override
     */
    _getGroupSubdivision(group, rowGroupBy, colGroupBy, config) {
        const computed_measures = [];
        for (let i = 0; i < config.metaData.activeMeasures.length; i++)
            if (config.metaData.activeMeasures[i].startsWith("__computed_")) {
                computed_measures.push(config.metaData.activeMeasures[i]);
                config.metaData.activeMeasures.splice(i, 1);
                i--;
            }
        const res = this._super(...arguments);
        $.merge(config.metaData.activeMeasures, computed_measures);
        return res;
    },

    /**
     * Adds a rule to deny that measures can be disabled if are being used by a computed measure.
     * In the other hand, when enables a measure analyzes it to active all involved measures.
     *
     * @override
     */
    toggleMeasure(fieldName) {
        if (this._isMeasureEnabled(fieldName)) {
            // Mesaure is enabled
            const umeasures = _.filter(this._computed_measures, (item) => {
                return item.field1 === fieldName || item.field2 === fieldName;
            });
            if (umeasures.length && this._isMeasureEnabled(umeasures[0].id)) {
                return Promise.reject(
                    this.env._t(
                        "This measure is currently used by a 'computed measure'. Please, disable the computed measure first."
                    )
                );
            }
        } else {
            // Measure is disabled
            const toEnable = [];
            const toAnalyze = [fieldName];
            while (toAnalyze.length) {
                // Analyze all items involved on computed measures to enable them
                const afield = toAnalyze.shift();
                const fieldDef = this.metaData.fields[afield];
                // Need to check if fieldDef exists to avoid problems with __count
                if (fieldDef && fieldDef.__computed_id) {
                    const cm = _.find(this._computed_measures, {
                        id: fieldDef.__computed_id,
                    });
                    toAnalyze.push(cm.field1, cm.field2);
                    const toEnableFields = [];
                    if (!this.metaData.fields[cm.field1].__computed_id) {
                        toEnableFields.push(cm.field1);
                    }
                    if (!this.metaData.fields[cm.field2].__computed_id) {
                        toEnableFields.push(cm.field2);
                    }
                    toEnableFields.push(afield);
                    toEnable.push(toEnableFields);
                }
            }
            if (toEnable.length) {
                this._activeMeasures(
                    // Transform the array of arrays to a simple array.
                    // [1, [2, 3]] => [1, 2, 3]
                    _.flatten(toEnable.reverse())
                );
            }
        }
        return this._super(...arguments);
    },
    /**
     * Load the measures added to selected favorite filters
     *
     * @override
     */
    async load(searchParams) {
        var _super = this._super.bind(this);
        var config = {metaData: this.metaData, data: this.data};
        if (!this.metaData.measures) {
            const metaData = this._buildMetaData();
            metaData.measures = computeReportMeasures(
                metaData.fields,
                metaData.fieldAttrs,
                metaData.activeMeasures,
                metaData.additionalMeasures
            );
            config = {metaData, data: this.data};
        }
        if ("context" in searchParams) {
            this._computed_measures =
                searchParams.context.pivot_computed_measures ||
                searchParams.computed_measures ||
                [];
        }
        for (const cmDef of this._computed_measures) {
            if (this._isMeasureEnabled(cmDef.id, config)) {
                continue;
            }
            await this._createVirtualField(cmDef, undefined, config);
        }
        const fieldNames = Object.keys(this.metaData.fields);
        for (const fieldName of fieldNames) {
            const field = this.metaData.fields[fieldName];
            if (field.__computed_id) {
                const cm = _.find(this._computed_measures, {
                    id: field.__computed_id,
                });
                if (!cm) {
                    delete this.metaData.fields[fieldName];
                    delete this.metaData.measures[fieldName];
                    this.metaData.activeMeasures = _.without(
                        this.metaData.activeMeasures,
                        fieldName
                    );
                }
            }
        }
        return _super(...arguments);
    },
});
