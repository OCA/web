import {
    BUSY_RETRY_MS,
    DEBOUNCE_MS,
    DEFAULT_MIN_INTERVAL_MS,
} from "@bus_record_events/hooks/use_record_stream.esm";
import {
    CHANGED_CLASS,
    HIGHLIGHT_MS,
    MAX_HIGHLIGHTED_RECORDS,
} from "@bus_record_events/views/record_highlights.esm";
import {Deferred, advanceTime, animationFrame} from "@odoo/hoot-mock";
import {
    MockServer,
    contains,
    defineModels,
    fields,
    getService,
    makeMockEnv,
    models,
    mountView,
    onRpc,
} from "@web/../tests/web_test_helpers";
import {
    TAB_TOKEN,
    TOKEN_CONTEXT_KEY,
} from "@bus_record_events/services/bus_record_event_service.esm";
import {
    checkLabels,
    getModeButton,
    selectMode,
    setupChartJsForTests,
} from "@web/../tests/views/graph/graph_test_helpers";
import {defineBusModels, waitForChannels} from "@bus/../tests/bus_test_helpers";
import {describe, expect, test} from "@odoo/hoot";
import {getWebSocketWorker} from "@bus/../tests/mock_websocket";

describe.current.tags("desktop");

class Partner extends models.Model {
    name = fields.Char();
    age = fields.Integer();
    note = fields.Char({onChange: () => expect.step("note onchange")});
    _records = [
        {id: 1, name: "First", age: 30},
        {id: 2, name: "Second", age: 40},
    ];
}

defineBusModels();
defineModels([Partner]);
setupChartJsForTests();

const CHANNEL = "record_events:partner";
let lastNotificationId = 0;

function pushRecordEvent(payload) {
    getWebSocketWorker().broadcast("notification", [
        {
            id: ++lastNotificationId,
            message: {
                type: "bus.record/event",
                payload: {
                    model: "partner",
                    created: [],
                    written: [],
                    unlinked: [],
                    ...payload,
                },
            },
        },
    ]);
}

async function settle(ms) {
    // The mock worker posts messages asynchronously: let them reach the hook
    // before moving the clock, or its timer does not exist yet.
    await animationFrame();
    await advanceTime(ms);
    await animationFrame();
}

async function mountList() {
    onRpc("web_search_read", () => expect.step("web_search_read"));
    await mountView({
        type: "list",
        resModel: "partner",
        arch: `<list><field name="name"/></list>`,
    });
    await waitForChannels([CHANNEL]);
    expect.verifySteps(["web_search_read"]);
}

async function mountForm() {
    onRpc("web_read", () => expect.step("web_read"));
    await mountView({
        type: "form",
        resModel: "partner",
        resId: 1,
        resIds: [1, 2],
        arch: `<form><field name="name"/></form>`,
    });
    await waitForChannels([CHANNEL]);
    expect.verifySteps(["web_read"]);
}

test("list reloads once for a burst of events", async () => {
    await mountList();
    pushRecordEvent({written: [1]});
    pushRecordEvent({written: [2]});
    pushRecordEvent({created: [3]});
    await settle(DEBOUNCE_MS);
    expect.verifySteps(["web_search_read"]);
});

test("list ignores events of other models", async () => {
    await mountList();
    pushRecordEvent({model: "res.users", written: [1]});
    await settle(DEBOUNCE_MS);
    expect.verifySteps([]);
});

test("list reloads are spaced by the minimum interval", async () => {
    await mountList();
    pushRecordEvent({written: [1]});
    await settle(DEBOUNCE_MS);
    expect.verifySteps(["web_search_read"]);

    pushRecordEvent({written: [2]});
    await settle(DEBOUNCE_MS);
    expect.verifySteps([]);
    await settle(DEFAULT_MIN_INTERVAL_MS);
    expect.verifySteps(["web_search_read"]);
});

test("list waits while records are selected", async () => {
    await mountList();
    await contains(".o_data_row:eq(0) .o_list_record_selector input").click();
    pushRecordEvent({written: [2]});
    await settle(DEBOUNCE_MS);
    expect.verifySteps([]);

    await contains(".o_data_row:eq(0) .o_list_record_selector input").click();
    await settle(BUSY_RETRY_MS);
    expect.verifySteps(["web_search_read"]);
});

test("form reloads only for the record it shows, across the pager", async () => {
    await mountForm();
    pushRecordEvent({written: [2]});
    await settle(DEBOUNCE_MS);
    expect.verifySteps([]);

    await contains(".o_pager_next").click();
    expect.verifySteps(["web_read"]);

    pushRecordEvent({written: [2]});
    await settle(DEBOUNCE_MS);
    expect.verifySteps(["web_read"]);
});

test("form with unsaved changes warns instead of reloading", async () => {
    await mountForm();
    await contains(".o_field_widget[name=name] input").edit("Edited", {confirm: false});
    pushRecordEvent({written: [1]});
    await settle(DEBOUNCE_MS);
    expect.verifySteps([]);
    expect(".o_notification").toHaveCount(1);
});

