// -*- coding: utf-8 -*-
// © 2017 Therp BV <http://therp.nl>
// License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

/* eslint require-jsdoc:0 */

openerp.web_widget_date_interval = function (instance) {
    "use strict";
    instance.web.form.widgets.add(
        'date_interval',
        'instance.web_widget_date_interval.FieldDateInterval');
    instance.web_widget_date_interval.FieldDateInterval =
    instance.web.form.AbstractField.extend(
        instance.web.form.ReinitializeFieldMixin,
        {
            events: {
                'click .weeknumber_iso .years button':
                'weeknumber_iso_onchange_year',
                'change .weeknumber_iso .weeks select':
                'weeknumber_iso_onchange_week',
                'click .weeknumber_iso .weeks button':
                'weeknumber_iso_onchange_week',
            },
            default_options: {
                type: 'weeknumber_iso',
                years_before: 5,
                years_after: 5,
                weeks_before: 5,
                weeks_after: 5,
                hide_years: false,
                week_type: 'select',
            },
            template: 'FieldDateInterval',
            className: 'oe_form_date_interval',
            init: function () {
                this._super.apply(this, arguments);
                this.options = _.extend(
                    {}, this.default_options, this.options
                );
                if (!this.options.end_field) {
                    throw new Error(
                        'Pass an end field in the options dictionary');
                }
                this.on('change:value', this, this.reinitialize);
            },
            _get_date: function () {
                return instance.web.str_to_date(
                    instance.web.parse_value(
                        this.get_value(), this, Date.now()
                    ).substring(0, 10)
                );
            },
            weeknumber_iso_weeknumber: function (date) {
                // GetISOWeek looks at the UTC time, but users expect walltime
                var local = date.clone().clearTime().add(12).hours();
                return parseInt(local.getISOWeek(), 10);
            },
            weeknumber_iso_year: function (date) {
                // The ISO year of a week is the year of the week's thursday
                var _date = date.clone();
                if (!_date.is().monday()) {
                    _date.last().monday();
                }
                return _date.next().thursday().getFullYear();
            },
            weeknumber_iso_get_years: function () {
                if (this.options.hide_years) {
                    return [];
                }
                var result = [],
                    years_before = this.options.years_before,
                    years_after = this.options.years_after,
                    current_date = this._get_date();
                for (
                    var year=current_date.getFullYear() - years_before;
                    year <= current_date.getFullYear() + years_after;
                    year++
                ) {
                    result.push(year);
                }
                return result;
            },
            weeknumber_iso_get_weeks: function () {
                var result = [],
                    last_day = this._get_date(),
                    min_week = 1,
                    max_week = 52;
                if (!last_day.is().december()) {
                    last_day.december();
                }
                last_day.moveToLastDayOfMonth();
                if (this.weeknumber_iso_weeknumber(last_day) > 1) {
                    max_week = this.weeknumber_iso_weeknumber(last_day);
                }
                if (this.options.week_type === 'buttons') {
                    min_week = Math.max(
                        min_week,
                        this.weeknumber_iso_weeknumber(this._get_date()) -
                        this.options.weeks_before
                    );
                    max_week = Math.min(
                        max_week,
                        this.weeknumber_iso_weeknumber(this._get_date()) +
                        this.options.weeks_after
                    );
                }
                for (var week=min_week; week <= max_week; week++) {
                    result.push(week);
                }
                return result;
            },
            weeknumber_iso_date_from_week: function (year, week) {
                // Pick any date within 'year', then change the week
                return new Date(year, 5, 1).setWeek(week);
            },
            weeknumber_iso_onchange_year: function (e) {
                var year = parseInt(jQuery(e.currentTarget).data('year'), 10);
                var week = this.weeknumber_iso_weeknumber(this._get_date());
                var monday = this.weeknumber_iso_date_from_week(year, week);
                return this.weeknumber_iso_update_interval(monday);
            },
            weeknumber_iso_onchange_week: function (e) {
                var week = parseInt(
                    jQuery(e.currentTarget).val() ||
                    jQuery(e.currentTarget).data('week'),
                    10
                );
                var year = this.weeknumber_iso_year(this._get_date());
                var monday = this.weeknumber_iso_date_from_week(year, week);
                return this.weeknumber_iso_update_interval(monday);
            },
            weeknumber_iso_update_interval: function (start) {
                return this.update_interval(
                    start.is().monday() ? start : start.last().monday(),
                    start.clone().next().sunday()
                );
            },
            update_interval: function (start, end) {
                var start_str = instance.web.auto_date_to_str(
                        start, this.field.type
                    ),
                    end_str = instance.web.auto_date_to_str(
                        end,
                        this.field_manager.fields[this.options.end_field]
                            .field.type
                    );
                this.field_manager.fields[this.name].set_value(start_str);
                this.field_manager.fields[this.options.end_field].set_value(
                    end_str
                );
                this.reinitialize();
            },
        }
    );
};
