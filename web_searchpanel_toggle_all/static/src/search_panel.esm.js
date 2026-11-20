// Copyright 2026 Le Filament (https://le-filament.com)
// License AGPL-3.0 (https://www.gnu.org/licenses/agpl)

import {patch} from "@web/core/utils/patch";
import {SearchPanel} from "@web/search/search_panel/search_panel";
import {_t} from "@web/core/l10n/translation";

// Toggle all values of a filter section in a single click.
// - If at least one value is checked (or indeterminate), uncheck them all.
// - Otherwise, check them all (same as unchecked, but easier if user wants to select all but two items for example)
//
// Only applies to sections of type "filter" (multi-select).
// Category sections (single-select) are left unchanged.
patch(SearchPanel.prototype, {
    toggleSection(sectionId) {
        const [section] = this.env.searchModel.getSections((s) => s.id === sectionId);
        if (!section || section.type !== "filter") {
            return;
        }
        if (this.hasSelection(sectionId)) {
            this.clearSelection(sectionId);
            return;
        }
        // Collect values to toggle
        const valueIds = [];
        if (section.values) {
            for (const value of section.values.values()) {
                valueIds.push(value.id);
            }
        }
        // Toggle
        if (valueIds.length) {
            this.env.searchModel.toggleFilterValues(sectionId, valueIds, true);
        }
    },

    // Tooltip text for the clickable section title.
    toggleSectionTitle(sectionId) {
        return this.hasSelection(sectionId)
            ? _t("Click to uncheck all values")
            : _t("Click to check all values");
    },
});
