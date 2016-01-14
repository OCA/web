/*
    # -*- coding: utf-8 -*-
    ##############################################################################
    #
    #    OpenERP, Open Source Management Solution
    #    Copyright (C) 2010-2013 OpenERP s.a. (<http://openerp.com>).
    #    Copyright (C) 2013 ThinkOpen Solutions Brasil (<http://www.tkobr.com>).
    #    Author Carlos Almeida <carlos.almeida at tkobr.com>
    #
    #    This program is free software: you can redistribute it and/or modify
    #    it under the terms of the GNU Affero General Public License as
    #    published by the Free Software Foundation, either version 3 of the
    #    License, or (at your option) any later version.
    #
    #    This program is distributed in the hope that it will be useful,
    #    but WITHOUT ANY WARRANTY; without even the implied warranty of
    #    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    #    GNU Affero General Public License for more details.
    #
    #    You should have received a copy of the GNU Affero General Public License
    #    along with this program.  If not, see <http://www.gnu.org/licenses/>.
    #
    ##############################################################################
*/

openerp.web_recipients_hide = function(instance){
    var module = instance.mail //loading the namespace of the 'mail' module

    module.ThreadComposeMessage.include({
        /* Quick composer: toggle minimal / expanded mode
         * - toggle minimal (one-liner) / expanded (textarea, buttons) mode
         * - when going into expanded mode:
         *  - call `message_get_suggested_recipients` to have a list of partners to add
         *  - compute email_from list (list of unknown email_from to propose to create partners)
         */
        on_toggle_quick_composer: function (event) {
            var self = this;
            var $input = $(event.target);
            this.compute_emails_from();
            var email_addresses = _.pluck(this.recipients, 'email_address');
            var suggested_partners = $.Deferred();

            // if clicked: call for suggested recipients
            if (event.type == 'click') {
                this.is_log = $input.hasClass('oe_compose_log');
                suggested_partners = this.parent_thread.ds_thread.call('message_get_suggested_recipients', [[this.context.default_res_id], this.context])
            }
            else {
                suggested_partners.resolve({});
            }

            // when call for suggested partners finished: re-render the widget
            $.when(suggested_partners).pipe(function (additional_recipients) {
                if ((!self.stay_open || (event && event.type == 'click')) && (!self.show_composer || !self.$('textarea:not(.oe_compact)').val().match(/\S+/) && !self.attachment_ids.length)) {
                    self.show_composer = !self.show_composer || self.stay_open;
                    self.reinit();
                }
                if (!self.stay_open && self.show_composer && (!event || event.type != 'blur')) {
                    self.$('textarea:not(.oe_compact):first').focus();
                }
            });

            return suggested_partners;
        },
    });
};
