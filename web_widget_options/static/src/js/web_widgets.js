openerp.web_widget_options = function(instance, m) {
  var _t = instance.web._t,
      QWeb = instance.web.qweb;
  var wwo = instance.wwo = {};
  var o2m = instance.wwo.o2m = {}

  o2m.rules = {
    groups: function (rule, context) {
      var user_id = instance.session.uid,
          users = new instance.web.Model('res.users'),
          query = users.query(['name', 'groups_id']).filter([['id', '=', user_id]]);

      return query.all().then(function (res) {
               var user = res[0];

               return rule.reduce(function (accum, val) {
                 return accum && user.groups_id.indexOf(val) >= 0;
               }, true);
             });
    },

    action_id: function (rule, context) {
      var action_id = context.view.options.action.id;
      return rule == action_id;
    }
  };

  function and(a, b) {
    return a && b;
  };

  function can_add_items(view_root, field_name, rules) {
    var def = $.Deferred(),
        context = {
          view: view_root,
          field_name: field_name,
          rule: rules
        },
        pending = Object.keys(rules).map(function (rule_name) {
          // Call all rules
          return o2m.rules[rule_name](rules[rule_name], context);
        });

    $.when.apply($, pending).done(function () {
      var all_true = Array.prototype.slice.call(arguments).reduce(and, true);

      if (!all_true) {
        view_root.fields[field_name].views[0].embedded_view['arch'].attrs.create = 'false';
        view_root.reload();
      }
    });
  };

  instance.web.form.FieldOne2Many.include({
    start: function () {
      /*
       * Extend the view to check for create_rule
       */
      var res = this._super.apply(this, arguments),
          action_id = this.view.options.action.id,
          view = this.views[0].embedded_view,
          view_name = this.name,
          view_root = this.view,
          rules = {};

      if (view && view['arch'].attrs.create_rule) {
        rules = JSON.parse(view['arch'].attrs.create_rule);
        can_add_items(view_root, this.name, rules);
      }

      return res;
    }
  });
};
