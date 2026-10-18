import {Component, proxy, t, useProps} from "@odoo/owl";
import {Dropdown} from "@web/core/dropdown/dropdown";
import {DropdownItem} from "@web/core/dropdown/dropdown_item";
import {toolbarButtonProps} from "@html_editor/main/toolbar/toolbar";

export class CssSelector extends Component {
  static template = "web_editor_class_selector.CssSelector";
  props = useProps({
    ...toolbarButtonProps,
    title: toolbarButtonProps.title.optional(),
    getSelection: toolbarButtonProps.getSelection.optional(),
    isDisabled: t.or([toolbarButtonProps.isDisabled, t.function()]).optional(),
    getItems: t.function(),
    getDisplay: t.function(),
    onSelected: t.function(),
  });
  static components = {Dropdown, DropdownItem};

  setup() {
    this.items = this.props.getItems();
    this.state = proxy(this.props.getDisplay());
  }

  onSelected(item) {
    this.props.onSelected(item);
  }
}
