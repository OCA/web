/* Copyright 2021 Quentin DUPONT
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). */
odoo.define('web_widget_datepicker_fulloptions.datepicker_fulloptions', function (require) {
"use strict";

    var DatePicker = require('web.datepicker');

    var DatePickerFullOptions = DatePicker.DateWidget.include({
        /**
         * @override
         */
        init: function (parent, options) {
            this._super(parent, options);
            this.options.useCurrent = true;
            this.options.buttons.showToday = true;
            this.options.buttons.showClear = true;
            this.options.buttons.showClose = true;
        },
    });

});
