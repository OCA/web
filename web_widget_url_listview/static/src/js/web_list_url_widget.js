// -*- coding: utf-8 -*-
// Copyright 2017 Therp BV <http://therp.nl>
// License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

openerp.web_widget_url_listview = function (instance) {
    "use strict";

    instance.web.list.Url = instance.web.list.Column.extend({
        PROTOCOL_REGEX: /^(?!\w+:?\/\/)/,

        /**
         * Formats the element into a <a> so that it can be clicked.
         * @param {Object} row_data The data of this widget.
         * @param {Object} options Options for this widget.
         * @returns {Object} The data formatted
         * */
        _format: function (row_data, options) {
            var value = row_data[this.id].value;
            if (value) {
                return _.template(
                    "<a href='<%-href%>' target='_blank'><%-text%></a>", {
                        href: value.trim().replace(this.PROTOCOL_REGEX, '//'),
                        text: value,
                    });
            }
            return this._super(row_data, options);
        },
    });
    instance.web.list.columns.add('field.url', 'instance.web.list.Url');
};
