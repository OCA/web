odoo.define('web_advanced_search_wildcard', function (require) {
    "use strict";

    var core = require('web.core');
    var search_filters = require('web.search_filters');

    var _lt = core._lt;

    search_filters.ExtendedSearchProposition.Char.prototype.operators.push(
        {value: '=ilike', text: _lt("matches")}
    );
});
