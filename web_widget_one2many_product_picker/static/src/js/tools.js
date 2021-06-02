// Copyright 2020 Tecnativa - Alexandre Díaz
// License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
odoo.define("web_widget_one2many_product_picker.tools", function(require) {
    "use strict";

    const field_utils = require("web.field_utils");

    /**
     * Calculate the price with discount
     *
     * @param {Number} price
     * @param {Number} discount
     * @returns {Number}
     */
    function priceReduce(price, discount) {
        return price * (1.0 - discount / 100.0);
    }

    /**
     * Print formatted price using the 'currency_field'
     * info in 'data'.
     *
     * @param {Number} value
     * @param {Object} field_info,
     * @param {String} currency_field
     * @param {Object} data
     * @returns {String}
     */
    function monetary(value, field_info, currency_field, data) {
        return field_utils.format.monetary(value, field_info, {
            data: data,
            currency_field: currency_field,
            field_digits: true,
        });
    }

    function float(value, field_info, digits) {
        return field_utils.format.float(value, field_info, {
            digits: digits,
        });
    }

    return {
        monetary: monetary,
        float: float,
        priceReduce: priceReduce,
    };
});
