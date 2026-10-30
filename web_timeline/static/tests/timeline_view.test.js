import {expect, queryAll, test} from "@odoo/hoot";
import {animationFrame} from "@odoo/hoot-dom";
import {
    contains,
    defineModels,
    fields,
    models,
    mountView,
    onRpc,
    preloadBundle,
} from "@web/../tests/web_test_helpers";

class Partner extends models.Model {
    _name = "partner";
    name = fields.Char();
    _records = [
        {id: 1, name: "Partner 1"},
        {id: 2, name: "Partner 2"},
        {id: 3, name: "Partner 3"},
    ];
}

class Order extends models.Model {
    _name = "order";
    name = fields.Char();
    date_start = fields.Date();
    date_end = fields.Date();
    partner_id = fields.Many2one({relation: "partner"});
    _records = [
        {
            id: 1,
            name: "Record 1",
            date_start: "2024-01-01",
            date_end: "2024-01-02",
            partner_id: 1,
        },
        {
            id: 2,
            name: "Record 2",
            date_start: "2024-01-03",
            date_end: "2024-02-05",
            partner_id: 1,
        },
        {
            id: 3,
            name: "Record 3",
            date_start: "2024-01-10",
            date_end: "2024-01-15",
            partner_id: 2,
        },
        {
            id: 4,
            name: "Record 4",
            date_start: "2024-01-15",
            date_end: "2024-02-01",
            partner_id: 3,
        },
    ];
}

defineModels([Partner, Order]);
preloadBundle("web_timeline.vis-timeline_lib");
onRpc("has_access", () => true);

const ARCH = `<timeline date_start="date_start" date_stop="date_end" default_group_by="partner_id"/>`;
const BUTTONS = ["today", "scale_day", "scale_week", "scale_month", "scale_year"];

function checkActiveButton(active) {
    for (const button of BUTTONS) {
        const selector = `.oe_timeline_button_${button}`;
        if (button === active) {
            expect(selector).toHaveClass("btn-primary");
        } else {
            expect(selector).not.toHaveClass("btn-primary");
        }
    }
}

async function mountTimeline(arch = ARCH) {
    await mountView({type: "timeline", resModel: "order", arch});
    await animationFrame();
}

function getItemContent(name) {
    return queryAll(".vis-item-content").filter((el) => el.textContent.includes(name));
}

test("basic timeline view", async () => {
    await mountTimeline();
    expect(".oe_timeline_view").toHaveCount(1);
    expect(".vis-timeline").toHaveCount(1);
    expect(".vis-item").toHaveCount(4);
    expect(".vis-label").toHaveCount(4); // UNASSIGNED + 3 partners
});

test("click today slot", async () => {
    await mountTimeline();
    await contains(".oe_timeline_button_today").click();
    checkActiveButton("today");
});

test("click month slot", async () => {
    await mountTimeline();
    await contains(".oe_timeline_button_scale_month").click();
    checkActiveButton("scale_month");
});

test("check button delete", async () => {
    await mountTimeline();
    const items = getItemContent("Record 2");
    expect(items).toHaveLength(1);
    await contains(items[0]).click();
    await animationFrame();
    const item = items[0].closest(".vis-item");
    expect(item).toHaveClass("vis-selected");
    expect(item.querySelector(".vis-delete")).not.toBe(null);
});

test("check button delete disabled", async () => {
    await mountTimeline(
        `<timeline date_start="date_start" date_stop="date_end" default_group_by="partner_id" delete="0"/>`
    );
    const items = getItemContent("Record 2");
    expect(items).toHaveLength(1);
    await contains(items[0]).click();
    await animationFrame();
    const item = items[0].closest(".vis-item");
    expect(item).toHaveClass("vis-selected");
    expect(item.querySelector(".vis-delete")).toBe(null);
});

test("timeline-item template", async () => {
    await mountTimeline(`
        <timeline date_start="date_start" date_stop="date_end" default_group_by="partner_id">
            <field name="name"/>
            <templates>
                <t t-name="timeline-item">
                    <span class="o_test_item" t-out="record.name"/>
                </t>
            </templates>
        </timeline>
    `);
    expect(".vis-item .o_test_item").toHaveCount(4);
    expect(".vis-item .o_test_item:contains(Record 3)").toHaveCount(1);
});
