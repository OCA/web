/** @odoo-module **/

import {onMounted, onWillUnmount} from "@odoo/owl";
import {FloatTimeField} from "@web/views/fields/float_time/float_time_field";
import {patch} from "@web/core/utils/patch";

patch(FloatTimeField.prototype, "web_numpad_decimal_time_field", {
    setup() {
        this._super.apply();
        onMounted(this.onMounted);
        onWillUnmount(this.onWillUnmount);
    },

    // Checks for "." in keyboard event and
    // replaces with ":" in float_time fields
    async onKeydownListener(ev) {
        var decimalPoint = ":";

        if (![".", ","].includes(ev.key)) {
            return;
        }
        ev.preventDefault();
        ev.originalTarget.setRangeText(
            decimalPoint,
            ev.originalTarget.selectionStart,
            ev.originalTarget.selectionEnd,
            "end"
        );
    },

    onMounted() {
        this.keydownListenerCallback = this.onKeydownListener.bind(this);
        this.__owl__.bdom.parentEl.addEventListener(
            "keydown",
            this.keydownListenerCallback
        );
    },

    onWillUnmount() {
        this.__owl__.bdom.parentEl.removeEventListener(
            "keydown",
            this.keydownListenerCallback
        );
    },
});
