/* License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl.html). */

import {onMounted, onWillUpdateProps} from "@odoo/owl";
import {patch} from "@web/core/utils/patch";
import {useService} from "@web/core/utils/hooks";
import {Chatter} from "@mail/chatter/web_portal/chatter";
import {useFileViewer} from "@web/core/file_viewer/file_viewer_hook";
import {registry} from "@web/core/registry";
import {user} from "@web/core/user";

patch(Chatter.prototype, {
    setup() {
        super.setup();
        this.fileViewer = useFileViewer();
        this.orm = useService("orm");
        onMounted(() => this.autoOpenPreview());
        onWillUpdateProps((nextProps) => this.autoOpenPreview(nextProps));
    },

    async autoOpenPreview(props = this.props) {
        this.forceClosePreviewer();

        const resId = props.threadId;
        const resModel = props.threadModel;

        if (resModel !== "account.move" || !resId || !user.userId) {
            return;
        }

        const [userData] = await this.orm
            .read("res.users", [user.userId], ["is_auto_open_invoice_preview"])
            .catch(() => [{}]);

        if (!userData || !userData.is_auto_open_invoice_preview) {
            return;
        }

        const attachments = await this.orm.searchRead(
            "ir.attachment",
            [
                ["res_model", "=", "account.move"],
                ["res_id", "=", resId],
                ["mimetype", "=", "application/pdf"],
            ],
            ["id", "name", "mimetype"],
            {order: "id desc"}
        );
        if (!attachments.length) {
            return;
        }

        // Create all as store records (as in the working example)
        const files = attachments.map((att) =>
            this.store.Attachment.insert({
                id: att.id,
                name: att.name,
                filename: att.name,
                mimetype: att.mimetype,
            })
        );

        // Display the first file; pass ALL to navigation
        this.fileViewer.open(files[0], files);
    },

    forceClosePreviewer() {
        // Remove ALL open FileViewer instances from the main components
        // registry. This is language-independent (no DOM, no title text)
        // and closes every viewer, including "zombie" instances left
        // behind by previous Chatter mounts.
        for (const [key] of registry.category("main_components").getEntries()) {
            if (key.startsWith("web.file_viewer")) {
                registry.category("main_components").remove(key);
            }
        }
    },
});
