/* © 2015 initOS GmbH (<http://www.initos.com>)
*  License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
*/

(function() {

var instance = openerp;
var _t = instance.web._t,
   _lt = instance.web._lt;
var QWeb = instance.web.qweb;

instance.web.form.FieldEmailIntern = instance.web.form.FieldChar.extend({
    template: 'FieldEmailIntern',
    initialize_content: function() {
        this._super();
        var $button = this.$el.find('a');
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
            res_partner.query(['id'])
                .filter([['email','=',self.get('value')]])
                .first().then(function(partner){
                    if(partner){
                        var fm = self.field_manager
                        self.do_action(
                            'mail.action_email_compose_message_wizard',{
                            additional_context:{
                                default_partner_ids: [partner.id],
                                default_composition_mode: 'comment',
                                /* write to active model:
                                I think we do not want't this on res.partner?
                                Make this configurable?

                                default_model: fm.dataset._model.name,
                                default_res_id: fm.datarecord.id,
                                */
                            }}
                        )
                    } else {
                        self.do_warn(_t("E-mail Error"),
                            _t("No partner for email."));
                        // fall back to mailto:
                        location.href = 'mailto:' + self.get('value');
                    }
                })
        }
    },
});

// Todo: Do not replace the default widget by default, make this configurable
//       or put in an extra module
instance.web.form.widgets.add('email', 'instance.web.form.FieldEmailIntern')
//instance.web.form.widgets.add('email-intern', 'instance.web.form.FieldEmailIntern')

})()
