function recover_field_value_or_field(openerp, field_name) {
    field_value = openerp.field_manager.get_field_value(field_name);
    if (field_value === false) {
        field_value = field_name;
    }
    return field_value;
}

openerp.web_extended_email_widget = function(instance) {
    instance.web.form.FieldEmail = instance.web.form.FieldEmail.extend({
        render_value: function() {
            this._super();
            mailto_text = 'mailto:' + this.get('value');
            mailto_params = [];

            if (this.options.cc) {
                cc_value = recover_field_value_or_field(this, this.options.cc);
                mailto_params.push('cc=' + cc_value);
            }
            if (this.options.bcc) {
                bcc_value = recover_field_value_or_field(this,
                                                         this.options.bcc);
                mailto_params.push('bcc=' + bcc_value);
            }
            if (this.options.replyto) {
                replyto_value = recover_field_value_or_field(
                    this, this.options.replyto);
                mailto_params.push('reply-to=' + replyto_value);
            }
            if (this.options.subject) {
                subject_value = recover_field_value_or_field(
                    this, this.options.subject);
                mailto_params.push('subject=' +
                                   encodeURIComponent(subject_value));
            }
            txt_mailto_params = mailto_params.join('&');

            mailto_link = jQuery.param.querystring(mailto_text,
                                                   txt_mailto_params);

            this.$el.find('a')
                .attr('href', mailto_link)
                .attr('target', '_self')
                .text(this.get('value') || '');
        }
    });

    instance.email_button = {}
    instance.email_button.mail_link = function(parent, action) {
        mailto_text = 'mailto:' + action.params.email;
        mailto_params = [];
        if (action.params.cc) {
            mailto_params.push('cc=' + action.params.cc);
        }
        if (action.params.bcc) {
            mailto_params.push('bcc=' + action.params.bcc);
        }
        if (action.params.replyto) {
            mailto_params.push('reply-to=' + action.params.replyto);
        }
        if (action.params.subject) {
            mailto_params.push('subject=' +
                                   encodeURIComponent(action.params.subject));
        }
        txt_mailto_params = mailto_params.join('&');
        mailto_link = jQuery.param.querystring(mailto_text,
                                               txt_mailto_params);
        window.open(mailto_link, '_blank');
    };
    instance.web.client_actions.add('email_button.mail_link',
                                    "instance.email_button.mail_link");
};