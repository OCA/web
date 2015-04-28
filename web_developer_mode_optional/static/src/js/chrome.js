// License, author and contributors information in:
// __openerp__.py file at the root folder of this module.

/*---------------------------------------------------------
 * OpenERP Web chrome
 *---------------------------------------------------------*/
(openerp.web_developer_mode_optional = function() {
    var instance = openerp;
    openerp.web.chrome = {};
    openerp.web.chrome = instance.web.chrome;
    var QWeb = instance.web.qweb;
    var _t = instance.web._t;
    var _lt = instance.web._lt;

    instance.web.UserMenu =  instance.web.Widget.extend({
        template: "UserMenu",
        init: function(parent) {
            this._super(parent);
            this.update_promise = $.Deferred().resolve();
        },
        start: function() {
            var self = this;
            this._super.apply(this, arguments);
            this.$el.on('click', '.dropdown-menu li a[data-menu]', function(ev) {
                ev.preventDefault();
                var f = self['on_menu_' + $(this).data('menu')];
                if (f) {
                    f($(this));
                }
            });
            this.$el.parent().show()
        },
        do_update: function () {
            var self = this;
            var fct = function() {
                var $avatar = self.$el.find('.oe_topbar_avatar');
                $avatar.attr('src', $avatar.data('default-src'));
                if (!self.session.uid)
                    return;
                var func = new instance.web.Model("res.users").get_func("read");
                return self.alive(func(self.session.uid, ["name", "company_id"])).then(function(res) {
                    var topbar_name = res.name;
                    if(instance.session.debug)
                        topbar_name = _.str.sprintf("%s (%s)", topbar_name, instance.session.db);
                    if(res.company_id[0] > 1)
                        topbar_name = _.str.sprintf("%s (%s)", topbar_name, res.company_id[1]);
                    self.$el.find('.oe_topbar_name').text(topbar_name);
                    if (!instance.session.debug) {
                        topbar_name = _.str.sprintf("%s (%s)", topbar_name, instance.session.db);
                    }
                    var avatar_src = self.session.url('/web/binary/image', {model:'res.users', field: 'image_small', id: self.session.uid});
                    $avatar.attr('src', avatar_src);

                    openerp.web.bus.trigger('resize');  // Re-trigger the reflow logic
                });
            };
            this.update_promise = this.update_promise.then(fct, fct);
        },
        on_menu_help: function() {
            window.open('http://help.odoo.com', '_blank');
        },
        on_menu_logout: function() {
            this.trigger('user_logout');
        },
        on_menu_settings: function() {
            var self = this;
            if (!this.getParent().has_uncommitted_changes()) {
                self.rpc("/web/action/load", { action_id: "base.action_res_users_my" }).done(function(result) {
                    result.res_id = instance.session.uid;
                    self.getParent().action_manager.do_action(result);
                });
            }
        },
        on_menu_account: function() {
            var self = this;
            if (!this.getParent().has_uncommitted_changes()) {
                var P = new instance.web.Model('ir.config_parameter');
                P.call('get_param', ['database.uuid']).then(function(dbuuid) {
                    var state = {
                                'd': instance.session.db,
                                'u': window.location.protocol + '//' + window.location.host,
                            };
                    var params = {
                        response_type: 'token',
                        client_id: dbuuid || '',
                        state: JSON.stringify(state),
                        scope: 'userinfo',
                    };
                    instance.web.redirect('https://accounts.odoo.com/oauth2/auth?'+$.param(params));
                }).fail(function(result, ev){
                    ev.preventDefault();
                    instance.web.redirect('https://accounts.odoo.com/web');
                });
            }
        },
      on_menu_about: function() {
          var self = this;
          var Users = new openerp.web.Model('res.users');
          var debug_mode_enabled = true;
          
          Users.call('has_group', ['web_developer_mode_optional.group_developer'])
          .then(function(result) {
              debug_mode_enabled = result;
              self.rpc("/web/webclient/version_info", {}).done(function(res) {
                  var $help = $(QWeb.render("UserMenu.about", {version_info: res}));
    
                  if (debug_mode_enabled) {
                      $help.find('a.oe_activate_debug_mode').click(function (e) {
                          e.preventDefault();
                          window.location = $.param.querystring( window.location.href, 'debug');
                      });
                  } else {
                      $help.find('a.oe_activate_debug_mode').remove();
                  }
                  new instance.web.Dialog(this, {
                      size: 'medium',
                      dialogClass: 'oe_act_window',
                      title: _t("About"),
                  }, $help).open();
              });
          });
      },
    });

})();
