// Copyright 2017 - 2018 Modoolar <info@modoolar.com>
// License LGPLv3.0 or later (https://www.gnu.org/licenses/lgpl-3.0.en.html).

odoo.define('web_widget_search_date.Widget', function (require) {
    "use strict";
    var core = require('web.core');
    var field_utils = require('web.field_utils');

    var _t = core._t;
    var DateField = core.search_widgets_registry.get("date");
    DateField.include({
        complete: function (needle) {
            var t, v;
            try {
                t = (this.attrs && this.attrs.type === 'datetime') ? 'datetime' : 'date';
                v = field_utils.parse[t](needle, {type: t}, {timezone: true});
            } catch (e) {
                return $.when(null);
            }
            var m = moment(v, t === 'datetime' ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD');
            if (!m.isValid()) { return $.when(null); }
            var date_string = field_utils.format[t](m, {type: t});
            var before_label = _.str.sprintf(_.str.escapeHTML(
                _t("Search %(field)s before: %(value)s")), {
                    field: '<em>' + _.escape(this.attrs.string) + '</em>',
                    value: '<strong>' + date_string + '</strong>'});
            var at_label = _.str.sprintf(_.str.escapeHTML(
                _t("Search %(field)s at: %(value)s")), {
                    field: '<em>' + _.escape(this.attrs.string) + '</em>',
                    value: '<strong>' + date_string + '</strong>'});
            var after_label = _.str.sprintf(_.str.escapeHTML(
                _t("Search %(field)s after: %(value)s")), {
                    field: '<em>' + _.escape(this.attrs.string) + '</em>',
                    value: '<strong>' + date_string + '</strong>'});
            var date = m.toDate();
            return $.when([
                {
                    label: before_label,
                    facet: {
                        category: this.attrs.string,
                        field: this,
                        values: [{label: '<=' + date_string, value: date, valueAsMoment: m, operator: '<=',}]
                    },
                }, {
                    label: at_label,
                    facet: {
                        category: this.attrs.string,
                        field: this,
                        values: [{label: date_string, value: date, valueAsMoment: m, operator: '=',}]
                    }
                }, {
                    label: after_label,
                    facet: {
                        category: this.attrs.string,
                        field: this,
                        operator: '>=',
                        values: [{label: '>=' + date_string, value: date, valueAsMoment: m, operator: '>=',}]
                    }
                },
            ]);
        },
        make_domain: function (name, operator, facet) {
            if (facet.attributes.operator != null) {
                return [[name, facet.attributes.operator, this.value_from(facet)]];
            }
            return this._super.apply(this, arguments);
        },
    });
});
