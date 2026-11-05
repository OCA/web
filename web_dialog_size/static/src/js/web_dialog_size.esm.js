import {Component, onMounted, onWillRender, useState} from "@odoo/owl";
import {ActionDialog} from "@web/webclient/actions/action_dialog";
import {Dialog} from "@web/core/dialog/dialog";
import {SelectCreateDialog} from "@web/views/view_dialogs/select_create_dialog";
import {patch} from "@web/core/utils/patch";
import {useService} from "@web/core/utils/hooks";

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
        this.orm = useService("orm");
        this.last_size = this.props.getsize();
        // The props never change, so the dialog rendering does not render
        // this button again: keep the size in its own state to switch icons
        this.state = useState({size: this.last_size});
        this.config = this.orm.call(
            "ir.config_parameter",
            "get_web_dialog_size_config"
        );

        onMounted(() => {
            var self = this;
            this.config
                .then(function (r) {
                    if (r.default_maximize) {
                        self.setSize("dialog_full_screen");
                    }
                })
                .catch(() => {
                    // Session likely expired → ignore
                });
        });
    }

    setSize(size) {
        this.props.setsize(size);
        this.state.size = size;
    }

    dialog_button_extend(ev) {
        resetListColumnWidths(ev.currentTarget);
        this.setSize("dialog_full_screen");
    }

    dialog_button_restore(ev) {
        resetListColumnWidths(ev.currentTarget);
        this.setSize(this.last_size);
    }
}

ExpandButton.template = "web_dialog_size.ExpandButton";

patch(Dialog.prototype, {
    setup() {
        super.setup();
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

patch(SelectCreateDialog.prototype, {
    setup() {
        super.setup();
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
