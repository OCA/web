/* Copyright 2026 Jarsa
 * License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl). */
import {X2ManyField, x2ManyField} from "@web/views/fields/x2many/x2many_field";
import {useEffect, useRef} from "@odoo/owl";
import {patch} from "@web/core/utils/patch";
import {session} from "@web/session";

export const SCROLL_CLASS = "o_web_x2many_list_scroll";

X2ManyField.props = {
    ...X2ManyField.props,
    scrollRows: {type: Number, optional: true},
};

patch(X2ManyField.prototype, {
    setup() {
        super.setup();
        if (this.scrollRows) {
            this.className = `${this.className} ${SCROLL_CLASS}`;
            this.scrollRootRef = useRef("scrollRoot");
            // Rows are as tall as their content, their font and the device
            // (a touch screen pads them more), so the height of the box comes
            // from the first row and the header as rendered, not from a guess.
            useEffect(() => this.measureScrollRows());
        }
    },

    measureScrollRows() {
        const root = this.scrollRootRef?.el;
        const row = root?.querySelector(".o_list_table tbody tr.o_data_row");
        const header = root?.querySelector(".o_list_table thead");
        if (!row || !header) {
            return;
        }
        root.style.setProperty(
            "--o-x2many-list-scroll-row-height",
            `${row.offsetHeight}px`
        );
        root.style.setProperty(
            "--o-x2many-list-scroll-header-height",
            `${header.offsetHeight}px`
        );
    },

    /**
     * Rows the list shows before it scrolls: the number the view sets on the
     * field, else the one of the settings. 0 means the list is left alone.
     *
     * @returns {Number}
     */
    get scrollRows() {
        if (this.props.viewMode !== "list") {
            return 0;
        }
        const rows =
            this.props.scrollRows === undefined
                ? session.web_x2many_list_scroll_rows
                : this.props.scrollRows;
        return Number(rows) > 0 ? Number(rows) : 0;
    },

    get scrollStyle() {
        return this.scrollRows ? `--o-x2many-list-scroll-rows: ${this.scrollRows}` : "";
    },
});

const extractProps = x2ManyField.extractProps;
x2ManyField.extractProps = (params, dynamicInfo) => {
    const props = extractProps(params, dynamicInfo);
    const rows = params.options?.scroll_rows;
    if (rows !== undefined) {
        props.scrollRows = Number(rows);
    }
    return props;
};
