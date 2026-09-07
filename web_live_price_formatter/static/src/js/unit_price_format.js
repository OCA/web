/** @odoo-module **/

(function () {
    "use strict";

    function formatNumber(value) {
        return value.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    document.addEventListener(
        "input",
        (ev) => {
            const input = ev.target;

            if (!(input instanceof HTMLInputElement)) {
                return;
            }

            const container = input.closest("[name='price_unit']");

            if (!container) {
                return;
            }

            const value = input.value;
            const cursorPos = input.selectionStart || 0;
            const digitsBeforeCursor = value
                .slice(0, cursorPos)
                .replace(/,/g, "").length;
            const raw = value.replace(/,/g, "");

            if (!/^\d*\.?\d*$/.test(raw)) {
                return;
            }

            const parts = raw.split(".");
            const formattedInt = formatNumber(parts[0]);
            const finalValue =
                parts.length > 1 ? `${formattedInt}.${parts[1]}` : formattedInt;

            input.value = finalValue;

            let newCursor = 0;
            let count = 0;

            for (let i = 0; i < finalValue.length; i++) {
                if (finalValue[i] !== ",") {
                    count++;
                }

                if (count >= digitsBeforeCursor) {
                    newCursor = i + 1;
                    break;
                }
            }

            input.setSelectionRange(newCursor, newCursor);
        },
        true
    );
})();
