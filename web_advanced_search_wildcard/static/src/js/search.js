odoo.define('web_advanced_search_wildcard', function (require) {
    "use strict";

    var core = require('web.core');
    var Char = core.search_filters_registry.get('char')
    var _lt = core._lt;

    Char.prototype.operators.push(
        {value: "startswith", text: _lt("starts with")},
        {value: "not_startswith", text: _lt("doesn't start with")},
        {value: "endswith", text: _lt("ends with")},
        {value: "not_endswith", text: _lt("doesn't end with")},
        {value: '=ilike', text: _lt("matches")}
    );

    Char.include({
        get_domain: function (field, operator) {
            switch (operator.value) {
                case 'startswith': return [[field.name, '=ilike', this.get_value() + '%']];
                case 'not_startswith': return ['!', [field.name, '=ilike', this.get_value() + '%']];
                case 'endswith': return [[field.name, '=ilike', '%' + this.get_value()]];
                case 'not_endswith': return ['!', [field.name, '=ilike', '%' + this.get_value()]];
                default: return this._super(field, operator);
            }
        },
    });
});
