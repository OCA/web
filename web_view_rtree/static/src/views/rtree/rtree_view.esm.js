/** @odoo-module */

import {RTreeArchParser} from "./rtree_arch_parser.esm";
import {RTreeController} from "./rtree_controller.esm";
import {RTreeModel} from "./rtree_model.esm";
import {RTreeRenderer} from "./rtree_renderer.esm";
import {listView} from "@web/views/list/list_view";
import {registry} from "@web/core/registry";

export const rTreeView = {
    ...listView,
    type: "rtree",
    display_name: "RTree",
    // FIXME: change this to fa-list-tree as soon as font awesome is updated
    // to version 6+.
    icon: "fa fa-sitemap",
    // Remove groupBy, as it is used internally and is not supported
    // searchMenuTypes: ["filter", "favorite"],
    // Currently, filtering is not supported.
    searchMenuTypes: [],
    Controller: RTreeController,
    Renderer: RTreeRenderer,
    ArchParser: RTreeArchParser,
    Model: RTreeModel,
};

registry.category("views").add("rtree", rTreeView);
