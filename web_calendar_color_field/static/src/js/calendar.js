odoo.define("web_calendar_color_field.CalendarModel", function (require) {
    "use strict";

    const CalendarModel = require("web.CalendarModel");

    CalendarModel.include({
        /**
         * Overload to handle custom colorIndex
         *
         * Default beaviour when using a many2one field as color attribute
         * is to generate random colors based on the record id.
         *
         * We are changing that behaviour to play nicely with the newly added
         * <field filter="1" color="color"/> color attribute.
         *
         * If the field is also added to filters, and a color field is defined,
         * we use that color field as colorIndex.
         */
        _loadColors: function (element, events) {
            var self = this;
            if (this.fieldColor) {
                var fieldName = this.fieldColor;
                var filter = this.data.filters[fieldName];
                if (filter && filter.color_model && filter.field_color) {
                    // If we haven't loaded the color fields, we do it, and we
                    // store it in self._field_color_map.  We only do it once,
                    // because subsequent calls will simply read it from the map.
                    // Note: _loadRecordsToFilters will also read these values
                    // from db, but on first render it's called after this method
                    var defs = [];
                    if (!this._field_color_map) {
                        var ids = _.map(events, function (event) {
                            return event.record[fieldName][0];
                        });
                        defs.push(
                            this._rpc({
                                model: filter.color_model,
                                method: "read",
                                args: [_.uniq(ids), [filter.field_color]],
                            }).then(function (res) {
                                self._field_color_map = self._field_color_map || {};
                                _.each(res, function (item) {
                                    self._field_color_map[item.id] =
                                        item[filter.field_color];
                                });
                            })
                        );
                    }
                    Promise.all(defs).then(function () {
                        _.each(events, function (event) {
                            var value = event.record[fieldName][0];
                            event.color_index = self._field_color_map[value];
                        });
                    });
                    // Don't set model color, so that filters generate their own
                    // https://github.com/odoo/odoo/blob/14.0/addons/web/static/src/js/views/calendar/calendar_model.js#L629
                    // this.model_color = this.fields[fieldName].relation || element.model;
                } else {
                    return this._super.apply(this, arguments);
                }
            }
            return Promise.resolve();
        },
    });

    return CalendarModel;
});
