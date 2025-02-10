/** @odoo-module **/
/* Copyright 2025 Miika Nissi (https://miikanissi.com)
/* License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). */

import {click, getFixture} from "@web/../tests/helpers/utils";
import {
    makeWithSearch,
    setupControlPanelServiceRegistry,
} from "@web/../tests/search/helpers";
import {ControlPanel} from "@web/search/control_panel/control_panel";

const {QUnit} = window;
let target = null;
let serverData = {};

function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

QUnit.module("ControlPanel with Refresher", (hooks) => {
    hooks.beforeEach(async () => {
        serverData = {
            models: {
                foo: {
                    fields: {},
                },
            },
            views: {
                "foo,false,search": `<search/>`,
            },
        };
        setupControlPanelServiceRegistry();
        target = getFixture();

        // Add the .o_content element to the test fixture for the refresher animation
        // to work properly
        const contentElement = document.createElement("div");
        contentElement.id = "test-content";
        contentElement.className = "o_content";
        target.appendChild(contentElement);
    });

    hooks.afterEach(() => {
        // Clean up the test content element
        const contentElement = target.querySelector("#test-content");
        if (contentElement) {
            contentElement.remove();
        }
    });

    QUnit.test("refresher button rendering", async (assert) => {
        await makeWithSearch({
            serverData,
            resModel: "foo",
            Component: ControlPanel,
            componentProps: {
                display: {
                    "top-right": false,
                },
            },

            searchMenuTypes: [],
        });

        assert.containsOnce(
            target,
            ".oe_refresher .oe_pager_refresh",
            "Refresher button is rendered"
        );
        assert.containsOnce(
            target,
            ".oe_refresher #autoRefresherToggle",
            "Auto refresher toggle is rendered"
        );
    });

    QUnit.test("manual refresh", async (assert) => {
        const controlPanel = await makeWithSearch({
            serverData,
            resModel: "foo",
            Component: ControlPanel,
            componentProps: {
                display: {
                    "top-right": false,
                },
            },
            searchMenuTypes: [],
        });

        controlPanel.env.searchModel.search = async () => {
            assert.step("refresh");
            return true;
        };

        const refresherButton = target.querySelector(".oe_pager_refresh");
        controlPanel.render();

        // HACK: The refresher uses a debounced function to handle the click event.
        // We need to wait for the debounced function to be called.
        await click(refresherButton);
        await delay(2000);

        assert.verifySteps(["refresh"], "Manual refresh triggered");
    });

    QUnit.test("auto refresh toggle", async (assert) => {
        await makeWithSearch({
            serverData,
            resModel: "foo",
            Component: ControlPanel,
            componentProps: {
                display: {
                    "top-right": false,
                },
            },
            searchMenuTypes: [],
        });

        const toggle = target.querySelector("#autoRefresherToggle");

        await click(toggle);
        assert.ok(toggle.checked, "Auto refresh enabled");

        await click(toggle);
        assert.notOk(toggle.checked, "Auto refresh disabled");
    });

    QUnit.test("auto refresh functionality", async (assert) => {
        const controlPanel = await makeWithSearch({
            serverData,
            resModel: "foo",
            Component: ControlPanel,
            componentProps: {
                display: {
                    "top-right": false,
                },
            },
            searchMenuTypes: [],
        });

        const toggle = target.querySelector("#autoRefresherToggle");

        let refreshCount = 0;
        controlPanel.env.searchModel.search = async () => {
            refreshCount++;
            if (refreshCount === 2) {
                assert.step("auto-refresh");
                // Disable auto refresher after the second refresh
                await click(toggle);
            }
            return true;
        };

        // Set the auto refresher interval to 1 second
        controlPanel.refresherProps.autoRefresherIntervalTime = 1000;

        // Enable auto refresher
        await click(toggle);

        // Simulate the passage of time for auto-refresh
        await delay(2000);

        assert.verifySteps(["auto-refresh"], "Auto refresh triggered");
    });
});
