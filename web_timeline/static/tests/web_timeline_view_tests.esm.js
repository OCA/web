import {click, getFixture} from "@web/../tests/helpers/utils";
import {makeView, setupViewRegistries} from "@web/../tests/views/helpers";
import {FAKE_ORDER_FIELDS} from "./helpers.esm";
import {loadBundle} from "@web/core/assets";

let serverData = {};
let target = null;

QUnit.module("Views", (hooks) => {
    loadBundle("web_timeline.vis-timeline_lib");
    hooks.beforeEach(async () => {
        serverData = {
            models: {
                partner: {
                    fields: {
                        name: {string: "Name", type: "char"},
                    },
                    records: [
                        {id: 1, name: "Partner 1"},
                        {id: 2, name: "Partner 2"},
                        {id: 3, name: "Partner 3"},
                    ],
                },
                order: {
                    fields: FAKE_ORDER_FIELDS,
                    records: [
                        {
                            id: 1,
                            display_name: "Record 1",
                            date_start: "2024-01-01",
                            date_end: "2024-01-02",
                            partner_id: 1,
                        },
                        {
                            id: 2,
                            display_name: "Record 2",
                            date_start: "2024-01-03",
                            date_end: "2024-02-05",
                            partner_id: 1,
                        },
                        {
                            id: 3,
                            display_name: "Record 3",
                            date_start: "2024-01-10",
                            date_end: "2024-01-15",
                            partner_id: 2,
                        },
                        {
                            id: 4,
                            display_name: "Record 4",
                            date_start: "2024-01-15",
                            date_end: "2024-02-01",
                            partner_id: 3,
                        },
                    ],
                    methods: {
                        check_access_rights() {
                            return Promise.resolve(true);
                        },
                    },
                },
            },
        };
        setupViewRegistries();
        target = getFixture();
    });

    QUnit.module("TimelineView - View");

    QUnit.test("Test basic timeline view", async (assert) => {
        await makeView({
            type: "timeline",
            resModel: "order",
            serverData,
            arch: '<timeline date_start="date_start" date_stop="date_stop" default_group_by="partner_id"/>',
        });
        assert.containsOnce(target, ".oe_timeline_view");
    });

    QUnit.test("click today slot", async (assert) => {
        await makeView({
            type: "timeline",
            resModel: "order",
            serverData,
            arch: '<timeline date_start="date_start" date_stop="date_stop" default_group_by="partner_id"/>',
        });
        const $today = target.querySelector(".oe_timeline_button_today");
        const $day = target.querySelector(".oe_timeline_button_scale_day");
        const $week = target.querySelector(".oe_timeline_button_scale_week");
        const $month = target.querySelector(".oe_timeline_button_scale_month");
        const $year = target.querySelector(".oe_timeline_button_scale_year");
        await click($today);
        assert.hasClass(
            $today,
            "btn-primary",
            "today should have classnames btn-primary"
        );
        assert.doesNotHaveClass(
            $day,
            "btn-primary",
            "day should no have classnames btn-primary"
        );
        assert.doesNotHaveClass(
            $week,
            "btn-primary",
            "week should no have classnames btn-primary"
        );
        assert.doesNotHaveClass(
            $month,
            "btn-primary",
            "month should no have classnames btn-primary"
        );
        assert.doesNotHaveClass(
            $year,
            "btn-primary",
            "year should no have classnames btn-primary"
        );
    });

    QUnit.test("click month slot", async (assert) => {
        await makeView({
            type: "timeline",
            resModel: "order",
            serverData,
            arch: '<timeline date_start="date_start" date_stop="date_stop" default_group_by="partner_id"/>',
        });
        const $today = target.querySelector(".oe_timeline_button_today");
        const $day = target.querySelector(".oe_timeline_button_scale_day");
        const $week = target.querySelector(".oe_timeline_button_scale_week");
        const $month = target.querySelector(".oe_timeline_button_scale_month");
        const $year = target.querySelector(".oe_timeline_button_scale_year");
        await click($month);
        assert.hasClass(
            $month,
            "btn-primary",
            "month should have classnames btn-primary"
        );
        assert.doesNotHaveClass(
            $today,
            "btn-primary",
            "today should no have classnames btn-primary"
        );
        assert.doesNotHaveClass(
            $day,
            "btn-primary",
            "day should no have classnames btn-primary"
        );
        assert.doesNotHaveClass(
            $week,
            "btn-primary",
            "week should no have classnames btn-primary"
        );
        assert.doesNotHaveClass(
            $year,
            "btn-primary",
            "year should no have classnames btn-primary"
        );
    });

    QUnit.test("Check button delete", async (assert) => {
        await makeView({
            type: "timeline",
            resModel: "order",
            serverData,
            arch: '<timeline date_start="date_start" date_stop="date_stop" default_group_by="partner_id"/>',
        });
        const $elements = [...target.querySelectorAll(".vis-item-content")];
        const $item_contents = $elements.filter((el) =>
            el.textContent.includes("Record 2")
        );
        assert.strictEqual($item_contents.length, 1, "items should be 1");
        const $item_content = $item_contents[0];
        await click($item_content);
        assert.containsOnce($item_content.parentElement, ".vis-delete");
    });

    QUnit.test("Check button delete disabled", async (assert) => {
        await makeView({
            type: "timeline",
            resModel: "order",
            serverData,
            arch: '<timeline date_start="date_start" date_stop="date_stop" default_group_by="partner_id" delete="0"/>',
        });
        const $elements = [...target.querySelectorAll(".vis-item-content")];
        const $item_contents = $elements.filter((el) =>
            el.textContent.includes("Record 2")
        );
        assert.strictEqual($item_contents.length, 1, "items should be 1");
        const $item_content = $item_contents[0];
        await click($item_content);
        assert.containsNone($item_content.parentElement, ".vis-delete");
    });
});
