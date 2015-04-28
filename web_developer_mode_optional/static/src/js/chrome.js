// License, author and contributors information in:
// __openerp__.py file at the root folder of this module.

/*---------------------------------------------------------
 * OpenERP Web chrome
 *---------------------------------------------------------*/
openerp.web_developer_mode_optional = function() {
    var instance = openerp;
    openerp.web.chrome = {};
    var QWeb = instance.web.qweb;
    var _t = instance.web._t;

    instance.web.UserMenuDevel =  instance.web.UserMenu.include({
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

}
