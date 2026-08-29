import { patch } from "@web/core/utils/patch";
import { FormViewDialog } from "@web/views/view_dialogs/form_view_dialog";
import { GetMetadataDialog } from "@web/views/debug_items";

patch(GetMetadataDialog.prototype, {
    async onClickEditXmlid() {
        const model_data_id = await this.orm.call("ir.model.data", "search", [],
            {
                domain: [
                    ["model", "=", this.props.resModel],
                    ["res_id", "=", this.state.id],
                ],
                limit: 1,
            },
        );
        this.dialogService.add(FormViewDialog, {
            onRecordSaved: () => this.loadMetadata(),
            resModel: "ir.model.data",
            resId: model_data_id[0],
        });
    }
});
