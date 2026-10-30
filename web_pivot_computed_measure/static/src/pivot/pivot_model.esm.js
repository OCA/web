/* Copyright 2020 Tecnativa - Alexandre Díaz
 * Copyright 2022 Tecnativa - Carlos Roca
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html) */

import {PivotModel} from "@web/views/pivot/pivot_model";
import {_t} from "@web/core/l10n/translation";
import {evalOperation} from "../helpers/utils.esm";
import {patch} from "@web/core/utils/patch";

export const COMPUTED_PREFIX = "__computed_";

PivotModel.services = [...new Set([...PivotModel.services, "notification"])];

patch(PivotModel.prototype, {
    /**
     * Keep the computed measures definitions on the model.
     *
     * @override
     */
    setup(params, services) {
        super.setup(...arguments);
        this.notification = services.notification;
        this._computed_measures = [];
    },

    // --------------------------------------------------------------------------
    // Public
    // --------------------------------------------------------------------------

    /**
     * Create a new computed measure and enable it.
     *
     * @param {String|Number} id
     * @param {String} field1
     * @param {String} field2
     * @param {String} operation formula using m1 and m2 as operands
     * @param {String} name
     * @param {String} format
     * @returns {Promise}
     */
    addComputedMeasure(id, field1, field2, operation, name, format) {
        const oper = operation.replace(/m1/g, field1).replace(/m2/g, field2);
        const exists = this._computed_measures.some(
            (item) =>
                item.field1 === field1 &&
                item.field2 === field2 &&
                item.operation === oper &&
                item.format === format
        );
        if (exists) {
            return Promise.resolve();
        }
        const fields = this.metaData.fields;
        const humanName = (fieldName) => {
            const field = fields[fieldName];
            return field.__computed_id ? `(${field.string})` : field.string;
        };
        const operHuman = operation
            .replace(/m1/g, humanName(field1))
            .replace(/m2/g, humanName(field2));
        const cmDef = {
            field1,
            field2,
            operation: oper,
            name: name || operHuman,
            id: COMPUTED_PREFIX + id,
            format,
        };
        this._computed_measures.push(cmDef);
        this._createVirtualField(cmDef, this.metaData);
        return this.toggleMeasure(cmDef.id);
    },

    /**
     * Deny to disable measures used by an enabled computed measure. When a
     * computed measure is enabled, also enable all the measures it depends on.
     *
     * @override
     */
    async toggleMeasure(fieldName) {
        const activeMeasures = this.nextActiveMeasures || this.metaData.activeMeasures;
        if (activeMeasures.includes(fieldName)) {
            const usedBy = this._computed_measures.find(
                (cm) =>
                    (cm.field1 === fieldName || cm.field2 === fieldName) &&
                    activeMeasures.includes(cm.id)
            );
            if (usedBy) {
                this.notification.add(
                    _t(
                        "This measure is currently used by a 'computed measure'. Please, disable the computed measure first."
                    ),
                    {type: "warning"}
                );
                return;
            }
            return super.toggleMeasure(...arguments);
        }
        const toEnable = this._getComputedMeasureDependencies(fieldName).filter(
            (measure) => !activeMeasures.includes(measure)
        );
        if (toEnable.length) {
            // Enable the dependencies in the same load as the computed measure
            this.nextActiveMeasures = [...activeMeasures, ...toEnable];
        }
        return super.toggleMeasure(...arguments);
    },

    // --------------------------------------------------------------------------
    // Protected
    // --------------------------------------------------------------------------

    /**
     * @param {String} fieldName
     * @returns {Boolean}
     */
    _isComputedMeasure(fieldName) {
        return typeof fieldName === "string" && fieldName.startsWith(COMPUTED_PREFIX);
    },

    /**
     * Return all the measures (computed or not) needed to compute the given
     * measure, ordered so that dependencies come first.
     *
     * @param {String} fieldName
     * @returns {String[]}
     */
    _getComputedMeasureDependencies(fieldName) {
        const cm = this._computed_measures.find((item) => item.id === fieldName);
        if (!cm) {
            return [];
        }
        const res = [];
        for (const dep of [cm.field1, cm.field2]) {
            for (const measure of [...this._getComputedMeasureDependencies(dep), dep]) {
                if (!res.includes(measure)) {
                    res.push(measure);
                }
            }
        }
        return res;
    },

    /**
     * Create a minimal 'fake' field for the computed measure.
     *
     * @param {Object} cmDef
     * @param {Object} metaData
     */
    _createVirtualField(cmDef, metaData) {
        const field = {
            // Used to format the value
            type: cmDef.format,
            // Used to print the header name
            string: cmDef.name,
            name: cmDef.id,
            // Used to know if is a computed measure field
            __computed_id: cmDef.id,
            // Needed by the pivot model to build the measure specs
            aggregator: "sum",
        };
        metaData.fields[cmDef.id] = field;
        if (metaData.measures) {
            metaData.measures[cmDef.id] = field;
        }
    },

    /**
     * Computed measures are not real fields, so they can't be requested to
     * the server.
     *
     * @override
     */
    _getMeasureSpecs(config) {
        const activeMeasures = config.metaData.activeMeasures;
        if (!activeMeasures.some((m) => this._isComputedMeasure(m))) {
            return super._getMeasureSpecs(...arguments);
        }
        const metaData = Object.assign({}, config.metaData, {
            activeMeasures: activeMeasures.filter((m) => !this._isComputedMeasure(m)),
        });
        return super._getMeasureSpecs({...config, metaData});
    },

    /**
     * Add the values of the enabled computed measures.
     *
     * @override
     */
    _getMeasurements(group, config) {
        const measurements = super._getMeasurements(...arguments);
        const activeMeasures = config.metaData.activeMeasures;
        // Computed measures are evaluated in creation order, so a computed
        // measure can use the values of the previous ones.
        for (const cm of this._computed_measures) {
            if (!activeMeasures.includes(cm.id)) {
                continue;
            }
            measurements[cm.id] = group.__count
                ? evalOperation(cm.operation, measurements)
                : false;
        }
        return measurements;
    },

    /**
     * Ensure all computed measures are available in the measures list, even
     * when they are disabled.
     *
     * @override
     */
    _loadData(config) {
        for (const cmDef of this._computed_measures) {
            this._createVirtualField(cmDef, config.metaData);
        }
        return super._loadData(...arguments);
    },

    /**
     * Load the computed measures saved in favorites and remove the virtual
     * fields of the computed measures that don't exist anymore.
     *
     * @override
     */
    async load(searchParams) {
        const context = searchParams.context || {};
        if ("pivot_computed_measures" in context) {
            this._computed_measures = [...(context.pivot_computed_measures || [])];
        }
        const cmIds = this._computed_measures.map((cm) => cm.id);
        const fields = this.metaData.fields;
        for (const fieldName of Object.keys(fields)) {
            if (fields[fieldName].__computed_id && !cmIds.includes(fieldName)) {
                delete fields[fieldName];
                delete this.metaData.measures?.[fieldName];
            }
        }
        const isValid = (m) => !this._isComputedMeasure(m) || cmIds.includes(m);
        this.metaData.activeMeasures = this.metaData.activeMeasures.filter(isValid);
        let params = searchParams;
        if (Array.isArray(context.pivot_measures)) {
            params = {
                ...searchParams,
                context: {
                    ...context,
                    pivot_measures: context.pivot_measures.filter(isValid),
                },
            };
        }
        for (const cmDef of this._computed_measures) {
            this._createVirtualField(cmDef, this.metaData);
        }
        return super.load(params);
    },
});
