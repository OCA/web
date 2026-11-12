/** @odoo-module **/
/* Copyright 2026 Heligrafics Fotogrametria S.L.
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl). */
/* global QUnit */

import {Component, xml} from "@odoo/owl";
import {
    click,
    getFixture,
    nextTick,
    patchWithCleanup,
    triggerEvent,
} from "@web/../tests/helpers/utils";
import {createWebClient, doAction} from "@web/../tests/webclient/helpers";
import {makeView, setupViewRegistries} from "@web/../tests/views/helpers";
import {DateRangeDialog} from "@web_list_date_range_required/date_range_dialog/date_range_dialog.esm";
import {DateRangeListArchParser} from "@web_list_date_range_required/date_range_list/date_range_list_view.esm";
import {parseXML} from "@web/core/utils/xml";
import {serializeDateTime} from "@web/core/l10n/dates";

const {DateTime} = luxon;

const ARCH = `
    <tree js_class="date_range_list">
        <field name="name"/>
        <field name="moment" options="{'date_range': True}"/>
    </tree>`;

let serverData = null;
let target = null;

/**
 * Records the domain of each `web_search_read` on the test model. Calls on other
 * models get an empty answer: other addons installed with this one (in the OCA CI,
 * the whole repository) may query their own models when the web client starts.
 *
 * @param {Array} [searches] receives one domain per search
 * @returns {Function} mockRPC callback
 */
function mockRPC(searches = []) {
    return (route, args) => {
        if (args.model && !(args.model in serverData.models)) {
            switch (args.method) {
                case "search_read":
                    return [];
                case "web_search_read":
                    return {length: 0, records: []};
                case "search_count":
                    return 0;
                default:
                    return false;
            }
        }
        if (args.method === "web_search_read") {
            searches.push(args.kwargs.domain);
        }
    };
}

/**
 * The control panel renders the buttons twice (desktop and mobile), only one is visible.
 *
 * @returns {HTMLElement} visible date range button
 */
function getRangeButton() {
    return [...target.querySelectorAll(".o_date_range_button")].find(
        (el) => el.offsetParent
    );
}

async function selectRange(dateRange) {
    const radio = target.querySelector(`.modal #o_date_range_${dateRange}`);
    radio.checked = true;
    await triggerEvent(radio, null, "change");
}

