/** @odoo-module */
import KanbanView from "web.KanbanView";

KanbanView.include({
    init() {
        this._super(...arguments);
        this.groupbys = {};
        this.arch.children.forEach((child) => {
            if (child.tag === "groupby") {
                this._extractGroup(child);
            }
        });
        this.rendererParams.groupbys = this.groupbys;
        this.modelParams.groupbys = this.groupbys;
    },
    /**
     * @private
     * @param {Object} node
     */
    _extractGroup: function (node) {
        var innerView = this.fields[node.attrs.name].views.groupby;
        this.groupbys[node.attrs.name] = this._processFieldsView(innerView, "groupby");
    },
});
