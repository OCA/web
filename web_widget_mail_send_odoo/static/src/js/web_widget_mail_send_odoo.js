/* © 2015 initOS GmbH (<http://www.initos.com>)
*  License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
*/

openerp.web_widget_mail_send_odoo = function(instance) {

    var _t = instance.web._t,
       _lt = instance.web._lt;
    var QWeb = instance.web.qweb;

    instance.web.form.FieldEmailIntern = instance.web.form.FieldChar.extend({
        template: 'FieldEmailIntern',
        initialize_content: function() {
            this._super();
            var $button = this.$('a');
            $button.click(this.on_clicked);
            this.setupFocus($button);
        },
        render_value: function() {
            var self = this;
            if (!this.get("effective_readonly")) {
                self._super();
            } else {
                self.$el.find('a')
                    .removeAttr('href')
                    .removeAttr('target')
                    .text(self.get('value') || '');
            }
        },
        on_clicked: function() {
            var self = this;
            if (!self.get('value') || !self.is_syntax_valid()) {
                self.do_warn(_t("E-mail Error"), _t("Can't send email to invalid e-mail address"));
            } else {
                // find partner id for email
                var res_partner = new openerp.Model('res.partner');
                var parsed_email = instance.mail.ChatterUtils.parse_email(self.get('value'));
                res_partner.query(['id'])
                    .filter([['email', '=', parsed_email[1]]])
                    .first().then(function(partner){
                        if(partner){
                            var fm = self.field_manager
                            self.do_action(
                                'mail.action_email_compose_message_wizard', {
                                    additional_context: {
                                        default_partner_ids: [partner.id],
                                        default_composition_mode: 'comment',
                                        // write to active model:
                                        default_model: fm.dataset._model.name,
                                        default_res_id: fm.datarecord.id,
                                    },
                                    on_close: function(){
                                        // refresh the chatter widget here
                                        $.each(self.view.getChildren(),
                                            function(index, value){
                                                if(value.root && value.root.thread && value.root.thread.message_fetch){
                                                    value.root.thread.message_fetch()
                                                }
                                            }
                                        );
                                    },
                                }
                            );
                        } else {
                            console.log(self.build_context());
                            var pop = new instance.web.form.FormOpenPopup(self);
                            var context = new instance.web.CompoundContext(self.build_context(), {
                                default_name: parsed_email[0],
                                default_email: parsed_email[1],
                            });
                            pop.show_element(
                                'res.partner',
                                false,
                                context,
                                {
                                    title: _t("Please complete partner's information."),
                                }
                            );
                            pop.on('create_completed', self, function (id) {
                                self.on_clicked()
                            });
                        }
                    })
            }
        },
    });

    instance.web.form.widgets.add('email', 'instance.web.form.FieldEmailIntern')
}
