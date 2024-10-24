odoo.define("web_refresh.CustomMenuItem", function (require) {
    "use strict";

    const DropdownMenuItem = require("web.DropdownMenuItem");
    /* global owl */
    const {useRef} = owl.hooks;

    class CustomMenuItem extends DropdownMenuItem {
        constructor() {
            super(...arguments);
            this.valueInput = useRef("value_input");
        }

        _onValueChanged(ev) {
            console.log(ev);
            var value = parseInt(this.valueInput.el.value, 10);
            if (!value || value < this.props.minValue) {
                this.state.error = true;
                if (ev.target.localName === "button") {
                    this.valueInput.el.value = this.props.minValue;
                }
            } else {
                this.state.error = false;
                if (ev.target.localName === "button") {
                    this.state.editing = false;
                    this.trigger("value-changed", {value: value});
                }
            }
        }

        _selectIfNotEditing() {
            if (!this.state.editing) {
                this.trigger("item-selected", {item: this.props});
            }
        }
    }

    CustomMenuItem.template = "web_refresh.CustomMenuItem";

    return CustomMenuItem;
});
