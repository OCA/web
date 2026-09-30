import {onWillRender} from "@odoo/owl";
import {browser} from "@web/core/browser/browser";
import {Dialog} from "@web/core/dialog/dialog";
import {patch} from "@web/core/utils/patch";
import {useService} from "@web/core/utils/hooks";

function triggerWindowResize() {
    requestAnimationFrame(() => {
        window.dispatchEvent(new Event("resize"));
    });
}

patch(Dialog.prototype, {
    setup() {
        super.setup();
        this.originalDialogSize = this.props.size;

        const storedValue = browser.localStorage.getItem("odoo.web_dialog_size.value");
        const lastServerValue = browser.localStorage.getItem(
            "odoo.web_dialog_size.last_server_value"
        );

        if (storedValue === "true") {
            this.dialogSize.set("fs");
        }

        const orm = useService("orm");
        orm.call("ir.config_parameter", "get_web_dialog_size_config").then((config) => {
            const serverValue = String(Boolean(config.default_maximize));
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
                    this.dialogSize.set(
                        serverValue === "true" ? "fs" : this.originalDialogSize
                    );
                    triggerWindowResize();
                }
            }
        });

        onWillRender(() => {
            if (
                browser.localStorage.getItem("odoo.web_dialog_size.value") === "true" &&
                this.size !== "fs"
            ) {
                this.dialogSize.set("fs");
            }
        });
    },

    toggleDialogSize() {
        const maximize = this.size !== "fs";
        this.dialogSize.set(maximize ? "fs" : this.originalDialogSize);
        browser.localStorage.setItem(
            "odoo.web_dialog_size.value",
            maximize ? "true" : "false"
        );
        triggerWindowResize();
    },
});
