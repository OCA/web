//-*- coding: utf-8 -*-
//############################################################################
//
//   OpenERP, Open Source Management Solution
//   This module copyright (C) 2014 Therp BV (<http://therp.nl>).
//
//   This program is free software: you can redistribute it and/or modify
//   it under the terms of the GNU Affero General Public License as
//   published by the Free Software Foundation, either version 3 of the
//   License, or (at your option) any later version.
//
//   This program is distributed in the hope that it will be useful,
//   but WITHOUT ANY WARRANTY; without even the implied warranty of
//   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//   GNU Affero General Public License for more details.
//
//   You should have received a copy of the GNU Affero General Public License
//   along with this program.  If not, see <http://www.gnu.org/licenses/>.
//
//############################################################################

openerp.web_pytz = function(instance)
{
    var original_pyeval_context = instance.web.pyeval.context;

    var tzinfo = py.type('tzinfo', null, {
        tzname: function()
        {
            var args = py.PY_parseArgs(arguments, 'dst');
            return py.str.fromJSON(this.zone.name);
        },
        localize: function()
        {
            var args = py.PY_parseArgs(arguments, 'dst'),
                result = py.PY_call(
                    args.dst.__class__,
                    [
                        py.float.fromJSON(args.dst.year),
                        py.float.fromJSON(args.dst.month),
                        py.float.fromJSON(args.dst.day),
                        py.float.fromJSON(args.dst.hour),
                        py.float.fromJSON(args.dst.minute),
                        py.float.fromJSON(args.dst.second),
                        py.float.fromJSON(args.dst.microsecond),
                    ]);
            result.tzinfo = this;
            return result;
        },
    });

    var pytz = py.PY_call(py.object);
    pytz.timezone = py.PY_def.fromJSON(function()
    {
        var args = py.PY_parseArgs(arguments, 'tz_name'),
            tz = moment.tz.zone(args.tz_name.toJSON()),
            result = py.PY_call(tzinfo);
        result.zone = tz;
        return result;
    });
    pytz.utc = py.PY_call(
        py.PY_getAttr(pytz, 'timezone'), [py.str.fromJSON('UTC')]);

    function astimezone()
    {
        var args = py.PY_parseArgs(arguments, 'tzinfo');
        // TODO: check that we only do this with localized dts
        var d = moment.tz(
            {
                year: this.year,
                month: this.month - 1,
                day: this.day,
                hour: this.hour,
                minute: this.minute,
                second: this.second,
            },
            this.tzinfo.zone.name)
            .tz(args.tzinfo.zone.name);
        return py.PY_call(
            this.__class__,
            [d.year(), d.month() + 1, d.date(), d.hour(), d.minute(),
             d.second()]);
    };

    instance.web.pyeval.context = function ()
    {
        var ctx = original_pyeval_context();
        ctx.datetime.datetime.astimezone = astimezone;
        return _.extend(
                ctx,
                {
                    pytz: pytz,
                    utc_today: function(args, kwargs)
                    {
                        var timezone = py.PY_call(
                                py.PY_getAttr(pytz, 'timezone'),
                                [py.str.fromJSON(
                                    ctx.tz || (args.length ? args[0] : 'UTC'))]),
                            now = py.PY_call(
                                py.PY_getAttr(ctx.datetime.datetime, 'now')),
                            localized = py.PY_call(
                                py.PY_getAttr(timezone, 'localize'),
                                [now]);
                        localized.hour = 0;
                        localized.minute = 0;
                        localized.second = 0;
                        localized.millisecond = 0;
                        return py.PY_call(
                            py.PY_getAttr(localized, 'astimezone'),
                            [py.PY_getAttr(pytz, 'utc')]);
                    }
                });
    }
}
