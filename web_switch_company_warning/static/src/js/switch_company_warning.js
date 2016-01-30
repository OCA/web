'use strict';

openerp.web_switch_company_warning = function (instance) {

    //Show a big banner in the top of the page if the company has been
    //changed in another tab or window (in the same browser)

    if (!window.SharedWorker)
        return; //not supported

    instance.web.SwitchCompanyWorker = null; //keep a global reference

    instance.web.SwitchCompanyWarningWidget = instance.web.Widget.extend({

        template:'web_switch_company_warning.warningWidget',
        init: function() {
            this._super();

            var self = this;

            var w =  new SharedWorker('/web_switch_company_warning/static/src/js/switch_company_warning_worker.js');
            instance.web.SwitchCompanyWorker = w;

            w.port.addEventListener('message', function (msg) {
              if (msg.data.type !== 'newCtx')
                return;

                if(msg.data.newCtx != self.signature(self.session)) {
                    self.$el.show();
                } else {
                    self.$el.hide();
                }
            });

            w.port.start();
            w.port.postMessage(self.signature(this.session));
        },
        signature: function (session) {
                return [session.db, session.uid, session.company_id].join();
        }
    });

    instance.web.UserMenu =  instance.web.UserMenu.extend({

        init: function(parent) {
            this._super(parent);

            var switchCompanyWarning = new instance.web.SwitchCompanyWarningWidget();
            switchCompanyWarning.insertAfter(instance.webclient.$el.find('#oe_main_menu_navbar'));
        }

    });

};

