/*global openerp, _, $ */

openerp.web_one2many_list_action = function (instance) {

    instance.web.form.One2ManyListView.include({
        do_activate_record: function(index, id) {
            var self = this;
            var _func = self._super
            var _args = arguments

            var local_context = {
                active_model: self.o2m.field.relation,
                active_id: id,
                active_ids: [id]
            };
            var ctx = instance.web.pyeval.eval(
                'context', new instance.web.CompoundContext(
                    self.o2m.build_context(), local_context));

            this.rpc('/web/treeview/action', {
                id: id,
                model: self.o2m.field.relation,
                context: ctx
            }).then(function (actions) {
                if (actions.length) {
                    // execute action
                    var action = actions[0][2];
                    var c = new instance.web.CompoundContext(local_context).set_eval_context(ctx);
                    if (action.context) {
                        c.add(action.context);
                    }
                    action.context = c;
                    self.do_action(action);
                } else {
                    // if no action configured apply default behaviour
                    _func.apply(self, _args);
                }
            });
        },
    });

}
