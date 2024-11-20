/** @odoo-module **/

import {
    getFacetTexts,
    isOptionSelected,
    makeWithSearch,
    setupControlPanelServiceRegistry,
    toggleFilterMenu,
    toggleMenuItem,
    toggleMenuItemOption,
} from "@web/../tests/search/helpers";
import {getFixture, patchDate, patchWithCleanup} from "@web/../tests/helpers/utils";

import {ControlPanel} from "@web/search/control_panel/control_panel";
import {browser} from "@web/core/browser/browser";

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

    QUnit.test("should get new date filters", async function (assert) {
        assert.expect(46);

        patchDate(2024, 11, 2, 1, 0, 0);

        const controlPanel = await makeWithSearch({
            serverData,
            resModel: "foo",
            Component: ControlPanel,
            searchViewId: false,
            searchMenuTypes: ["filter"],
            searchViewArch: `
                    <search>
                        <filter string="Date" name="date_field" date="date_field"/>
                    </search>
                `,
            context: {search_default_date_field: 1},
        });
        await toggleFilterMenu(target);
        await toggleMenuItem(target, "Date");

        const optionEls = target.querySelectorAll(".dropdown .o_item_option");
        const optionDescriptions = [...optionEls].map((e) => e.innerText.trim());

        const expectedDescriptions = [
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
        ];
        assert.deepEqual(optionDescriptions, expectedDescriptions);

        const steps = [
            {
                toggledOption: "December",
                resultingFacet: "Date: 2024",
                selectedoptions: ["2024"],
                domain: [
                    "&",
                    ["date_field", ">=", "2024-01-01"],
                    ["date_field", "<=", "2024-12-31"],
                ],
            },
            {
                toggledOption: "Last 7 days",
                resultingFacet: "Date: Last 7 days",
                selectedoptions: ["2024"],
                domain: [
                    "&",
                    ["date_field", ">=", "2024-11-25"],
                    ["date_field", "<=", "2024-12-02"],
                ],
            },
            {
                toggledOption: "Last 7 days",
                resultingFacet: "Date: 2024",
                selectedoptions: ["2024"],
                domain: [
                    "&",
                    ["date_field", ">=", "2024-01-01"],
                    ["date_field", "<=", "2024-12-31"],
                ],
            },
            {
                toggledOption: "Last 30 days",
                resultingFacet: "Date: Last 30 days",
                selectedoptions: ["2024"],
                domain: [
                    "&",
                    ["date_field", ">=", "2024-11-02"],
                    ["date_field", "<=", "2024-12-02"],
                ],
            },
            {
                toggledOption: "Last 30 days",
                resultingFacet: "Date: 2024",
                selectedoptions: ["2024"],
                domain: [
                    "&",
                    ["date_field", ">=", "2024-01-01"],
                    ["date_field", "<=", "2024-12-31"],
                ],
            },
            {
                toggledOption: "Last 365 days",
                resultingFacet: "Date: Last 365 days",
                selectedoptions: ["2024"],
                domain: [
                    "&",
                    ["date_field", ">=", "2023-12-03"],
                    ["date_field", "<=", "2024-12-02"],
                ],
            },
            {
                toggledOption: "Last 365 days",
                resultingFacet: "Date: 2024",
                selectedoptions: ["2024"],
                domain: [
                    "&",
                    ["date_field", ">=", "2024-01-01"],
                    ["date_field", "<=", "2024-12-31"],
                ],
            },
            {
                toggledOption: "Today",
                resultingFacet: "Date: Today",
                selectedoptions: ["2024"],
                domain: [
                    "&",
                    ["date_field", ">=", "2024-12-02"],
                    ["date_field", "<=", "2024-12-02"],
                ],
            },
            {
                toggledOption: "Today",
                resultingFacet: "Date: 2024",
                selectedoptions: ["2024"],
                domain: [
                    "&",
                    ["date_field", ">=", "2024-01-01"],
                    ["date_field", "<=", "2024-12-31"],
                ],
            },
            {
                toggledOption: "Yesterday",
                resultingFacet: "Date: Yesterday",
                selectedoptions: ["2024"],
                domain: [
                    "&",
                    ["date_field", ">=", "2024-12-01"],
                    ["date_field", "<=", "2024-12-01"],
                ],
            },
            {
                toggledOption: "Yesterday",
                resultingFacet: "Date: 2024",
                selectedoptions: ["2024"],
                domain: [
                    "&",
                    ["date_field", ">=", "2024-01-01"],
                    ["date_field", "<=", "2024-12-31"],
                ],
            },
            {
                toggledOption: "This week",
                resultingFacet: "Date: This week",
                selectedoptions: ["2024"],
                domain: [
                    "&",
                    ["date_field", ">=", "2024-12-02"],
                    ["date_field", "<=", "2024-12-08"],
                ],
            },
            {
                toggledOption: "This week",
                resultingFacet: "Date: 2024",
                selectedoptions: ["2024"],
                domain: [
                    "&",
                    ["date_field", ">=", "2024-01-01"],
                    ["date_field", "<=", "2024-12-31"],
                ],
            },
            {
                toggledOption: "Last week",
                resultingFacet: "Date: Last week",
                selectedoptions: ["2024"],
                domain: [
                    "&",
                    ["date_field", ">=", "2024-11-25"],
                    ["date_field", "<=", "2024-12-01"],
                ],
            },
            {
                toggledOption: "Last week",
                resultingFacet: "Date: 2024",
                selectedoptions: ["2024"],
                domain: [
                    "&",
                    ["date_field", ">=", "2024-01-01"],
                    ["date_field", "<=", "2024-12-31"],
                ],
            },
        ];

        for (const s of steps) {
            await toggleMenuItemOption(target, "Date", s.toggledOption);
            assert.deepEqual(getDomain(controlPanel), s.domain);
            if (s.resultingFacet) {
                assert.deepEqual(getFacetTexts(target), [s.resultingFacet]);
            } else {
                assert.deepEqual(getFacetTexts(target), []);
            }
            s.selectedoptions.forEach((option) => {
                assert.ok(
                    isOptionSelected(target, "Date", option),
                    `at step ${steps.indexOf(s) + 1}, ${option} should be selected`
                );
            });
        }
    });
});
