/* Copyright 2026 Quartile (https://www.quartile.co)
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). */

import {PivotRenderer} from "@web/views/pivot/pivot_renderer";
import {patch} from "@web/core/utils/patch";
import {registry} from "@web/core/registry";

const formatters = registry.category("formatters");

patch(PivotRenderer.prototype, {
    getFormattedValue(cell) {
        const field = this.model.metaData.measures[cell.measure];
        let formatType = this.model.metaData.widgets[cell.measure];
        if (!formatType) {
            const fieldType = field.type;
            formatType = ["many2one", "reference"].includes(fieldType)
                ? "integer"
                : fieldType;
        }
        const formatter = formatters.get(formatType);
        if (field.type === "monetary") {
            const currencyId = this._getCellCurrencyId(cell);
            if (currencyId) {
                return formatter(cell.value, {
                    ...field,
                    currencyId,
                    noSymbol: true,
                });
            }
        }
        return formatter(cell.value, field);
    },

    _getCellCurrencyId(cell) {
        const key = JSON.stringify(cell.groupId);
        const measurements = this.model.data.measurements[key];
        if (!measurements) {
            return false;
        }
        const originIndex = cell.originIndexes ? cell.originIndexes[0] : 0;
        const originData = measurements[originIndex];
        return originData ? originData[`__currency__${cell.measure}`] : false;
    },
});
