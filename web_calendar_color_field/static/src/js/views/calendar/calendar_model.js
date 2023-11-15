/** @odoo-module */

import {CalendarModel} from "@web/views/calendar/calendar_model";
import {patch} from "@web/core/utils/patch";

patch(CalendarModel.prototype, "web_calendar_color_field", {
    /**
     * @override
     *
     * Overload to handle custom colorIndex
     * 
     * Default behaviour when using a many2many field as color attribute
     * is to generate random colors based on the record id.
     * 
     * We are changing that behaviour to play nicely with feature
     * <calendar color="categ_ids">
     *     <field name="categ_ids" filters="1"/>
     * </calendar>
     * 
     * If the field is also added to filters, and a color field is defined,
     * we use that color field as colorIndex.
     * 
     */
    // These are the methods that are used to apply colorIndex.
    makeFilterDynamic(filterInfo, previousFilter, fieldName, rawFilter, rawColors) {
        let result = this._super(...arguments);
        let colorIndex = result.colorIndex;
        return result;
    },
    makeFilterRecord(filterInfo, previousFilter, rawRecord) {
        let result = this._super(...arguments);
        let colorIndex = result.colorIndex;
        return result;
    },
    makeFilterUser(filterInfo, previousFilter, fieldName, rawRecords) {
        let result = this._super(...arguments);
        let colorIndex = result.colorIndex;
        return result;
    },
    makeFilterAll(previousAllFilter, isUserOrPartner) {
        let result = this._super(...arguments);
        let colorIndex = result.colorIndex;
        return result;
    },
    normalizeRecord(rawRecord) {
        let result = this._super(...arguments);
        let colorIndex = result.colorIndex;
        return result;
    },
});
