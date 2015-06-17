openerp.help_contextual_popup = function(instance, local) {

    var _t = instance.web._t;
    instance.web.ViewManager.include({

        do_create_view: function(view_type) {
            var self = this;
            var res = self._super(view_type);
            self.$el.find('span.view_help').each(function () {
                var $elem = $(this);
                if ($elem.data('click-init')) {
                    return true;
                }
                $elem.data('click-init', true);
                
                var help_html = '';
                if (self.action.help) {
                    help_html += '<h3>Odoo Help</h3>'
                    help_html += '<div id="erp_help">' + self.action.help + '</div>';
                }
                if (self.action.custom_help) {
                    help_html += '<h3>Specific Help</h3>'
                    help_html += '<div id="custom_help">' + self.action.custom_help + '</div>'
                }

                $elem.on('click', function(e) {

                    new instance.web.Dialog(self, {
                        size: 'medium',
                        title: _t("Help: ") + self.action.name,
                        buttons: [
                            {text: _t("Ok"), click: function() { this.parents('.modal').modal('hide');}}
                        ]
                    }, help_html).open(); // self.action.res_model
                });

                return true;

            });
            return res;
        },
    });
}
