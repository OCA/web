odoo.define('web_advanced_search_wildcard', function (require) {
    "use strict";

    var core = require('web.core');
    var search_filters = require('web.search_filters');

    var _lt = core._lt;

    search_filters.ExtendedSearchProposition.Char.prototype.operators.push(
        {value: 'in', text: _lt("is in")}
    );

    search_filters.ExtendedSearchProposition.Char.include({
        get_domain: function (field, operator) {
            switch (operator.value) {
            case '∃': return [[field.name, '!=', false]];
            case '∄': return [[field.name, '=', false]];
            case 'in':
                return [[field.name, 'in', this.get_value().split("|")]];
            default: return [[field.name, operator.value, this.get_value()]];
            }
        },
    });
});
