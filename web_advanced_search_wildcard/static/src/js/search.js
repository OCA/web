odoo.define('web_advanced_search_wildcard', function (require) {
    "use strict";

    var core = require('web.core');
    var _lt = core._lt;
    var Field = core.search_filters_registry.get("char");

    Field.prototype.operators.push(
        {value: '=ilike', text: _lt("matches")}
    );
});
