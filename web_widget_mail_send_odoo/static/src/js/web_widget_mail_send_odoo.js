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
        var $button = this.$el.find('button');
        $button.click(this.on_button_clicked);
        this.setupFocus($button);
    },
    render_value: function() {
        var self = this;
        if (!this.get("effective_readonly")) {
            this._super();
        } else {
            this.$el.find('a')
                    //.attr('href', 'nix:' + this.get('value'))
                    .removeAttr('href')
                    .text(this.get('value') || '')
                    .unbind('click')
                    .click(function () {
                        self.do_action('mail.action_email_compose_message_wizard',{
                            additional_context:{
                                default_partner_ids: self.field_manager.get_selected_ids()
                        }})
                    });

        }
    },
    on_button_clicked: function() {
        if (!this.get('value') || !this.is_syntax_valid()) {
            this.do_warn(_t("E-mail Error"), _t("Can't send email to invalid e-mail address"));
        } else {
            // action to open: mail.action_email_compose_message_wizard
            //location.href = 'mailto:' + this.get('value');
            self.do_action('mail.action_email_compose_message_wizard')
        }
    }
});

instance.web.form.widgets.add('email', 'instance.web.form.FieldEmailIntern')
//instance.web.form.widgets.add('email-intern', 'instance.web.form.FieldEmailIntern')

})()
