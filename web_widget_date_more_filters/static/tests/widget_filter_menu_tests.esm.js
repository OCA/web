/** @odoo-module **/
/* Copyright 2024 OpenStudio
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl). */

import * as dates from "@web/search/utils/dates";
import {
    getFacetTexts,
    isOptionSelected,
    makeWithSearch,
    setupControlPanelServiceRegistry,
    toggleComparisonMenu,
    toggleFilterMenu,
    toggleMenuItem,
    toggleMenuItemOption,
} from "@web/../tests/search/helpers";
import {getFixture, patchDate, patchWithCleanup} from "@web/../tests/helpers/utils";
import {ControlPanel} from "@web/search/control_panel/control_panel";
import {browser} from "@web/core/browser/browser";

const {DateTime} = luxon;
const {QUnit} = window;

function getDomain(controlPanel) {
    return controlPanel.env.searchModel.domain;
}

let target = null;
let serverData = null;
QUnit.module("Search", (hooks) => {
    hooks.beforeEach(async () => {
        serverData = {
            models: {
                foo: {
                    fields: {
                        date_field: {
                            string: "Date",
                            type: "date",
                            store: true,
                            sortable: true,
                            searchable: true,
                        },
                        foo: {string: "Foo", type: "char", store: true, sortable: true},
                    },
                    records: {},
                },
            },
            views: {
                "foo,false,search": `<search/>`,
            },
        };
        setupControlPanelServiceRegistry();
        patchWithCleanup(browser, {
            setTimeout: (fn) => fn(),
            // eslint-disable-next-line no-empty-function
            clearTimeout: () => {},
        });
        target = getFixture();
    });

    QUnit.module("FilterMenu");

    async function openDateFilterMenu() {
        const controlPanel = await makeWithSearch({
            serverData,
            resModel: "foo",
            Component: ControlPanel,
            searchViewId: false,
            searchMenuTypes: ["filter", "comparison"],
            searchViewArch: `
                    <search>
                        <filter string="Date" name="date_field" date="date_field"/>
                    </search>
                `,
            context: {search_default_date_field: 1},
        });
        await toggleFilterMenu(target);
        await toggleMenuItem(target, "Date");
        return controlPanel;
    }

    /** Deselect the default period (the current month and the year). */
    async function clearDefaultPeriod() {
        await toggleMenuItemOption(target, "Date", "December");
        await toggleMenuItemOption(target, "Date", "2024");
    }

    QUnit.test("the new periods are offered", async function (assert) {
        assert.expect(1);
        patchDate(2024, 11, 2, 1, 0, 0);
        await openDateFilterMenu();
        const optionDescriptions = [
            ...target.querySelectorAll(".dropdown .o_item_option"),
        ].map((e) => e.innerText.trim());
        assert.deepEqual(optionDescriptions, [
            "December",
            "November",
            "October",
            "Q4",
            "Q3",
            "Q2",
            "Q1",
            "2024",
            "2023",
            "2022",
            "Today",
            "Yesterday",
            "This week",
            "Last week",
            "Last 7 days",
            "Last 30 days",
            "Last 365 days",
        ]);
    });

    QUnit.test("a sliding window covers exactly its own days", async function (assert) {
        assert.expect(6);
        patchDate(2024, 11, 2, 1, 0, 0);
        const controlPanel = await openDateFilterMenu();
        await clearDefaultPeriod();
        await toggleMenuItemOption(target, "Date", "Last 7 days");
        assert.deepEqual(getDomain(controlPanel), [
            "&",
            ["date_field", ">=", "2024-11-26"],
            ["date_field", "<=", "2024-12-02"],
        ]);
        assert.deepEqual(getFacetTexts(target), ["Date: Last 7 days"]);
        // The option is complete on its own: no year is selected with it
        assert.notOk(isOptionSelected(target, "Date", "2024"));
        assert.notOk(isOptionSelected(target, "Date", "2023"));
        await toggleMenuItemOption(target, "Date", "Last 7 days");
        assert.deepEqual(getDomain(controlPanel), []);
        assert.deepEqual(getFacetTexts(target), []);
    });

    QUnit.test(
        "a month selected with a sliding window is kept",
        async function (assert) {
            assert.expect(2);
            patchDate(2024, 11, 2, 1, 0, 0);
            const controlPanel = await openDateFilterMenu();
            // The default period is "December": the window must not widen it
            await toggleMenuItemOption(target, "Date", "Last 30 days");
            // The ranges are sorted by the client: the day comes first
            assert.deepEqual(getDomain(controlPanel), [
                "|",
                "&",
                ["date_field", ">=", "2024-11-03"],
                ["date_field", "<=", "2024-12-02"],
                "&",
                ["date_field", ">=", "2024-12-01"],
                ["date_field", "<=", "2024-12-31"],
            ]);
            assert.deepEqual(getFacetTexts(target), [
                "Date: Last 30 days/December 2024",
            ]);
        }
    );

    QUnit.test("two sliding windows are independent", async function (assert) {
        assert.expect(2);
        patchDate(2024, 11, 2, 1, 0, 0);
        const controlPanel = await openDateFilterMenu();
        await clearDefaultPeriod();
        await toggleMenuItemOption(target, "Date", "Last 7 days");
        await toggleMenuItemOption(target, "Date", "Last 30 days");
        assert.deepEqual(getDomain(controlPanel), [
            "|",
            "&",
            ["date_field", ">=", "2024-11-26"],
            ["date_field", "<=", "2024-12-02"],
            "&",
            ["date_field", ">=", "2024-11-03"],
            ["date_field", "<=", "2024-12-02"],
        ]);
        assert.deepEqual(getFacetTexts(target), ["Date: Last 7 days/Last 30 days"]);
    });

    QUnit.test(
        "a compared sliding window shifts of its own width",
        async function (assert) {
            assert.expect(3);
            patchDate(2024, 11, 2, 1, 0, 0);
            const controlPanel = await openDateFilterMenu();
            await clearDefaultPeriod();
            await toggleMenuItemOption(target, "Date", "Last 7 days");
            await toggleComparisonMenu(target);
            await toggleMenuItem(target, "Date: Previous Period");
            // The comparison of the model is computed by the client with the
            // helpers it imported: it has to see the periods of the module.
            const comparison = controlPanel.env.searchModel.getFullComparison();
            assert.deepEqual(comparison.range, [
                "&",
                ["date_field", ">=", "2024-11-26"],
                ["date_field", "<=", "2024-12-02"],
            ]);
            assert.deepEqual(comparison.comparisonRange, [
                "&",
                ["date_field", ">=", "2024-11-19"],
                ["date_field", "<=", "2024-11-25"],
            ]);
            assert.deepEqual(getFacetTexts(target), [
                "Date: Last 7 days",
                "Date: Previous Period",
            ]);
        }
    );

    QUnit.test("yesterday on the first day of a month", async function (assert) {
        assert.expect(2);
        patchDate(2025, 1, 1, 1, 0, 0);
        const controlPanel = await openDateFilterMenu();
        await toggleMenuItemOption(target, "Date", "February");
        await toggleMenuItemOption(target, "Date", "Yesterday");
        assert.deepEqual(getDomain(controlPanel), [
            "&",
            ["date_field", ">=", "2025-01-31"],
            ["date_field", "<=", "2025-01-31"],
        ]);
        assert.deepEqual(getFacetTexts(target), ["Date: Yesterday 2025"]);
    });

    QUnit.test(
        "a week option with another year uses the ISO week",
        async function (assert) {
            assert.expect(2);
            patchDate(2024, 11, 2, 1, 0, 0);
            const controlPanel = await openDateFilterMenu();
            await clearDefaultPeriod();
            await toggleMenuItemOption(target, "Date", "This week");
            await toggleMenuItemOption(target, "Date", "2023");
            // The ISO week 49 of 2023, not the week around the 2nd of December
            assert.deepEqual(getDomain(controlPanel), [
                "&",
                ["date_field", ">=", "2023-12-04"],
                ["date_field", "<=", "2023-12-10"],
            ]);
            assert.deepEqual(getFacetTexts(target), ["Date: Week: 49 - 2023"]);
        }
    );
});

