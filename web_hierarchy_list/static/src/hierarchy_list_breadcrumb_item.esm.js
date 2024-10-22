import {Component} from "@odoo/owl";

export class HierarchyListBreadcrumbItem extends Component {
    static props = {
        record: Object,
        getDisplayName: Function,
        navigate: Function,
    };
    static template = "web_hierarchy_list.BreadcrumbItem";

    onGlobalClick() {
        this.props.navigate(this.props.record);
    }
}
