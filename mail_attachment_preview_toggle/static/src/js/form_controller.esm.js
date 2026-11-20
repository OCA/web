/** @odoo-module **/

import {patch} from "@web/core/utils/patch";
import {FormController} from "@web/views/form/form_controller";

patch(FormController.prototype, "mail_attachment_preview_toggle", {
    hasAttachmentViewer() {
        const record = this.model.root;
        if (record.data.show_attachment_preview === false) {
            return false;
        }
        return this._super(...arguments);
    },
});