QUnit.module("DateFilterExtraPeriods");

QUnit.test(
    "the comparison shifts a sliding window of its own width",
    function (assert) {
        assert.expect(4);
        const referenceMoment = DateTime.local(2024, 12, 2);
        for (const [optionId, days] of [
            ["last_7_days", -7],
            ["last_30_days", -30],
            ["last_365_days", -365],
            ["this_day", -1],
        ]) {
            assert.deepEqual(
                dates.getComparisonParams(
                    referenceMoment,
                    [optionId],
                    "previous_period"
                )[0],
                {days},
                optionId
            );
        }
    }
);

QUnit.test("a compared week is described by its ISO year", function (assert) {
    assert.expect(1);
    // 2024-12-30 belongs to the first ISO week of 2025: the calendar year of
    // the same date would describe a week that does not exist in it
    const {description} = dates.constructDateRange({
        referenceMoment: DateTime.local(2024, 12, 30),
        fieldName: "date_field",
        fieldType: "date",
        granularity: "week",
        setParam: {weekNumber: 1},
        plusParam: null,
        comparisonOptionId: "previous_period",
    });
    assert.equal(description, "Week: 1 - 2025");
});

QUnit.test("a datetime field is filtered with its times", function (assert) {
    assert.expect(1);
    const originalZone = luxon.Settings.defaultZone;
    // The bounds of a datetime domain are serialized in UTC: the zone is
    // pinned to make the test independent from the machine running it
    luxon.Settings.defaultZone = luxon.FixedOffsetZone.utcInstance;
    try {
        const {domain} = dates.constructDateRange({
            referenceMoment: DateTime.local(2024, 12, 2),
            fieldName: "datetime_field",
            fieldType: "datetime",
            granularity: "day",
            setParam: {day: 2, month: 12},
            plusParam: null,
            minusParams: {leftDate: {days: 7}},
            comparisonOptionId: null,
            description: "Last 7 days",
        });
        assert.deepEqual(domain.toList(), [
            "&",
            ["datetime_field", ">=", "2024-11-26 00:00:00"],
            ["datetime_field", "<=", "2024-12-02 23:59:59"],
        ]);
    } finally {
        luxon.Settings.defaultZone = originalZone;
    }
});
