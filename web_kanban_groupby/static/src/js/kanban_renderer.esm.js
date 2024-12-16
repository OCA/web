/** @odoo-module */
import KanbanRenderer from "web.KanbanRenderer";

KanbanRenderer.include({
    init(params) {
        this.groupbys = params.groupbys;
        this._super(...arguments);
    },
    /**
     * Pass the groupbys actions info to the column
     *
     * @override
     */
    _setState() {
        this._super(...arguments);
        this.columnOptions.groupbys =
            this.groupbys && this.groupbys[this.state.groupedBy];
    },
});
