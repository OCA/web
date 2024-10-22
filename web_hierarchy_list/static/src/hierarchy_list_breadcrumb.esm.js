import {Component} from "@odoo/owl";
import {HierarchyListBreadcrumbItem} from "./hierarchy_list_breadcrumb_item.esm";

export class HierarchyListBreadcrumb extends Component {
    static components = {
        HierarchyListBreadcrumbItem,
    };
    static props = {
        parentRecords: {type: Array, element: Object},
        getDisplayName: Function,
        navigate: Function,
        reset: Function,
    };
    static template = "web_hierarchy_list.Breadcrumb";
}

console.log(HierarchyListBreadcrumb.props);
