/* Copyright 2020 Tecnativa - Alexandre Díaz
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html) */

odoo.define('web_pivot_computed_measure.PivotModel', function (require) {
    "use strict";

    var core = require('web.core');
    var PivotModel = require('web.PivotModel');
    var ComparisonUtils = require('web.dataComparisonUtils');

    var _t = core._t;


    PivotModel.include({
        _computed_measures: [],

        /**
         * Create a new computed measure
         *
         * @param {string} id
         * @param {string} field1
         * @param {string} field2
         * @param {string} operation
         * @param {string} name
         * @param {string} format
         */
        createComputedMeasure: function(id, field1, field2, operation, name, format) {
            var measure = _.find(this._computed_measures, function(item) {
                return item.field1 === field1 && item.field2 === field2 && item.operation === operation;
            });
            if (measure) {
                return $.Deferred(function(d) {
                    d.resolve();
                });
            }
            var fieldM1 = this.fields[field1];
            var fieldM2 = this.fields[field2];
            var cmId = '__computed_' + id;
            var oper = operation.replace(/m1/g, field1).replace(/m2/g, field2);
            var oper_human = operation.replace(
                /m1/g,
                fieldM1.__computed_id?"("+fieldM1.string+")":fieldM1.string).replace(
                /m2/g,
                fieldM2.__computed_id?"("+fieldM2.string+")":fieldM2.string);
            var cmTotal = this._computed_measures.push({
                field1: field1,
                field2: field2,
                operation: oper,
                name: name || oper_human,
                id: cmId,
                format: format,
            });

            return this._createVirtualMeasure(this._computed_measures[cmTotal-1]);
        },

        /**
         * Create and enable a measure based on a 'fake' field
         *
         * @param {Object} cmDef
         * @param {List} fields *Optional*
         */
        _createVirtualMeasure: function(cmDef, fields) {
            var arrFields = fields || this.fields;
            // This is a minimal 'fake' field info
            arrFields[cmDef.id] = {
                type: cmDef.format,         // Used to format the value
                string: cmDef.name,         // Used to print the header name
                __computed_id: cmDef.id,    // Used to know if is a computed measure field
            }
            this.trigger_up("add_measure", {
                id: cmDef.id,
                def: arrFields[cmDef.id],
            });
            return this._activeMeasures([cmDef.field1, cmDef.field2, cmDef.id]);
        },

        /**
         * @param {List of Strings} fields
         */
        _activeMeasures: function(fields) {
            var needLoad = false;
            var l = fields.length;
            for (var x = 0; x < l; ++x) {
                var field = fields[x];
                if (!this._isMeasureEnabled(field)) {
                    this.data.measures.push(field);
                    needLoad = true;
                }
            }
            if (needLoad) {
                return this._loadData();
            }
            return $.Deferred(function(d) {
                d.resolve();
            })
        },

        /**
         * @param {String} field
         */
        _isMeasureEnabled: function(field) {
            return _.contains(this.data.measures, field);
        },

        /**
         * Helper function to add computed measure fields data into 'dataPoint'
         *
         * @param {Object} dataPoint
         * @param {Object} dataPointComp
         */
        _fillComputedMeasuresData: function (dataPoint, dataPointComp) {
            var self = this;
            _.each(this._computed_measures, function (cm) {
                if (!self._isMeasureEnabled(cm.id)) {
                    return;
                }
                if (dataPointComp) {
                    var resData =
                        py.eval(cm.operation, dataPointComp.data);
                    var resComparison =
                        py.eval(cm.operation, dataPointComp.comparison);
                    dataPoint[cm.id] = {
                        data: resData,
                        comparisonData: resComparison,
                        variation: ComparisonUtils.computeVariation(
                            resData, resComparison),
                    };
                } else {
                    if (dataPoint.__count === 0) {
                        dataPoint[cm.id] = false;
                    } else {
                        dataPoint[cm.id] = py.eval(cm.operation, dataPoint);
                    }
                }
            });
        },

        /**
         * Fill the dataPoints with the computed measures values
         *
         * @override
         */
        _mergeData: function (data, comparisonData, groupBys) {
            var res = this._super.apply(this, arguments);
            var len = groupBys.length; // Cached loop (This is not python! hehe)
            for (var index = 0; index < len; ++index) {
                if (res.length) {
                    var len2 = res[index].length;
                    for (var k = 0; k < len2; ++k) {
                        var dataPoint = res[index][k];
                        if (_.isEmpty(dataPoint)) {
                            break;
                        }
                        if ('__comparisonDomain' in dataPoint) {
                            // Transform comparison dataPoint object to be compatible
                            var pairsDataPoint = _.pairs(dataPoint);
                            var dataPointComp = {
                                data: _.object(_.map(
                                    pairsDataPoint, (item) => {
                                        return [
                                            item[0],
                                            item[1] && item[1].data,
                                        ];
                                    })),
                                comparison: _.object(_.map(
                                    pairsDataPoint, (item) => {
                                        return [
                                            item[0],
                                            item[1] && item[1].comparisonData,
                                        ];
                                    })),
                            };
                            // Update datas. Required by computed measures that uses
                            // other computed measures to work
                            this._fillComputedMeasuresData(dataPointComp.data);
                            this._fillComputedMeasuresData(dataPointComp.comparison);
                            // Update comparison dataPoint
                            this._fillComputedMeasuresData(dataPoint, dataPointComp);
                        } else {
                            // Update standard dataPoint
                            this._fillComputedMeasuresData(dataPoint);
                        }
                    }
                }
            }
            return res;
        },

        /**
         * Load the computed measures in context. This is used by filters.
         *
         * @override
         */
        load: function (params) {
            var self = this;
            this._computed_measures = params.context.pivot_computed_measures || params.computed_measures || [];
            var toActive = [];
            var l = this._computed_measures.length;
            for (var x = 0; x < l; ++x) {
                var cmDef = this._computed_measures[x];
                params.fields[cmDef.id] = {
                    type: cmDef.format,
                    string: cmDef.name,
                    __computed_id: cmDef.id,
                }
                toActive.push(cmDef.field1, cmDef.field2, cmDef.id);
            }
            return this._super(params).then(function() {
                _.defer(function() {
                    for (var x = 0; x < l; ++x) {
                        var cmDef = self._computed_measures[x];
                        self.trigger_up("add_measure", {
                            id: cmDef.id,
                            def: self.fields[cmDef.id],
                        });
                    }
                });
                self._activeMeasures(toActive);
            });
        },

        /**
         * Load the computed measures in context. This is used by filters.
         *
         * @override
         */
        reload: function (handle, params) {
            if ('context' in params) {
                this._computed_measures = params.context.pivot_computed_measures || params.computed_measures || [];
            }
            var l = this._computed_measures.length;
            for (var x = 0; x < l; ++x) {
                this._createVirtualMeasure(this._computed_measures[x]);
            }
            // Clean unused 'fake' fields
            var fieldNames = Object.keys(this.fields);
            for (var x = 0; x < fieldNames.length; ++x) {
                var field = this.fields[fieldNames[x]];
                if (field.__computed_id) {
                    var cm = _.find(this._computed_measures, {id:field.__computed_id});
                    if (!cm) {
                        delete this.fields[fieldNames[x]];
                        this.data.measures = _.without(this.data.measures, fieldNames[x]);
                        this.trigger_up("remove_measure", {
                            id: fieldNames[x],
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
        get: function () {
            var res = this._super.apply(this, arguments);
            res.computed_measures = this._computed_measures;
            return res;
        },

        /**
         * Adds a rule to deny that measures can be disabled if are being used by a computed measure.
         * In the other hand, when enables a measure analyzes it to active all involved measures.
         *
         * @override
         */
        toggleMeasure: function (field) {
            if (this._isMeasureEnabled(field)) {
                // Measure is disabled
                var umeasures = _.filter(this._computed_measures, function(item) {
                    return item.field1 === field || item.field2 === field;
                })
                if (umeasures.length && this._isMeasureEnabled(umeasures[0].id)) {
                    return $.Deferred(function(d) {
                        d.reject(_t("This measure is currently used by a 'computed measure'. Please, disable the computed measure first."));
                    });
                }
            } else {
                // Mesaure is enabled
                var toEnable = [];
                var toAnalize = [field];
                while (toAnalize.length) {
                    var afield = toAnalize.shift();
                    var fieldDef = this.fields[afield];
                    if (fieldDef.__computed_id) {
                        var cm = _.find(this._computed_measures, {id:fieldDef.__computed_id});
                        toAnalize.push(cm.field1, cm.field2);
                        var toEnableFields = [];
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
