/* Copyright 2022 Stefan Rijnhart <stefan@opener.amsterdam>
   License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl). */
odoo.define("web_widget_statusbar_visible_from_record", function (require) {
    "use strict";
    var FieldStatus = require("web.relational_fields").FieldStatus;
    var DynamicFieldStatus = FieldStatus.include({
        _setState: function () {
            /*
              Check if the visible_states_field attribute is set and populated
              on the record. It should contain a comma separated list to filter
              visible states by.
            */
            this._super();
            const visible_states_field = this.attrs.visible_states_field;
            if (visible_states_field && this.recordData[visible_states_field]) {
                const visible_states = this.recordData[visible_states_field].split(",");
                this.status_information = this.status_information.filter(function (
                    value,
                    index, // eslint-disable-line no-unused-vars
                    arr // eslint-disable-line no-unused-vars
                ) {
                    return value.selected || visible_states.includes(String(value.id));
                });
            }
        },
    });
    return DynamicFieldStatus;
});
