import {useComponent, useEffect, useExternalListener} from "@odoo/owl";
import {ListRenderer} from "@web/views/list/list_renderer";
import {browser} from "@web/core/browser/browser";
import {patch} from "@web/core/utils/patch";
import {useDebounced} from "@web/core/utils/timing";

/**
 * Override on useMagicColumnWidths from web/static/src/views/list/column_width_hook.js
 * This is an exported function that returns two internals, one of which we will
 * be overriding below.
 *
 * @param {tableRef} wrapper around the DOM element of the list view table
 * @param {getState} some internals from the list view passed in its setUp
 * @param {orig} the return value from upstream useMagicColumWidths, consisting
 * of a _resizing variable reference and an onStartResize function reference.
 */
export function useMagicColumnWidths(tableRef, getState, orig) {
    const onStartResizeOrig = orig.onStartResize;
    const renderer = useComponent();

    /**
     * Override on onStartResize as returned from upstream's useMagicColumnWidths.
     * We call super, then add event listeners for our own stopResize handler
     * which stores column widths in the brower's localstorage.
     */
    function onStartResize(evstart) {
        // Call original method
        const res = onStartResizeOrig(evstart);
        const resizeStoppingEvents = ["keydown", "pointerdown", "pointerup"];

        // Mouse or keyboard events : stop resize
        const stopResize = (evstop) => {
            // Ignores the 'left mouse button down' event as it used to start resizing
            if (evstop.type === "pointerdown" && evstop.button === 0) {
                return;
            }
            evstop.preventDefault();
            evstop.stopPropagation();

            const th = evstop.target.closest("th");
            if (th === null || th === undefined) {
                return;
            }
            const fieldName = th.dataset.name;
            const resModel = this.props.list.model.config.resModel;
            if (resModel && fieldName && browser.localStorage) {
                var width =
                    parseInt((th.style.width || "0").replace("px", ""), 10) || 0;
                browser.localStorage.setItem(
                    "odoo.columnWidth." + resModel + "." + fieldName,
                    width
                );
            }
            for (const eventType of resizeStoppingEvents) {
                window.removeEventListener(eventType, stopResize);
            }
        };
        for (const eventType of resizeStoppingEvents) {
            window.addEventListener(eventType, stopResize);
        }
        return res;
    }

    /**
     * Set stored column widths.
     */
    function setStoredColumnWidths() {
        const table = tableRef.el;
        const headers = [...table.querySelectorAll("thead th")];
        const state = getState();
        const resModel = state.model.config.resModel;
        const columnOffset = state.hasSelectors ? 1 : 0;
        headers.forEach((el, elIndex) => {
            var column = state.columns[elIndex - columnOffset];
            const fieldName = (column && column.name) || "";
            if (
                !el.classList.contains("o_list_button") &&
                fieldName &&
                resModel &&
                browser.localStorage
            ) {
                const storedWidth = browser.localStorage.getItem(
                    `odoo.columnWidth.${resModel}.${fieldName}`
                );
                if (storedWidth) {
                    var width = `${Math.floor(parseInt(storedWidth, 10))}px`;
                    el.style.width = width;
                }
            }
        });
    }

    /**
     * Call setStoredColumnWidths on init and on window resize.
     */
    if (renderer.constructor.useMagicColumnWidths) {
        useEffect(setStoredColumnWidths);
        const debouncedResizeCallback = useDebounced(() => {
            setStoredColumnWidths();
        }, 300);
        useExternalListener(window, "resize", debouncedResizeCallback);
    }

    orig.onStartResize = onStartResize;
    return orig;
}

patch(ListRenderer.prototype, {
    /**
     * Replace this list view's columnWidths attribute
     */
    setup() {
        super.setup();
        const columnWidthsOrig = this.columnWidths;
        this.columnWidths = useMagicColumnWidths(
            this.tableRef,
            () => {
                return {
                    columns: this.columns,
                    isEmpty:
                        !this.props.list.records.length ||
                        this.props.list.model.useSampleModel,
                    hasSelectors: this.hasSelectors,
                    hasOpenFormViewColumn: this.hasOpenFormViewColumn,
                    hasActionsColumn: this.hasActionsColumn,
                    model: this.props.list.model,
                };
            },
            columnWidthsOrig
        );
    },
});
