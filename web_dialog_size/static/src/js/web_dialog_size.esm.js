import {Component, onWillRender, onWillUpdateProps, useState} from "@odoo/owl";
import {ActionDialog} from "@web/webclient/actions/action_dialog";
import {Dialog} from "@web/core/dialog/dialog";
import {SelectCreateDialog} from "@web/views/view_dialogs/select_create_dialog";
import {patch} from "@web/core/utils/patch";
import {useService} from "@web/core/utils/hooks";
import {browser} from "@web/core/browser/browser";

/**
 * Resizing a list column by hand fixes the width of the table and its parent in
 * pixels, so the list no longer follows the dialog width. Unset them to let the
 * list fit its columns to the new dialog size.
 *
 * A window resize event would do it too, but it also closes every component
 * listening to it, such as the analytic distribution widget, and with it the
 * "Search More..." dialog it opened.
 *
 * @param {HTMLElement} el element inside the dialog
 */
function resetListColumnWidths(el) {
    const dialog = el.closest(".modal-content");
    if (!dialog) {
        return;
    }
    for (const table of dialog.querySelectorAll(".o_list_table")) {
        table.style.width = "";
        table.parentElement.style.width = "";
    }
}

export class ExpandButton extends Component {
    setup() {
        this.original_size = this.props.getoriginalsize
            ? this.props.getoriginalsize()
            : this.props.getsize() !== "dialog_full_screen"
              ? this.props.getsize()
              : Dialog.defaultProps.size;
        // The props never change, so the dialog rendering does not render
        // this button again: keep the size in its own state to switch icons
        this.state = useState({size: this.props.getsize()});
        // The dialog may be resized from outside the button, e.g. when the
        // default maximize setting is applied once the server answers
        onWillUpdateProps((nextProps) => {
            this.state.size = nextProps.size;
        });
    }

    setSize(size) {
        this.props.setsize(size);
        this.state.size = size;
    }

    dialog_button_extend(ev) {
        resetListColumnWidths(ev.currentTarget);
        this.setSize("dialog_full_screen");
        browser.localStorage.setItem("odoo.web_dialog_size.value", "true");
    }

    dialog_button_restore(ev) {
        resetListColumnWidths(ev.currentTarget);
        this.setSize(this.original_size);
        browser.localStorage.setItem("odoo.web_dialog_size.value", "false");
    }
}

ExpandButton.template = "web_dialog_size.ExpandButton";

patch(Dialog.prototype, {
    setup() {
        this.originalSize = this.props.size;
        this._parentSize = this.props.size;
        super.setup();
        this.setSize = this.setSize.bind(this);
        this.getSize = this.getSize.bind(this);
        this.getOriginalSize = this.getOriginalSize.bind(this);

        const storedValue = browser.localStorage.getItem("odoo.web_dialog_size.value");
        const lastServerValue = browser.localStorage.getItem(
            "odoo.web_dialog_size.last_server_value"
        );

        if (storedValue === "true") {
            this._forcedSize = "dialog_full_screen";
            this.props.size = "dialog_full_screen";
        }

        const orm = useService("orm");
        orm.call("ir.config_parameter", "get_web_dialog_size_config")
            .then((r) => {
                const serverValue = String(Boolean(r.default_maximize));
                if (serverValue !== lastServerValue) {
                    browser.localStorage.setItem(
                        "odoo.web_dialog_size.last_server_value",
                        serverValue
                    );

                    if (storedValue === null || storedValue === lastServerValue) {
                        browser.localStorage.setItem(
                            "odoo.web_dialog_size.value",
                            serverValue
                        );
                        if (serverValue === "true") {
                            this.setSize("dialog_full_screen");
                        } else if (this._forcedSize === "dialog_full_screen") {
                            this.setSize(this.originalSize || Dialog.defaultProps.size);
                        }
                    }
                }
            })
            .catch(() => {
                // Session likely expired → ignore
            });

        onWillUpdateProps((nextProps) => {
            // A size coming from the parent (e.g. the expand button of a
            // SelectCreateDialog, which wraps this dialog) replaces the forced
            // one. Otherwise the dialog could never leave its forced size.
            if (nextProps.size !== this._parentSize) {
                this._parentSize = nextProps.size;
                if (this._forcedSize) {
                    this._forcedSize = nextProps.size;
                }
            }
        });

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

    getOriginalSize() {
        return this.originalSize || Dialog.defaultProps.size;
    },
});

patch(SelectCreateDialog.prototype, {
    setup() {
        this.originalSize = this.props.size;
        super.setup();
        this.setSize = this.setSize.bind(this);
        this.getSize = this.getSize.bind(this);
        this.getOriginalSize = this.getOriginalSize.bind(this);

        const storedValue = browser.localStorage.getItem("odoo.web_dialog_size.value");
        const lastServerValue = browser.localStorage.getItem(
            "odoo.web_dialog_size.last_server_value"
        );

        if (storedValue === "true") {
            this.props.size = "dialog_full_screen";
        }

        const orm = useService("orm");
        orm.call("ir.config_parameter", "get_web_dialog_size_config")
            .then((r) => {
                const serverValue = String(Boolean(r.default_maximize));
                if (serverValue !== lastServerValue) {
                    browser.localStorage.setItem(
                        "odoo.web_dialog_size.last_server_value",
                        serverValue
                    );
                    if (storedValue === null || storedValue === lastServerValue) {
                        browser.localStorage.setItem(
                            "odoo.web_dialog_size.value",
                            serverValue
                        );
                        if (serverValue === "true") {
                            this.setSize("dialog_full_screen");
                        } else if (this.props.size === "dialog_full_screen") {
                            this.setSize(this.originalSize || Dialog.defaultProps.size);
                        }
                    }
                }
            })
            .catch(() => {
                // Session likely expired → ignore
            });
    },

    setSize(size) {
        this.props.size = size;
        this.render();
    },

    getSize() {
        return this.props.size;
    },

    getOriginalSize() {
        return this.originalSize || Dialog.defaultProps.size;
    },
});

Object.assign(ActionDialog.components, {ExpandButton});
SelectCreateDialog.components = Object.assign(SelectCreateDialog.components || {}, {
    ExpandButton,
});
Dialog.components = Object.assign(Dialog.components || {}, {ExpandButton});
// Keep Odoo's standard dialog sizes and add the custom maximized size.
const coreValidateDialogSize = Dialog.props.size.validate;
Dialog.props.size.validate = (size) =>
    coreValidateDialogSize(size) || size === "dialog_full_screen";
