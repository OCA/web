import {HierarchyListArchParser} from "./hierarchy_list_arch_parser.esm";
import {HierarchyListController} from "./hierarchy_list_controller.esm";
import {HierarchyListModel} from "./hierarchy_list_model.esm";
import {HierarchyListRenderer} from "./hierarchy_list_renderer.esm";
import {listView} from "@web/views/list/list_view";
import {registry} from "@web/core/registry";

export const hierarchyListView = {
    ...listView,
    ArchParser: HierarchyListArchParser,
    Controller: HierarchyListController,
    Model: HierarchyListModel,
    Renderer: HierarchyListRenderer,
};

registry.category("views").add("hierarchy_list", hierarchyListView);
