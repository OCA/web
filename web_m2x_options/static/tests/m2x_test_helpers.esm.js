/**
 * Copyright 2026 Tecnativa - Carlos Lopez
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
 */
import {animationFrame, runAllTimers} from "@odoo/hoot-mock";
import {
    contains,
    defineModels,
    fields,
    models,
    mountView,
    patchWithCleanup,
} from "@web/../tests/web_test_helpers";
import {beforeEach} from "@odoo/hoot";
import {session} from "@web/session";

export class Tag extends models.Model {
    name = fields.Char();
    state = fields.Char();

    _records = [
        {id: 1, name: "Tag 1", state: "draft"},
        {id: 2, name: "Tag 2", state: "done"},
        {id: 3, name: "Tag 3", state: "done"},
        {id: 4, name: "Tag 4", state: "done"},
    ];
}

export class Partner extends models.Model {
    name = fields.Char();
    partner_id = fields.Many2one({relation: "tag"});
    tag_ids = fields.Many2many({relation: "tag"});

    _records = [{id: 1, name: "partner", partner_id: 2, tag_ids: []}];
}

export function defineM2xModels() {
    defineModels([Partner, Tag]);
    beforeEach(() => {
        patchWithCleanup(session, {web_m2x_options: {"web_m2x_options.limit": "10"}});
    });
}

export function mountPartnerForm(fieldName, fieldOptions = "{}", widget = "") {
    const widgetAttr = widget ? `widget="${widget}"` : "";
    return mountView({
        type: "form",
        resModel: "partner",
        resId: 1,
        arch: `<form><field name="${fieldName}" ${widgetAttr} options="${fieldOptions}"/></form>`,
    });
}

export async function searchInField(selector, text) {
    await contains(selector).edit(text, {confirm: false});
    await runAllTimers();
    await animationFrame();
}

export const COLOR_OPTIONS = "{'field_color': 'state', 'colors': {'draft': 'red'}}";
export const FIRST_OPTION =
    ".dropdown-menu li:not(.o_m2o_dropdown_option) .dropdown-item:first";
