/* Copyright 2019 Onestein
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). */

odoo.define('web_tree_resize_column.backend', function (require) {
    "use strict";

    var ListRenderer = require('web.ListRenderer');

    ListRenderer.include({

        /**
         * @override
         */
        _renderView: function() {
            // Preserve width of columns
            var styles = [];
            this.$el.find('thead th').each(function () {
                styles.push($(this).attr('style'));
            });

            var res = this._super.apply(this, arguments);

            // Initialize jQuery plugin
            this.$el.find('table').resizableColumns();

            // Restore width of columns
            this.$el.find('thead th').each(function (index, th) {
                $(th).attr('style', styles[index]);
            });

            return res;
        },

        /**
         * Prevent sorting when the user is resizing a column.
         *
         * @override
         */
        _onSortColumn: function (event) {
            if ($(event.target).is('.resizer')) {
                return;
            }

            this._super.apply(this, arguments);
        },
    });
});
