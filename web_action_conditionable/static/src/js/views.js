/*global openerp, _, $ */

openerp.web_action_conditionable = function (instance) {
    instance.web.View.include({
        /**
         * @override
         */
        is_action_enabled: function(action) {
            var attrs = this.fields_view.arch.attrs;
            if (action in attrs) {
                try {
                    return this._super(action);
                } catch(error) {
                    var expr = attrs[action];
                    var expression = py.parse(py.tokenize(expr));
                    var cxt = this.dataset.get_context().__eval_context;
                    cxt = cxt ? cxt.__contexts[1] : {};
                    cxt['_group_refs'] = instance.session.group_refs;

                    return py.evaluate(expression, cxt).toJSON();
                }
            } else {
                return true;
            }
        }
    });
}
