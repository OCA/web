/** @odoo-module **/

/* global require*/
var session = require("web.session");
import {ActionDialog} from "@web/webclient/actions/action_dialog";
const {Component} = owl;
import {patch} from "@web/core/utils/patch";

export class ExpandButton extends Component {
    setup() {
        if (session.default_maximize) {
            this.last_size = "modal-lg";
        } else {
            this.last_size = this.props.getsize();
        }
    }

    dialog_button_extend() {
        this.props.setsize("dialog_full_screen");
    }

    dialog_button_restore() {
        this.props.setsize(this.last_size);
    }
}

ExpandButton.template = "web_dialog_size.ExpandButton";

patch(ActionDialog.prototype, "web_dialog_size.ActionDialog", {
    setup() {
        this._super(...arguments);
        this.setSize = this.setSize.bind(this);
        this.getSize = this.getSize.bind(this);

        if (session.default_maximize) {
            this.last_size = "modal-lg";
            this.size = "dialog_full_screen";
        }
    },

    setSize(size) {
        this.size = size;
        this.render();
    },

    getSize() {
        return this.size;
    },
});

patch(ActionDialog, "web_dialog_size.ActionDialog", {
    components: {
        ...ActionDialog.components,
        ExpandButton,
    },
});
