/** @odoo-module **/

import {ActionDialog} from "@web/webclient/actions/action_dialog";
import {patch} from "@web/core/utils/patch";
import rpc from "web.rpc";
const {Component} = owl;
const {onMounted} = owl.hooks;

export class ExpandButton extends Component {
    setup() {
        this.last_size = this.props.getsize();
        this.config = rpc.query({
            model: "ir.config_parameter",
            method: "get_web_dialog_size_config",
        });

        onMounted(() => {
            var self = this;
            this.config.then(function (r) {
                if (r.default_maximize && stop) {
                    self.dialog_button_extend();
                }
            });
        });
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
