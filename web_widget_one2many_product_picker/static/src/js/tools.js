// Copyright 2020 Tecnativa - Alexandre Díaz
// License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
odoo.define("web_widget_one2many_product_picker.tools", function(require) {
    "use strict";

    var field_utils = require("web.field_utils");

    /**
     * Truncate floats
     *
     * @param {Number} value
     * @param {Object} field_info
     * @param {Array} digist
     * @returns {Number}
     */
    function float(value, field_info, digist) {
        var options = digist && {digist: digist};
        return field_utils.format.float(value, field_info, options);
    }

    /**
     * Calculate the price with discount
     *
     * @param {Number} price
     * @param {Number} discount
     * @param {Array} digist
     * @returns {Number}
     */
    function priceReduce(price, discount, digist) {
        var price_reduce = price * (1.0 - discount / 100.0);
        if (digist) {
            return float(price_reduce, undefined, digist);
        }
        return price_reduce;
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

    return {
        monetary: monetary,
        float: float,
        priceReduce: priceReduce,
    };
});
