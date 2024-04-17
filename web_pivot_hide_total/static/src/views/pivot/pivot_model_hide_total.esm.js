/** @odoo-module **/

import {PivotModel} from "@web/views/pivot/pivot_model";

export class PivotModelHideTotal extends PivotModel {
    /**
     * @override
     */
    _getTableHeaders() {
        var headers = super._getTableHeaders();
        const leafCounts = this._getLeafCounts(this.data.colGroupTree);
        if (leafCounts[JSON.stringify(this.data.colGroupTree.root.values)] > 1) {
            headers[0].pop();
            headers[headers.length - 1].pop();
        }
        return headers;
    }
}