async function mountKanban() {
    await mountView({
        type: "kanban",
        resModel: "partner",
        arch: `<kanban><templates><t t-name="card"><field name="name"/></t></templates></kanban>`,
    });
    await waitForChannels([CHANNEL]);
}

test("form marks the field another user changed, then clears it", async () => {
    await mountForm();
    MockServer.env.partner.write([1], {name: "Changed elsewhere"});
    pushRecordEvent({written: [1]});
    await settle(DEBOUNCE_MS);
    expect.verifySteps(["web_read"]);
    expect(".o_field_widget[name=name]").toHaveClass(CHANGED_CLASS);

    await settle(HIGHLIGHT_MS);
    expect(".o_field_widget[name=name]").not.toHaveClass(CHANGED_CLASS);
});

test("form marks nothing when the shown values did not change", async () => {
    await mountForm();
    pushRecordEvent({written: [1]});
    await settle(DEBOUNCE_MS);
    expect.verifySteps(["web_read"]);
    expect(`.${CHANGED_CLASS}`).toHaveCount(0);
});

test("list marks only the changed cell", async () => {
    await mountList();
    MockServer.env.partner.write([2], {name: "Changed elsewhere"});
    pushRecordEvent({written: [1, 2]});
    await settle(DEBOUNCE_MS);
    expect.verifySteps(["web_search_read"]);
    expect(`.${CHANGED_CLASS}`).toHaveCount(1);
    expect(".o_data_row:eq(1) .o_data_cell[name=name]").toHaveClass(CHANGED_CLASS);
});

test("list marks a row created elsewhere", async () => {
    await mountList();
    const [id] = MockServer.env.partner.create([{name: "Third"}]);
    pushRecordEvent({created: [id]});
    await settle(DEBOUNCE_MS);
    expect.verifySteps(["web_search_read"]);
    expect(".o_data_row:eq(2) .o_data_cell[name=name]").toHaveClass(CHANGED_CLASS);
});

test("list marks a row that a change elsewhere brought into the view", async () => {
    await mountView({
        type: "list",
        resModel: "partner",
        domain: [["name", "ilike", "elsewhere"]],
        arch: `<list><field name="name"/></list>`,
    });
    await waitForChannels([CHANNEL]);
    expect(".o_data_row").toHaveCount(0);

    MockServer.env.partner.write([2], {name: "Renamed elsewhere"});
    pushRecordEvent({written: [2]});
    await settle(DEBOUNCE_MS);
    expect(".o_data_row").toHaveCount(1);
    expect(".o_data_row .o_data_cell[name=name]").toHaveClass(CHANGED_CLASS);
});

test("list marks nothing when too many records changed at once", async () => {
    await mountList();
    const ids = MockServer.env.partner.create(
        Array.from({length: MAX_HIGHLIGHTED_RECORDS + 1}, (_, i) => ({
            name: `New ${i}`,
        }))
    );
    pushRecordEvent({created: ids});
    await settle(DEBOUNCE_MS);
    expect.verifySteps(["web_search_read"]);
    expect(`.${CHANGED_CLASS}`).toHaveCount(0);
});

test("kanban marks the card another user changed", async () => {
    await mountKanban();
    MockServer.env.partner.write([1], {name: "Changed elsewhere"});
    pushRecordEvent({written: [1]});
    await settle(DEBOUNCE_MS);
    expect(`.o_kanban_record.${CHANGED_CLASS}`).toHaveCount(1);
    expect(".o_kanban_record:eq(0)").toHaveClass(CHANGED_CLASS);
});

/**
 * A view button reloads the view with ``model.load()`` and enables the view's
 * buttons only once that load settles. A refresh from the bus that starts in
 * between drops the button's load, and the buttons stay disabled.
 */
async function clickButtonWithSlowReload(rpcName, buttonSelector) {
    let heldRead = null;
    onRpc(rpcName, async () => {
        expect.step(rpcName);
        await heldRead;
    });
    onRpc("/web/dataset/call_button/*", () => false);
    return {
        async click() {
            heldRead = new Deferred();
            await contains(buttonSelector).click();
            await animationFrame();
            expect.verifySteps([rpcName]);
            expect(buttonSelector).toHaveAttribute("disabled");
        },
        release() {
            heldRead.resolve();
            heldRead = null;
        },
    };
}

test("list refresh waits for a row button's reload", async () => {
    const button = await clickButtonWithSlowReload(
        "web_search_read",
        ".o_data_row:eq(0) button[name=do_it]"
    );
    await mountView({
        type: "list",
        resModel: "partner",
        arch: `<list><field name="name"/><button name="do_it" type="object" string="Do"/></list>`,
    });
    await waitForChannels([CHANNEL]);
    expect.verifySteps(["web_search_read"]);

    await button.click();
    pushRecordEvent({written: [1]});
    await settle(DEBOUNCE_MS);
    expect.verifySteps([]);

    button.release();
    await animationFrame();
    expect(".o_data_row:eq(0) button[name=do_it]").not.toHaveAttribute("disabled");
    await settle(DEBOUNCE_MS);
    expect.verifySteps(["web_search_read"]);
});

