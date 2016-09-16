openerp.help_popup = function(instance, local) {

    var _t = instance.web._t;

    instance.web.ViewManager.include({

        do_create_view: function(view_type) {
            var self = this;
            var res = self._super(view_type);
            var params = 'height=650, width=900, location=no, ';
            params += 'resizable=yes, menubar=yes, scrollbars=yes';
            self.$el.find('span.update_help').each(function () {
                var $elem = $(this);
                if ($elem.data('click-init')) {
                    return true;
                }
                $elem.data('click-init', true);
                console.log('blabla  ')
                if (self.action.id == undefined || self.action.help_has_content == true) {
                    self.$el.find('span.update_help').hide()
                }
                $elem.on('click', function(e) {
                    path = self.action.id;
                    my_window = window.open('/web#id='+ path +'&view_type=form&model=ir.actions.act_window&action=help_popup.action_help_popup_form', 'Help', params);
                    // allows to back to the window if opened previoulsy
                    setTimeout('my_window.focus()', 1);
                });
                return true;
            });
            self.$el.find('span.view_help').each(function () {
                var $elem = $(this);
                if ($elem.data('click-init')) {
                    return true;
                }
                $elem.data('click-init', true);
                if (self.action.id == undefined || self.action.help_has_content == false) {
                    self.$el.find('span.view_help').hide()
                }
                $elem.on('click', function(e) {
                    path = self.action.id;
                    my_window = window.open('/report/html/help_popup.tpl_help/' + path, 'Help', params);
                    setTimeout('my_window.focus()', 1);
                });
                return true;

            });
            return res;
        },
    });
}
