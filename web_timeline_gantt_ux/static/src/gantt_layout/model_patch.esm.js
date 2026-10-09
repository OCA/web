/** @odoo-module **/

import {TimelineModel} from "@web_timeline/views/timeline/timeline_model.esm";
import {patch} from "@web/core/utils/patch";

/**
 * Rewrite the stock inline item style for gantt mode. A matched colors= rule
 * leaves `background-color: X;` on the item; the stock theme's
 * `:hover { background-color: … !important }` rule would beat that inline
 * style, so the color is carried as a CSS custom property instead and the
 * theme owns background, hover and a fill-derived border via that property.
 * Pure and exported for DOM-free tests.
 *
 * @param {String} style stock inline style ("background-color: X;")
 * @returns {{style: String, colored: Boolean}}
 */
export function ganttItemStyle(style) {
    const match = /background-color:\s*([^;]+);/.exec(style || "");
    if (match && match[1].trim() !== "false") {
        return {style: `--o-tlg-item-color: ${match[1].trim()};`, colored: true};
    }
    return {style: "", colored: false};
}

patch(TimelineModel.prototype, {
    /**
     * In gantt mode every record gets its own row: remap the vis group to a
     * per-record namespaced id (the renderer builds one nested child group
     * per record). Item ids stay raw record ids — dependency lookups and the
     * write path rely on item.id === record.id.
     *
     * @override
     */
    _event_data_transform(record) {
        const item = super._event_data_transform(...arguments);
        if (this.params.gantt_ux) {
            item.group = `rec_${record.id}`;
            const {style, colored} = ganttItemStyle(item.style);
            item.style = style;
            if (colored) {
                item.className = `${item.className || ""} o_tlg_colored`.trim();
            }
        }
        return item;
    },
});
