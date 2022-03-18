/** @odoo-module **/

import {patch} from "@web/core/utils/patch";
import {Dialog} from "@web/core/dialog/dialog";
const {useExternalListener} = owl.hooks;
import {useListener} from "web.custom_hooks";
const {Component} = owl;

export class DialogDraggable extends Component {
    setup() {
        this.element_position = {x: 0, y: 0};
        this.mouse_to_element_ratio = {x: 0, y: 0};
        const bound_onDrag = this.onDrag.bind(this);
        useListener("mousedown", "header.modal-header", (event) => {
            const y = parseInt(this.el.offsetTop, 10);
            const x = parseInt(this.el.offsetLeft, 10);
            this.mouse_to_element_ratio = {x: event.x - x, y: event.y - y};
            this.element_position = {
                x: event.x - this.mouse_to_element_ratio.x - x,
                y: event.y - this.mouse_to_element_ratio.y - y,
            };
            document.addEventListener("mousemove", bound_onDrag);
        });
        useExternalListener(document, "mouseup", () =>
            document.removeEventListener("mousemove", bound_onDrag)
        );
    }
    mounted() {
        this.el.classList.add("position-absolute");
        this.el.offsetParent.classList.add("position-relative");
    }
    getMovePosition({x, y}) {
        return {
            x: x - this.mouse_to_element_ratio.x - this.element_position.x,
            y: y - this.mouse_to_element_ratio.y - this.element_position.y,
        };
    }
    onDrag(event) {
        const {x, y} = this.getMovePosition(event);
        this.el.style.left = `${x}px`;
        this.el.style.top = `${y}px`;
    }
}

DialogDraggable.template = "DialogDraggable";

patch(Dialog, "web_dialog_size.DialogDraggable", {
    components: {
        ...Dialog.components,
        DialogDraggable,
    },
});
