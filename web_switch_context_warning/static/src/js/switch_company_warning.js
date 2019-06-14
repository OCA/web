odoo.define('web_switch_context_warning.widget', function (require) {
    'use strict';

    var Widget = require('web.Widget');
    var UserMenu = require('web.UserMenu');
    var session = require('web.session');
    // Show a big banner in the top of the page if the company has been
    // changed in another tab or window (in the same browser)

    if (!window.SharedWorker) {
        // Not supported
        return;
    }
    var SwitchCompanyWarningWidget = Widget.extend({
        template:'web_switch_context_warning.warningWidget',
        init: function () {
            this._super();
            var self = this;
            var w = new SharedWorker('/web_switch_context_warning/static/src/js/switch_company_warning_worker.js');
            w.port.addEventListener('message', function (msg) {
                if (msg.data.type !== 'newCtx') {
                    return;
                }
                if (msg.data.newCtx === self.generateSignature()) {
                    self.$el.hide();
                } else {
                    self.$el.show();
                }
            });
            w.port.start();
            w.port.postMessage(this.generateSignature());
        },
        generateSignature: function () {
            console.log(session)
            return [session.uid, session.company_id, session.db].join();
        },
    });

    UserMenu.include({
        init: function (parent) {
            this._super(parent);
            var switchCompanyWarning = new SwitchCompanyWarningWidget();
            // Check if Odoo version is Enterprise
            var isEnterprise = odoo.session_info.server_version_info[5] === 'e';
            if (isEnterprise) {
                switchCompanyWarning.insertAfter('.o_main_navbar');
            } else {
                // Choose where to append depending on whether web_responsive is installed or not
                if (document.getElementById('oe_main_menu_navbar')) {
                    switchCompanyWarning.appendTo('#oe_main_menu_navbar');
                } else {
                    switchCompanyWarning.insertAfter('.main-nav');
                }
            }
        },

    });

    return SwitchCompanyWarningWidget;
});

