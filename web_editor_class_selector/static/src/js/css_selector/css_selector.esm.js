import {Component, useState} from "@odoo/owl";
import {Dropdown} from "@web/core/dropdown/dropdown";
import {DropdownItem} from "@web/core/dropdown/dropdown_item";
import {toolbarButtonProps} from "@html_editor/main/toolbar/toolbar";

export class CssSelector extends Component {
    static template = "web_editor_class_selector.CssSelector";
    static props = {
        ...toolbarButtonProps,
        // These props are passed by the Toolbar component.
        // We override them to be optional because the Toolbar might pass
        // undefined values (e.g., if a button has no description).
        title: {type: [String, Function], optional: true},
        getSelection: {type: Function, optional: true},
        isDisabled: {type: [Function, Boolean], optional: true},
        getItems: Function,
        getDisplay: Function,
        onSelected: Function,
    };
    static components = {Dropdown, DropdownItem};

    setup() {
        this.items = this.props.getItems();
        this.state = useState(this.props.getDisplay());
    }

    onSelected(item) {
        this.props.onSelected(item);
    }
}
