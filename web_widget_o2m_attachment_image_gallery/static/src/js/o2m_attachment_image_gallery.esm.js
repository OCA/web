import {Component, onWillStart, useState} from "@odoo/owl";
import {registry} from "@web/core/registry";
import {useFileViewer} from "@web/core/file_viewer/file_viewer_hook";
import {useService} from "@web/core/utils/hooks";

export class O2mAttachmentImageGalleryField extends Component {
    static template =
        "web_widget_o2m_attachment_image_gallery.o2mAttachmentImageGalleryField";
    setup() {
        this.orm = useService("orm");
        this.store = useService("mail.store");
        this.fileViewer = useFileViewer();
        this.state = useState({
            attachments: [],
        });
        onWillStart(() => this._loadImages());
    }

    async _loadImages() {
        const record = this.props.record;
        if (!record || !record.data) {
            this.state.attachments = [];
            return;
        }
        const attachments = record.data[this.props.name].records;
        this.state.attachments = attachments.map((att) => ({
            id: att.resId,
            name: att.data.name,
            mimetype: att.data.mimetype,
        }));
    }
    openGallery = (index = 0) => {
        this.state.index = index;
        const files = this.state.attachments.map((att) =>
            this.store.Attachment.insert({
                id: att.id,
                name: att.name,
                filename: att.name,
                mimetype: att.mimetype,
            })
        );
        this.fileViewer.open(files[index], files);
    };
}
export const o2mAttachmentImageGalleryField = {
    component: O2mAttachmentImageGalleryField,
    relatedFields: [
        {name: "name", type: "char"},
        {name: "mimetype", type: "char"},
    ],
};
registry
    .category("fields")
    .add("o2m_attachment_image_gallery", o2mAttachmentImageGalleryField);
