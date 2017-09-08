'use strict';

odoo.define('web_switch_company_warning.widget', function (require) {
    var Widget = require('web.Widget');
    var UserMenu = require('web.UserMenu');
    //Show a big banner in the top of the page if the company has been
    //changed in another tab or window (in the same browser)

    if (!window.SharedWorker)
        return; //not supported

    var SwitchCompanyWarningWidget = Widget.extend({
        template:'WarningWidget',
        init: function() {
            this._super();
            var self = this;
            var w =  new SharedWorker('/web_switch_company_warning/static/src/js/switch_company_warning_worker.js');

            w.port.addEventListener('message', function (msg) {
                if (msg.data.type !== 'newCtx')
                    return;
                if(msg.data.newCtx != self.session.company_id) {
                    self.$el.show();
                } else {
                    self.$el.hide();
                }
            });
            w.port.start();
            w.port.postMessage(this.session.company_id);
        }
    });

    UserMenu.include({
        init: function(parent) {
            this._super(parent);
            var switchCompanyWarning = new SwitchCompanyWarningWidget();
            switchCompanyWarning.appendTo('#oe_main_menu_navbar');
        }

    });

    return SwitchCompanyWarningWidget;
});

