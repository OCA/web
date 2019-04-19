/* Copyright 2019 Onestein
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). */

odoo.define('web_tree_duplicate', function (require) {
    "use strict";
    var core = require('web.core');
    var _t = core._t;
    var ListController = require('web.ListController');
    var ListView = require('web.ListView');
    var search_inputs = require('web.search_inputs');


    ListView.include({

        /**
         * @override
         */
        init: function () {
            this._super.apply(this, arguments);
            var sidebarDuplicate = false;
            if ('duplicate' in this.arch.attrs) {
                sidebarDuplicate = _.str.toBool(this.arch.attrs.duplicate);
            }
            this.controllerParams.sidebarDuplicate = sidebarDuplicate;
        },
    });

    ListController.include({

        /**
         * @override
         */
        init: function (parent, model, renderer, params) {
            this._super.apply(this, arguments);
            this.sidebarDuplicate = params.sidebarDuplicate;
        },

        /**
         * Add the Duplicate button to the sidebar.
         *
         * @override
         */
        renderSidebar: function () {
            var res = this._super.apply(this, arguments);
            if (this.hasSidebar && this.sidebarDuplicate) {
                this.sidebar._addItems('other', [{
                    label: _t('Duplicate'),
                    callback: this._onDuplicateSelectedRecords.bind(this),
                }]);
            }
            return res;
        },

        /**
         * This function is triggered when the Duplicate button is clicked.
         *
         * @private
         */
        _onDuplicateSelectedRecords: function () {
            this._duplicateRecords(this.selectedRecords);
        },

        /**
         * Duplicate records.
         *
         * @param {Array} ids Ids of records to duplicate
         * @private
         * @returns {jQuery.Deferred}
         */
        _duplicateRecords: function (ids) {
            var self = this;
            var done = [];
            _.each(ids, function (id) {
                done.push(self.model.duplicateRecord(id));
            });
            return $.when.apply($, done).done(function () {
                var dataPoints = arguments;
                var ids = _.map(dataPoints, function (dataPoint) {
                    return self.model.localData[dataPoint].res_id;
                });
                var filter = {
                    attrs: {
                        domain: JSON.stringify([['id', 'in', ids]]),
                        string: _t('Duplicated Records')
                    }
                }
                var filterWidget = new search_inputs.Filter(filter);

                var filterGroup = new search_inputs.FilterGroup(
                    [filterWidget],
                    self.searchView,
                    self.searchView.intervalMapping,
                    self.searchView.periodMapping
                );

                var facet = filterGroup.make_facet([filterGroup.make_value(filter)]);
                self.searchView.query.add([facet]);
            });
        },
    });
});
