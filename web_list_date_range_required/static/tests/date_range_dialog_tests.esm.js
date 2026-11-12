/** @odoo-module **/
/* Copyright 2026 Heligrafics Fotogrametria S.L.
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl). */
/* global QUnit */

import {Component, xml} from "@odoo/owl";
import {getFixture, mount, patchWithCleanup} from "@web/../tests/helpers/utils";
import {DateRangeDialog} from "@web_list_date_range_required/date_range_dialog/date_range_dialog.esm";
import {makeTestEnv} from "@web/../tests/helpers/mock_env";

const {DateTime} = luxon;

QUnit.module("web_list_date_range_required", (hooks) => {
    let target = null;

    hooks.beforeEach(() => {
        target = getFixture();
        // The real Dialog needs the env of the dialog service
        class MockDialog extends Component {
            static template = xml`<div class="o_mock_dialog">
                <t t-slot="default"/><t t-slot="footer"/>
            </div>`;
            static props = ["*"];
        }
        // DateTimeInput needs the datetime_picker service
        class MockDateTimeInput extends Component {
            static template = xml`<input class="o_mock_datetime_input"/>`;
            static props = ["*"];
        }
        patchWithCleanup(DateRangeDialog.components, {
            Dialog: MockDialog,
            DateTimeInput: MockDateTimeInput,
        });
    });

    QUnit.module("DateRangeDialog");

    async function mountDialog(props = {}) {
        const env = await makeTestEnv();
        return mount(DateRangeDialog, target, {
            env,
            props: {save: () => undefined, close: () => undefined, ...props},
        });
    }

    async function mountCustomRange(days, props = {}) {
        const untilDate = DateTime.local().endOf("day");
        const dialog = await mountDialog({
            dateRange: "custom",
            fromDate: untilDate.minus({days}),
            untilDate,
            ...props,
        });
        dialog.checkRange();
        return dialog;
    }

    QUnit.test("predefined ranges set their dates", async (assert) => {
        const dialog = await mountDialog();
        const today = DateTime.local().startOf("day");
        assert.ok(dialog.state.fromDate.equals(today));

        dialog.onChangeDateRange("yesterday");
        assert.ok(dialog.state.fromDate.equals(today.minus({days: 1})));
        assert.ok(dialog.state.untilDate.equals(today.minus({days: 1}).endOf("day")));

        dialog.onChangeDateRange("last_7_days");
        assert.ok(dialog.state.fromDate.equals(today.minus({days: 7})));
        assert.ok(dialog.state.untilDate.equals(today.endOf("day")));
    });

    QUnit.test("default max days rejects a 61-day range", async (assert) => {
        const dialog = await mountCustomRange(61);
        assert.ok(dialog.state.error.includes("60"), dialog.state.error);
    });

    QUnit.test("max days 200 accepts a 150-day range", async (assert) => {
        const dialog = await mountCustomRange(150, {maxDays: 200});
        assert.strictEqual(dialog.state.error, null);
    });

    QUnit.test("max days 200 rejects a 201-day range", async (assert) => {
        const dialog = await mountCustomRange(201, {maxDays: 200});
        assert.ok(dialog.state.error.includes("200"), dialog.state.error);
    });

    QUnit.test("start date after end date is an error", async (assert) => {
        const dialog = await mountCustomRange(-1);
        assert.ok(dialog.state.error);
    });

    QUnit.test("custom range keeps the given dates", async (assert) => {
        const fromDate = DateTime.local(2026, 3, 1, 8, 0);
        const untilDate = DateTime.local(2026, 3, 2, 20, 0);
        const dialog = await mountDialog({dateRange: "custom", fromDate, untilDate});
        assert.ok(dialog.state.fromDate.equals(fromDate));
        assert.ok(dialog.state.untilDate.equals(untilDate));
    });
});
