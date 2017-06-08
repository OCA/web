/******************************************************************************
 *
 *    OpenERP, Open Source Management Solution
 *    This module copyright (C) 2015 Savoir-faire Linux
 *    (<http://www.savoirfairelinux.com>).
 *
 *    This program is free software: you can redistribute it and/or modify
 *    it under the terms of the GNU Affero General Public License as
 *    published by the Free Software Foundation, either version 3 of the
 *    License, or (at your option) any later version.
 *
 *    This program is distributed in the hope that it will be useful,
 *    but WITHOUT ANY WARRANTY; without even the implied warranty of
 *    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *    GNU Affero General Public License for more details.
 *
 *    You should have received a copy of the GNU Affero General Public License
 *    along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 ******************************************************************************/

openerp.web_widget_datetimelocal = function (instance) {

    instance.web.DateTimeLocalWidget = instance.web.DateTimeWidget.extend({
        type_of_date: "datetimelocal",

        start: function() {
            var self = this;
            this.$input = this.$el.find('input.oe_datepicker_master');
            this.$input_picker = this.$el.find('input.oe_datepicker_container');

            $.datepicker.setDefaults({
                clearText: _t('Clear'),
                clearStatus: _t('Erase the current date'),
                closeText: _t('Done'),
                closeStatus: _t('Close without change'),
                prevText: _t('<Prev'),
                prevStatus: _t('Show the previous month'),
                nextText: _t('Next>'),
                nextStatus: _t('Show the next month'),
                currentText: _t('Today'),
                currentStatus: _t('Show the current month'),
                monthNames: Date.CultureInfo.monthNames,
                monthNamesShort: Date.CultureInfo.abbreviatedMonthNames,
                monthStatus: _t('Show a different month'),
                yearStatus: _t('Show a different year'),
                weekHeader: _t('Wk'),
                weekStatus: _t('Week of the year'),
                dayNames: Date.CultureInfo.dayNames,
                dayNamesShort: Date.CultureInfo.abbreviatedDayNames,
                dayNamesMin: Date.CultureInfo.shortestDayNames,
                dayStatus: _t('Set DD as first week day'),
                dateStatus: _t('Select D, M d'),
                firstDay: Date.CultureInfo.firstDayOfWeek,
                initStatus: _t('Select a date'),
                isRTL: false
            });
            $.timepicker.setDefaults({
                timeOnlyTitle: _t('Choose Time'),
                timeText: _t('Time'),
                hourText: _t('Hour'),
                minuteText: _t('Minute'),
                secondText: _t('Second'),
                currentText: _t('Now'),
                closeText: _t('Done')
            });

            this.picker({
                onClose: this.on_picker_select,
                onSelect: this.on_picker_select,
                changeMonth: true,
                changeYear: true,
                showWeek: true,
                showButtonPanel: true,
                firstDay: Date.CultureInfo.firstDayOfWeek
            });
            // Some clicks in the datepicker dialog are not stopped by the
            // datepicker and "bubble through", unexpectedly triggering the bus's
            // click event. Prevent that.
            this.picker('widget').click(function (e) { e.stopPropagation(); });

            this.$el.find('img.oe_datepicker_trigger').click(function() {
                if (self.get("effective_readonly") || self.picker('widget').is(':visible')) {
                    self.$input.focus();
                    return;
                }
                self.picker('setDate', self.get('value') ? instance.web.auto_str_to_date(self.get('value'), 'datetimelocal') : new Date());
                self.$input_picker.show();
                self.picker('show');
                self.$input_picker.hide();
            });
            this.set_readonly(false);
            this.set({'value': false});
        },
    });

    instance.web.form.FieldDatetimelocal = instance.web.form.FieldDatetime.extend({
        build_widget: function() {
            return new instance.web.DateTimeLocalWidget(this);
        },
    });

    instance.web.form.widgets.add('datetimelocal', 'instance.web.form.FieldDatetimelocal');

    /***************************
     * Format functions
     ***************************/
    var normalize_format = function (format) {
        return Date.normalizeFormat(instance.web.strip_raw_chars(format));
    };

    instance.web.format_value = function (value, descriptor, value_if_empty) {
        // If NaN value, display as with a `false` (empty cell)
        if (typeof value === 'number' && isNaN(value)) {
            value = false;
        }
        //noinspection FallthroughInSwitchStatementJS
        switch (value) {
        case '':
            if (descriptor.type === 'char' || descriptor.type === 'text') {
                return '';
            }
            console.warn('Field', descriptor, 'had an empty string as value, treating as false...');
        case false:
        case undefined:
        case Infinity:
        case -Infinity:
            return value_if_empty === undefined ?  '' : value_if_empty;
        }
        var l10n = _t.database.parameters;
        switch (descriptor.widget || descriptor.type || (descriptor.field && descriptor.field.type)) {
        case 'id':
            return value.toString();
        case 'integer':
            return instance.web.insert_thousand_seps(
                _.str.sprintf('%d', value));
        case 'float':
            var digits = descriptor.digits ? descriptor.digits : [69,2];
            digits = typeof digits === "string" ? py.eval(digits) : digits;
            var precision = digits[1];
            var formatted = _.str.sprintf('%.' + precision + 'f', value).split('.');
            formatted[0] = instance.web.insert_thousand_seps(formatted[0]);
            return formatted.join(l10n.decimal_point);
        case 'float_time':
            var pattern = '%02d:%02d';
            if (value < 0) {
                value = Math.abs(value);
                pattern = '-' + pattern;
            }
            var hour = Math.floor(value);
            var min = Math.round((value % 1) * 60);
            if (min == 60){
                min = 0;
                hour = hour + 1;
            }
            return _.str.sprintf(pattern, hour, min);
        case 'many2one':
            // name_get value format
            return value[1] ? value[1].split("\n")[0] : value[1];
        case 'one2many':
        case 'many2many':
            if (typeof value === 'string') {
                return value;
            }
            return _.str.sprintf(_t("(%d records)"), value.length);
        case 'datetime':
            if (typeof(value) == "string")
                value = instance.web.auto_str_to_date(value);
            
            return value.toString(normalize_format(l10n.date_format)
                                  + ' ' + normalize_format(l10n.time_format));
        case 'datetimelocal':
            if (typeof(value) == "string")
                value = instance.web.auto_str_to_date(value, 'datetimelocal');
            
            return value.toString(normalize_format(l10n.date_format)
                                  + ' ' + normalize_format(l10n.time_format));
        case 'date':
            if (typeof(value) == "string")
                value = instance.web.auto_str_to_date(value);
            return value.toString(normalize_format(l10n.date_format));
        case 'time':
            if (typeof(value) == "string")
                value = instance.web.auto_str_to_date(value);
            return value.toString(normalize_format(l10n.time_format));
        case 'selection': case 'statusbar':
            // Each choice is [value, label]
            if(_.isArray(value)) {
                value = value[0]
            }
            var result = _(descriptor.selection).detect(function (choice) {
                return choice[0] === value;
            });
            if (result) { return result[1]; }
            return;
        default:
            return value;
        }
    };

    instance.web.parse_value = function (value, descriptor, value_if_empty) {
        var date_pattern = normalize_format(_t.database.parameters.date_format),
        time_pattern = normalize_format(_t.database.parameters.time_format);
        switch (value) {
        case false:
        case "":
            return value_if_empty === undefined ?  false : value_if_empty;
        }
        switch (descriptor.widget || descriptor.type || (descriptor.field && descriptor.field.type)) {
        case 'integer':
            var tmp;
            do {
                tmp = value;
                value = value.replace(instance.web._t.database.parameters.thousands_sep, "");
            } while(tmp !== value);
            tmp = Number(value);
            // do not accept not numbers or float values
            if (isNaN(tmp) || tmp % 1)
                throw new Error(_.str.sprintf(_t("'%s' is not a correct integer"), value));
            return tmp;
        case 'float':
            var tmp;
            var tmp2 = value;
            do {
                tmp = tmp2;
                tmp2 = tmp.replace(instance.web._t.database.parameters.thousands_sep, "");
            } while(tmp !== tmp2);
            var reformatted_value = tmp.replace(instance.web._t.database.parameters.decimal_point, ".");
            var parsed = Number(reformatted_value);
            if (isNaN(parsed))
                throw new Error(_.str.sprintf(_t("'%s' is not a correct float"), value));
            return parsed;
        case 'float_time':
            var factor = 1;
            if (value[0] === '-') {
                value = value.slice(1);
                factor = -1;
            }
            var float_time_pair = value.split(":");
            if (float_time_pair.length != 2)
                return factor * instance.web.parse_value(value, {type: "float"});
            var hours = instance.web.parse_value(float_time_pair[0], {type: "integer"});
            var minutes = instance.web.parse_value(float_time_pair[1], {type: "integer"});
            return factor * (hours + (minutes / 60));
        case 'progressbar':
            return instance.web.parse_value(value, {type: "float"});
        case 'datetime':
            var datetime = Date.parseExact(
                value, (date_pattern + ' ' + time_pattern));
            if (datetime !== null)
                return instance.web.datetime_to_str(datetime);
            datetime = Date.parseExact(value, (date_pattern));
            if (datetime !== null)
                return instance.web.datetime_to_str(datetime);
            var leading_zero_value = value.toString().replace(/\d+/g, function(m){
                return m.length === 1 ? "0" + m : m ;
            });
            datetime = Date.parseExact(leading_zero_value, (date_pattern + ' ' + time_pattern));
            if (datetime !== null)
                return instance.web.datetime_to_str(datetime);
            datetime = Date.parseExact(leading_zero_value, (date_pattern));
            if (datetime !== null)
                return instance.web.datetime_to_str(datetime);
            datetime = Date.parse(value);
            if (datetime !== null)
                return instance.web.datetime_to_str(datetime);
            throw new Error(_.str.sprintf(_t("'%s' is not a correct datetime"), value));
        case 'datetimelocal':
            var datetimelocal = Date.parseExact(
                    value, (date_pattern + ' ' + time_pattern));
            if (datetimelocal !== null)
                return instance.web.datetimelocal_to_str(datetimelocal);
            datetimelocal = Date.parseExact(value, (date_pattern));
            if (datetimelocal !== null)
                return instance.web.datetimelocal_to_str(datetimelocal);
            var leading_zero_value = value.toString().replace(/\d+/g, function(m){
                return m.length === 1 ? "0" + m : m ;
            });
            datetimelocal = Date.parseExact(leading_zero_value, (date_pattern + ' ' + time_pattern));
            if (datetimelocal !== null)
                return instance.web.datetimelocal_to_str(datetimelocal);
            datetimelocal = Date.parseExact(leading_zero_value, (date_pattern));
            if (datetimelocal !== null)
                return instance.web.datetimelocal_to_str(datetimelocal);
            datetimelocal = Date.parse(value);
            if (datetimelocal !== null)
                return instance.web.datetimelocal_to_str(datetimelocal);
            throw new Error(_.str.sprintf(_t("'%s' is not a correct datetime"), value));
        case 'date':
            var date = Date.parseExact(value, date_pattern);
            if (date !== null)
                return instance.web.date_to_str(date);
            date = Date.parseExact(value.toString().replace(/\d+/g, function(m){
                return m.length === 1 ? "0" + m : m ;
            }), date_pattern);
            if (date !== null)
                return instance.web.date_to_str(date);
            date = Date.parse(value);
            if (date !== null)
                return instance.web.date_to_str(date);
            throw new Error(_.str.sprintf(_t("'%s' is not a correct date"), value));
        case 'time':
            var time = Date.parseExact(value, time_pattern);
            if (time !== null)
                return instance.web.time_to_str(time);
            time = Date.parse(value);
            if (time !== null)
                return instance.web.time_to_str(time);
            throw new Error(_.str.sprintf(_t("'%s' is not a correct time"), value));
        }
        return value;
    };

    instance.web.auto_str_to_date = function(value, type) {
        switch(type) {
        case 'datetimelocal':
            try {
                return instance.web.str_to_datetimelocal(value);
            } catch(e) {}
            try {
                return instance.web.str_to_date(value);
            } catch(e) {}
            try {
                return instance.web.str_to_time(value);
            } catch(e) {}
            throw new Error(_.str.sprintf(_t("'%s' is not a correct date, datetime nor time"), value));
        default:
            try {
                return instance.web.str_to_datetime(value);
            } catch(e) {}
            try {
                return instance.web.str_to_date(value);
            } catch(e) {}
            try {
                return instance.web.str_to_time(value);
            } catch(e) {}
            throw new Error(_.str.sprintf(_t("'%s' is not a correct date, datetime nor time"), value));
        }
    };

    instance.web.auto_date_to_str = function(value, type) {
        switch(type) {
        case 'datetime':
            return instance.web.datetime_to_str(value);
        case 'datetimelocal':
            return instance.web.datetimelocal_to_str(value);
        case 'date':
            return instance.web.date_to_str(value);
        case 'time':
            return instance.web.time_to_str(value);
        default:
            throw new Error(_.str.sprintf(_t("'%s' is not convertible to date, datetime nor time"), type));
        }
    };

    /***********
     * dates.js methods
     ***********/

    /*
     * Left-pad provided arg 1 with zeroes until reaching size provided by second
     * argument.
     *
     * @param {Number|String} str value to pad
     * @param {Number} size size to reach on the final padded value
     * @returns {String} padded string
     */
    var zpad = function(str, size) {
        str = "" + str;
        return new Array(size - str.length + 1).join('0') + str;
    };

    /**
     * Converts a string to a Date javascript object using OpenERP's
     * datetime string format (exemple: '2011-12-01 15:12:35').
     * 
     * @param {String} str A string representing a datetime.
     * @returns {Date}
     */
    instance.web.str_to_datetimelocal = function(str) {
        if(!str) {
            return str;
        }
        var regex = /^(\d\d\d\d-\d\d-\d\d \d\d:\d\d:\d\d)(?:\.\d+)?$/;
        var res = regex.exec(str);
        if ( !res ) {
            throw new Error(_.str.sprintf(_t("'%s' is not a valid datetime"), str));
        }
        var obj = Date.parseExact(res[1], 'yyyy-MM-dd HH:mm:ss');
        if (! obj) {
            throw new Error(_.str.sprintf(_t("'%s' is not a valid datetime"), str));
        }
        return obj;
    };

    /**
     * Converts a Date javascript object to a string using OpenERP's
     * datetime string format (exemple: '2011-12-01 15:12:35').
     * 
     * @param {Date} obj
     * @returns {String} A string representing a datetime.
     */
    instance.web.datetimelocal_to_str = function(obj) {
        if (!obj) {
            return false;
        }
        return zpad(obj.getFullYear(),4) + "-" + zpad(obj.getMonth() + 1,2) + "-"
            + zpad(obj.getDate(),2) + " " + zpad(obj.getHours(),2) + ":"
            + zpad(obj.getMinutes(),2) + ":" + zpad(obj.getSeconds(),2);
    };
};