test("form refresh waits for a header button's reload", async () => {
    const button = await clickButtonWithSlowReload(
        "web_read",
        ".o_form_statusbar button[name=do_it]"
    );
    await mountView({
        type: "form",
        resModel: "partner",
        resId: 1,
        arch: `<form><header><button name="do_it" type="object" string="Do"/></header><field name="name"/></form>`,
    });
    await waitForChannels([CHANNEL]);
    expect.verifySteps(["web_read"]);

    await button.click();
    pushRecordEvent({written: [1]});
    await settle(DEBOUNCE_MS);
    expect.verifySteps([]);
    expect(".o_notification").toHaveCount(0);

    button.release();
    await animationFrame();
    expect(".o_form_statusbar button[name=do_it]").not.toHaveAttribute("disabled");
    expect(".o_form_button_save").not.toHaveAttribute("disabled");
    await settle(DEBOUNCE_MS);
    expect.verifySteps(["web_read"]);
});

test("a tab skips the events only it caused", async () => {
    await mountList();
    pushRecordEvent({written: [1], origins: [TAB_TOKEN]});
    await settle(DEBOUNCE_MS);
    expect.verifySteps([]);

    pushRecordEvent({written: [1], origins: ["", TAB_TOKEN]});
    await settle(DEBOUNCE_MS);
    expect.verifySteps(["web_search_read"]);
});

test("requests carry the tab token", async () => {
    onRpc("web_save", ({kwargs}) => {
        expect.step(kwargs.context[TOKEN_CONTEXT_KEY] === TAB_TOKEN);
    });
    await mountForm();
    await contains(".o_field_widget[name=name] input").edit("Saved");
    await contains(".o_form_button_save").click();
    expect.verifySteps([true]);
});

test("form waits without committing what the user is typing", async () => {
    await mountView({
        type: "form",
        resModel: "partner",
        resId: 1,
        arch: `<form><field name="name"/><field name="note"/></form>`,
    });
    await waitForChannels([CHANNEL]);
    expect.verifySteps([]);

    await contains(".o_field_widget[name=note] input").edit("Half", {confirm: false});
    pushRecordEvent({written: [1]});
    await settle(DEBOUNCE_MS);
    await settle(BUSY_RETRY_MS);
    expect.verifySteps([]);
    expect(".o_notification").toHaveCount(1);
    expect(".o_field_widget[name=note] input").toHaveValue("Half");
});

test("form tells the user when a large change deleted its record", async () => {
    await mountForm();
    MockServer.env.partner.unlink([1]);
    pushRecordEvent({reload: true});
    await settle(DEBOUNCE_MS);
    expect.verifySteps([]);
    expect(".o_notification:contains(deleted by someone else)").toHaveCount(1);
});

test("a channel dropped before it was added ends up deleted", async () => {
    await makeMockEnv();
    const recordEvents = getService("bus_record_event_service");
    recordEvents.subscribe("partner", () => expect.step("partner event"))();
    recordEvents.subscribe("res.users", () => expect.step("users event"));
    await waitForChannels(["record_events:res.users"]);
    await waitForChannels([CHANNEL], {operation: "delete"});
});

test("pivot shows new rows and keeps the measures the user picked", async () => {
    await mountView({
        type: "pivot",
        resModel: "partner",
        context: {pivot_measures: ["__count"]},
        arch: `<pivot><field name="name" type="row"/></pivot>`,
    });
    await waitForChannels([CHANNEL]);
    expect(".o_pivot table tbody tr").toHaveCount(3);
    await contains(".o_pivot_buttons button.dropdown-toggle").click();
    await contains(".dropdown-item:contains(Age)").click();
    expect(".o_pivot_measure_row").toHaveCount(2);

    MockServer.env.partner.create([{name: "Third", age: 50}]);
    pushRecordEvent({created: [3]});
    await settle(DEBOUNCE_MS);
    expect(".o_pivot table tbody tr").toHaveCount(4);
    expect(".o_pivot_measure_row").toHaveCount(2);
});

test("graph shows new data and keeps the mode the user picked", async () => {
    const view = await mountView({
        type: "graph",
        resModel: "partner",
        context: {graph_mode: "bar"},
        arch: `<graph><field name="name"/></graph>`,
    });
    await waitForChannels([CHANNEL]);
    checkLabels(view, ["First", "Second"]);
    await selectMode("pie");

    MockServer.env.partner.create([{name: "Third"}]);
    pushRecordEvent({created: [3]});
    await settle(DEBOUNCE_MS);
    checkLabels(view, ["First", "Second", "Third"]);
    expect(getModeButton("pie")).toHaveClass("active");
});
