odoo.define("web_action_conditionable.view", function(require) {
    "use strict";
    var view = require("web.View");
    var py = window.py; // to silence linters
    view.include({
        is_action_enabled : function(action) {
            var attrs = this.fields_view.arch.attrs;
            if (action in attrs) {
            try {
                return this._super(action);
             } catch (error) {
                var expr = attrs[action];
                var expression = py.parse(py.tokenize(expr));
                var result = py.evaluate(expression).toJSON();
                return result;
                }
            } else {
                return true;
            }
        }
    });
});
