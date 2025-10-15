import {Component, onWillRender} from "@odoo/owl";
import {ActionDialog} from "@web/webclient/actions/action_dialog";
import {Dialog} from "@web/core/dialog/dialog";
import {SelectCreateDialog} from "@web/views/view_dialogs/select_create_dialog";
import {patch} from "@web/core/utils/patch";
import {useService} from "@web/core/utils/hooks";
import {browser} from "@web/core/browser/browser";

export class ExpandButton extends Component {
    setup() {
        this.original_size = this.props.getoriginalsize
            ? this.props.getoriginalsize()
            : this.props.getsize() !== "dialog_full_screen"
              ? this.props.getsize()
              : "md";
    }

    dialog_button_extend() {
        this.props.setsize("dialog_full_screen");
        browser.localStorage.setItem("odoo.web_dialog_size.value", "true");
        this.render();
    }

    dialog_button_restore() {
        this.props.setsize(this.original_size);
        browser.localStorage.setItem("odoo.web_dialog_size.value", "false");
        this.render();
    }
}

ExpandButton.template = "web_dialog_size.ExpandButton";

patch(Dialog.prototype, {
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
            this._forcedSize = "dialog_full_screen";
            this.props.size = "dialog_full_screen";
        }

        const orm = useService("orm");
        orm.call("ir.config_parameter", "get_web_dialog_size_config").then((r) => {
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
                        this.setSize(this.originalSize || "md");
                    }
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
        return this.originalSize || "md";
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
        orm.call("ir.config_parameter", "get_web_dialog_size_config").then((r) => {
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
                        this.setSize(this.originalSize || "md");
                    }
                }
            }
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
        return this.originalSize || "md";
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
