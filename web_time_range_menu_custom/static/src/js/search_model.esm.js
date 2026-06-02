/* Copyright 2025 Tecnativa - Carlos Roca
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html) */
import {SearchModel} from "@web/search/search_model";
import {patch} from "@web/core/utils/patch";
import {getPeriodOptions} from "@web/search/utils/dates";

patch(SearchModel.prototype, {
    toggleDateFilter(searchItemId, generatorId) {
        super.toggleDateFilter(searchItemId, generatorId);
        const searchItem = this.searchItems[searchItemId];
        if (searchItem.type !== "dateFilter") {
            return;
        }
        const customGenerators = this.query
            .filter((el) => el.generatorId?.startsWith("custom"))
            .map((el) => el.generatorId);
        for (const generatorId of customGenerators) {
            this.query = this.query.filter(
                (queryElem) =>
                    queryElem.searchItemId !== searchItemId ||
                    !queryElem.generatorId.startsWith("custom")
            );
            this.query.push({searchItemId, generatorId});
            const element = getPeriodOptions(
                this.referenceMoment,
                searchItem.optionsParams
            ).find((o) => o.id === generatorId);
            const selected_year = this.referenceMoment.plus(element.plusParam).year;
            const actual_year = this.referenceMoment.year;
            const yearId = getPeriodOptions(
                this.referenceMoment,
                searchItem.optionsParams
            ).find((o) => o.plusParam?.years === selected_year - actual_year).id;
            this.query.push({searchItemId, generatorId: yearId});
        }
    },
});
