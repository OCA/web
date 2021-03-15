// Copyright 2020 Tecnativa - Alexandre Díaz
// License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
odoo.define("web_widget_one2many_product_picker.BasicModel", function (require) {
    "use strict";

    var BasicModel = require("web.BasicModel");

    BasicModel.include({

        /**
         * @param {Number/String} handle
         * @param {Object} context
         */
        updateRecordContext: function (handle, context) {
            this.localData[handle].context = _.extend(
                {},
                this.localData[handle].context,
                context);
        },

        /**
         * @param {Number/String} id
         * @returns {Boolean}
         */
        isPureVirtual: function (id) {
            var data = this.localData[id];
            return data._virtual || false;
        },

        /**
         * @param {Number/String} id
         * @param {Boolean} status
         */
        setPureVirtual: function (id, status) {
            var data = this.localData[id];
            if (status) {
                data._virtual = true;
            } else {
                delete data._virtual;
            }
        },

        /**
         * @param {Number/String} id
         */
        unsetDirty: function (id) {
            var data = this.localData[id];
            data._isDirty = false;
            this._visitChildren(data, function (r) {
                r._isDirty = false;
            });
        },

        /**
         * Generates a virtual records without link it
         *
         * @param {Integer/String} listID
         * @param {Object} options
         * @returns {Deferred}
         */
        createVirtualRecord: function (listID, options) {
            var self = this;
            var list = this.localData[listID];
            var context = _.extend({}, this._getContext(list), options.context);

            var position = options?options.position:'top';
            var params = {
                context: context,
                fields: list.fields,
                fieldsInfo: list.fieldsInfo,
                parentID: list.id,
                position: position,
                viewType: list.viewType,
                allowWarning: true,
                doNotSetDirty: true,
            };

            return $.Deferred(function (d) {
                self._makeDefaultRecord(list.model, params)
                    .then(function (recordID) {
                        self.setPureVirtual(recordID, true);
                        self.updateRecordContext(recordID, {ignore_warning: true});
                        if (options.data) {
                            self._applyChange(
                                recordID,
                                options.data,
                                params
                            ).then(function () {
                                d.resolve(self.get(recordID));
                            });
                        } else {
                            d.resolve(self.get(recordID));
                        }
                    });
            });
        },

        /**
         * Adds support to avoid show onchange warnings.
         * The implementation is a pure hack that clone
         * the context and do a monkey path the
         * 'trigger_up' method.
         *
         * @override
         */
        _performOnChange: function (record, fields, viewType) {
            if (record.context && record.context.ignore_warning) {
                var this_mp = _.clone(this);
                var super_call = this.trigger_up;
                this_mp.trigger_up = function (event_name, data) {
                    if (event_name === 'warning' && data.type === "dialog") {
                        return; // Do nothing
                    }
                    return super_call.apply(this, arguments);
                }.bind(this);
                return this._super.apply(this_mp, arguments);
            }
            return this._super.apply(this, arguments);
        },
    });

});
