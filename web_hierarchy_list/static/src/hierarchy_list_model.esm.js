import {RelationalModel} from "@web/model/relational_model/relational_model";

export class HierarchyListModel extends RelationalModel {
    /**
     * @param {*} currentConfig
     * @param {*} params
     * @returns {Config}
     */
    _getNextConfig(currentConfig, params) {
        const nextConfig = super._getNextConfig(...arguments);
        // As we need to display records according to the drill-down, we need a way to pass
        // the info to the model, which is performed through the use of the hierarchyListParentIdDomain
        if ("hierarchyListParentIdDomain" in params) {
            nextConfig.domain = params.hierarchyListParentIdDomain;
        }
        return nextConfig;
    }
}
