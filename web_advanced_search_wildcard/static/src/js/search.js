odoo.define('web_advanced_search_wildcard', function (require) {
    "use strict";

    var core = require('web.core');
    var search_filters = require('web.search_filters');

    var _lt = core._lt;

    search_filters.ExtendedSearchProposition.Char.prototype.operators.push(
        {value: "startswith", text: _lt("starts with")},
        {value: "endswith", text: _lt("ends with")},
        {value: '=ilike', text: _lt("matches")},
    );

    search_filters.ExtendedSearchProposition.Char.include({
        get_domain: function (field, operator) {
            switch (operator.value) {
            case '∃': return [[field.name, '!=', false]];
            case '∄': return [[field.name, '=', false]];
            case 'startswith': return [[field.name, '=ilike', this.get_value() + '%']];
            case 'endswith': return [[field.name, '=ilike', '%' + this.get_value()]];
            default: return [[field.name, operator.value, this.get_value()]];
            }
        },
    });
});
