/** @odoo-module **/

const {Component} = owl;

export class WhatsAppWebButton extends Component {
    get phoneHref() {
        return "https://wa.me/" + this.props.value.replace(/\s+/g, "");
    }
}

WhatsAppWebButton.template = "web_phone_field_whatsapp.WhatsAppWebButton";
