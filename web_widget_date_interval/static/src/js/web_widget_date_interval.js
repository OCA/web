//-*- coding: utf-8 -*-
//© 2017 Therp BV <http://therp.nl>
//License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

openerp.web_widget_date_interval = function(instance)
{
    instance.web.form.widgets.add(
        'date_interval',
        'instance.web_widget_date_interval.FieldDateInterval');
    instance.web_widget_date_interval.FieldDateInterval =
    instance.web.form.AbstractField.extend(
        instance.web.form.ReinitializeFieldMixin,
        {
            events: {
                'click .weeknumber_iso button':
                'weeknumber_iso_onchange_year',
                'change .weeknumber_iso select':
                'weeknumber_iso_onchange_week',
            },
            template: 'FieldDateInterval',
            className: 'oe_form_date_interval',
            init: function(field_manager, node)
            {
                this._super.apply(this, arguments);
                if(!this.options.type)
                {
                    throw 'Pass a type in the options dictionary!';
                }
                if(!this.options.end_field)
                {
                    throw 'Pass an end field in the options dictionary';
                }
                this.on('change:value', this, this.reinitialize);
            },
            _get_date: function()
            {
                return instance.web.str_to_date(
                    instance.web.parse_value(
                        this.get_value(), this, Date.now()
                    ).substring(0, 10)
                );
            },
            weeknumber_iso_weeknumber: function(date)
            {
                // getISOWeek looks at the UTC time, but users expect walltime
                var local = date.clone().clearTime().add(12).hours();
                return parseInt(local.getISOWeek());
            },
            weeknumber_iso_get_years: function()
            {
                if(this.options.hide_years)
                {
                    return [];
                }
                var result = [],
                    years_before = this.options.years_before || 5,
                    years_after = this.options.years_after || 5,
                    current_date = this._get_date();
                for(
                    var year=current_date.getFullYear() - years_before;
                    year <= current_date.getFullYear() + years_after;
                    year++
                )
                {
                    result.push(year);
                }
                return result;
            },
            weeknumber_iso_get_weeks: function()
            {
                var result = [],
                    last_day = this._get_date(),
                    max_week = 52;
                if(!last_day.is().december())
                {
                    last_day.december();
                }
                last_day.moveToLastDayOfMonth();
                if(this.weeknumber_iso_weeknumber(last_day) > 1)
                {
                    max_week = this.weeknumber_iso_weeknumber(last_day);
                }
                for(var week=1; week <= max_week; week++)
                {
                    result.push(week);
                }
                return result;
            },
            weeknumber_iso_onchange_year: function(e)
            {
                var year = parseInt(jQuery(e.currentTarget).data('year')),
                    value = this._get_date();
                value.setFullYear(year);
                return this.weeknumber_iso_update_interval(value);
            },
            weeknumber_iso_onchange_week: function(e)
            {
                var week = parseInt(jQuery(e.currentTarget).val());
                return this.weeknumber_iso_update_interval(
                    this._get_date().setWeek(week)
                );
            },
            weeknumber_iso_update_interval: function(start)
            {
                return this.update_interval(
                    start.is().monday() ? start : start.last().monday(),
                    start.clone().sunday()
                );
            },
            update_interval: function(start, end)
            {
                var start_str = instance.web.auto_date_to_str(
                        start, this.field.type
                    ),
                    end_str = instance.web.auto_date_to_str(
                        end,
                        this.field_manager.fields[this.options.end_field]
                        .field.type
                    ),
                    values = {};
                values[this.name] = start_str;
                values[this.options.end_field] = end_str;
                this.field_manager.set_values(values);
                this.reinitialize();
             },
        }
    );
};
