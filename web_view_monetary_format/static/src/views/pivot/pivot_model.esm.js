/* Copyright 2026 Quartile (https://www.quartile.co)
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). */

import {PivotModel} from "@web/views/pivot/pivot_model";
import {patch} from "@web/core/utils/patch";

patch(PivotModel.prototype, {
    _getMeasureSpecs(config) {
        const specs = super._getMeasureSpecs(config);
        const {metaData} = config;
        const currencyFields = new Set();
        for (const measure of metaData.activeMeasures) {
            if (measure === "__count") {
                continue;
            }
            const field = metaData.fields[measure];
            if (
                field.type === "monetary" &&
                field.currency_field &&
                !metaData.activeMeasures.includes(field.currency_field)
            ) {
                currencyFields.add(field.currency_field);
            }
        }
        for (const currencyField of currencyFields) {
            specs.push(`${currencyField}:array_agg`);
        }
        return specs;
    },

    _getMeasurements(group, config) {
        const measurements = super._getMeasurements(group, config);
        const {metaData} = config;
        for (const measure of metaData.activeMeasures) {
            if (measure === "__count") {
                continue;
            }
            const field = metaData.fields[measure];
            if (field.type === "monetary" && field.currency_field) {
                const rawValue = group[field.currency_field];
                if (Array.isArray(rawValue)) {
                    if (
                        rawValue.length === 2 &&
                        typeof rawValue[0] === "number" &&
                        typeof rawValue[1] === "string"
                    ) {
                        measurements[`__currency__${measure}`] = rawValue[0];
                    } else {
                        const uniqueIds = [
                            ...new Set(
                                rawValue.filter((id) => id !== false && id !== null)
                            ),
                        ];
                        measurements[`__currency__${measure}`] =
                            uniqueIds.length === 1 ? uniqueIds[0] : false;
                    }
                }
            }
        }
        return measurements;
    },
});
