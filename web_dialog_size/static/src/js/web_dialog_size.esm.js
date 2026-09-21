/** @odoo-module **/

import {ActionDialog} from "@web/webclient/actions/action_dialog";
import {patch} from "@web/core/utils/patch";
import rpc from "web.rpc";
import {Component, onWillRender} from "@odoo/owl";
import {Dialog} from "@web/core/dialog/dialog";
import {SelectCreateDialog} from "@web/views/view_dialogs/select_create_dialog";

// The dialog size configuration is static for a session: fetch it once and
// share the promise between all dialogs instead of one RPC per dialog.
let configPromise = null;

function getDialogSizeConfig() {
    if (!configPromise) {
        configPromise = rpc
            .query({
                model: "ir.config_parameter",
                method: "get_web_dialog_size_config",
            })
            .catch((error) => {
                configPromise = null;
                throw error;
            });
    }
    return configPromise;
}

export class ExpandButton extends Component {
    setup() {
        this.lastSize = this.props.getsize();
        this.currentSize = this.props.getsize();
        this.config = getDialogSizeConfig();

        onWillRender(() => {
            // If the form lost its current state, we need to set it again
            if (this.props.getsize() !== this.currentSize) {
                this.props.setsize(this.currentSize);
            }
            // Auto maximize once if config says so
            if (this.props.getsize() !== "dialog_full_screen" && !this.sizeRestored) {
                this.config.then((r) => {
                    if (r.default_maximize) {
                        this.toggleSize();
                    }
                });
            }
        });
    }

    toggleSize() {
        if (this.currentSize === "dialog_full_screen") {
            // Restore to previous remembered size
            this.currentSize = "lg";
            this.props.setsize(this.currentSize);
            this.sizeRestored = true;
        } else {
            // Remember current size before maximizing
            this.lastSize = this.currentSize;
            this.currentSize = "dialog_full_screen";
            this.props.setsize("dialog_full_screen");
            this.sizeRestored = false;
        }
        this.render();
    }
}

ExpandButton.template = "web_dialog_size.ExpandButton";

patch(Dialog.prototype, "web_dialog_size.Dialog", {
    setup() {
        this._super(...arguments);
        this.setSize = this.setSize.bind(this);
        this.getSize = this.getSize.bind(this);
        onWillRender(() => {
            if (this._forcedSize && this.props.size !== this._forcedSize) {
                this.props.size = this._forcedSize;
            }
        });
    },

    setSize(size) {
        this._forcedSize = size;
        this.props.size = size;
        this.render();
    },

    getSize() {
        return this.props.size;
    },
});

patch(SelectCreateDialog.prototype, "web_dialog_size.SelectCreateDialog", {
    setup() {
        this._super(...arguments);
        this.setSize = this.setSize.bind(this);
        this.getSize = this.getSize.bind(this);
    },

    setSize(size) {
        this.props.size = size;
        this.render();
    },

    getSize() {
        return this.props.size;
    },
});

Object.assign(ActionDialog.components, {ExpandButton});
SelectCreateDialog.components = Object.assign(SelectCreateDialog.components || {}, {
    ExpandButton,
});
Dialog.components = Object.assign(Dialog.components || {}, {ExpandButton});
// Patch annoying validation method
Dialog.props.size.validate = (s) =>
    ["sm", "md", "lg", "xl", "dialog_full_screen"].includes(s);
