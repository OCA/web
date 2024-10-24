import {ListArchParser} from "@web/views/list/list_arch_parser";
import {treatHierarchyListArch} from "./hierarchy_list_arch_utils.esm";

export class HierarchyListArchParser extends ListArchParser {
    parse(xmlDoc, models, modelName) {
        const archInfo = super.parse(...arguments);
        treatHierarchyListArch(archInfo, modelName, models[modelName].fields);
        return archInfo;
    }
}