QUnit.module("web_list_date_range_required", (hooks) => {
    hooks.beforeEach(() => {
        target = getFixture();
        const now = DateTime.local();
        const at = (days) => serializeDateTime(now.minus({days}));
        serverData = {
            models: {
                event: {
                    fields: {
                        name: {string: "Name", type: "char"},
                        moment: {string: "Moment", type: "datetime"},
                        day: {string: "Day", type: "date"},
                        count: {string: "Count", type: "integer"},
                    },
                    records: [
                        {id: 1, name: "now", moment: at(0), day: now.toISODate()},
                        {id: 2, name: "5 days ago", moment: at(5)},
                        {id: 3, name: "30 days ago", moment: at(30)},
                    ],
                },
            },
        };
        setupViewRegistries();
        // The real Dialog can be patched by other addons (web_dialog_size calls the server)
        class MockDialog extends Component {
            static template = xml`<div class="modal d-block">
                <t t-slot="default"/><t t-slot="footer"/>
            </div>`;
            static props = ["*"];
        }
        patchWithCleanup(DateRangeDialog.components, {Dialog: MockDialog});
    });

    QUnit.module("DateRangeListView");

    QUnit.test("asks for a range and loads nothing before", async (assert) => {
        const searches = [];
        await makeView({
            type: "list",
            resModel: "event",
            serverData,
            arch: ARCH,
            mockRPC: mockRPC(searches),
        });

        assert.containsOnce(target, ".modal .o_date_range_dialog");
        assert.containsNone(target, ".o_data_row");
        assert.strictEqual(searches.length, 1);
        assert.deepEqual(searches[0], [["id", "=", false]]);
    });

    QUnit.test("filters by the chosen range", async (assert) => {
        const searches = [];
        const list = await makeView({
            type: "list",
            resModel: "event",
            serverData,
            arch: ARCH,
            mockRPC: mockRPC(searches),
        });

        await click(target, ".modal .o_date_range_search");
        assert.containsNone(target, ".modal");
        assert.containsOnce(target, ".o_data_row");
        const [, fromCond, untilCond] = searches.at(-1);
        assert.deepEqual(fromCond.slice(0, 2), ["moment", ">="]);
        assert.deepEqual(untilCond.slice(0, 2), ["moment", "<="]);

        await click(getRangeButton());
        await selectRange("last_7_days");
        await click(target, ".modal .o_date_range_search");
        assert.containsN(target, ".o_data_row", 2);
        assert.strictEqual(getRangeButton().textContent.trim(), "Last 7 Days");
        const state = list.env.searchModel.exportState();
        assert.strictEqual(state.dateRangeParams.dateRange, "last_7_days");
        assert.strictEqual(state.dateRangeParams.fieldName, "moment");
    });

    QUnit.test("keeps the range when switching views", async (assert) => {
        serverData.views = {
            "event,false,list": ARCH,
            "event,false,kanban": `<kanban><templates><t t-name="kanban-box">
                <div><field name="name"/></div>
            </t></templates></kanban>`,
            "event,false,search": "<search/>",
        };
        const webClient = await createWebClient({serverData, mockRPC: mockRPC()});
        await doAction(webClient, {
            type: "ir.actions.act_window",
            res_model: "event",
            views: [
                [false, "list"],
                [false, "kanban"],
            ],
        });
        // The dialog opens once the list is mounted
        await nextTick();
        await selectRange("last_7_days");
        await click(target, ".modal .o_date_range_search");
        assert.containsN(target, ".o_data_row", 2);

        await click(target.querySelector(".o_switch_view.o_kanban"));
        assert.containsN(target, ".o_kanban_record:not(.o_kanban_ghost)", 2);

        await click(target.querySelector(".o_switch_view.o_list"));
        assert.containsNone(target, ".modal", "no dialog when the range is known");
        assert.containsN(target, ".o_data_row", 2);
        assert.strictEqual(getRangeButton().textContent.trim(), "Last 7 Days");
    });

    QUnit.test("date fields are filtered by day", async (assert) => {
        const searches = [];
        await makeView({
            type: "list",
            resModel: "event",
            serverData,
            arch: `<tree js_class="date_range_list">
                <field name="name"/>
                <field name="day" options="{'date_range': True}"/>
            </tree>`,
            mockRPC: mockRPC(searches),
        });
        await click(target, ".modal .o_date_range_search");
        const today = DateTime.local().toISODate();
        assert.deepEqual(searches.at(-1), [
            "&",
            ["day", ">=", today],
            ["day", "<=", today],
        ]);
        assert.containsOnce(target, ".o_data_row");
    });

    QUnit.module("DateRangeListArchParser");

    /**
     * @param {String} fields `<field>` nodes of the arch
     * @returns {Object} archInfo
     */
    function parseArch(fields) {
        const models = {event: serverData.models.event.fields};
        return new DateRangeListArchParser().parse(
            parseXML(`<tree>${fields}</tree>`),
            models,
            "event"
        );
    }

    QUnit.test("reads the field and the max days", (assert) => {
        const archInfo = parseArch(
            `<field name="name"/>
            <field name="moment" options="{'date_range': {'max_days': 200}}"/>`
        );
        assert.strictEqual(archInfo.dateRangeField, "moment");
        assert.strictEqual(archInfo.dateRangeFieldType, "datetime");
        assert.strictEqual(archInfo.dateRangeMaxDays, 200);
    });

    QUnit.test("max days is optional", (assert) => {
        const archInfo = parseArch(
            `<field name="day" options="{'date_range': True}"/>`
        );
        assert.strictEqual(archInfo.dateRangeField, "day");
        assert.strictEqual(archInfo.dateRangeFieldType, "date");
        assert.strictEqual(archInfo.dateRangeMaxDays, undefined);
    });

    QUnit.test("rejects a wrong configuration", (assert) => {
        assert.throws(() => parseArch(`<field name="moment"/>`), "no range field");
        assert.throws(
            () => parseArch(`<field name="count" options="{'date_range': True}"/>`),
            "not a date field"
        );
        assert.throws(
            () =>
                parseArch(
                    `<field name="moment" options="{'date_range': {'max_days': 'abc'}}"/>`
                ),
            "max days not an integer"
        );
    });
});
