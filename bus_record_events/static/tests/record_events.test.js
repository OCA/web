import {
    BUSY_RETRY_MS,
    DEBOUNCE_MS,
    DEFAULT_MIN_INTERVAL_MS,
} from "@bus_record_events/hooks/use_record_stream.esm";
import {advanceTime, animationFrame} from "@odoo/hoot-mock";
import {
    contains,
    defineModels,
    fields,
    models,
    mountView,
    onRpc,
} from "@web/../tests/web_test_helpers";
import {defineBusModels, waitForChannels} from "@bus/../tests/bus_test_helpers";
import {describe, expect, test} from "@odoo/hoot";
import {getWebSocketWorker} from "@bus/../tests/mock_websocket";

describe.current.tags("desktop");

class Partner extends models.Model {
    name = fields.Char();
    _records = [
        {id: 1, name: "First"},
        {id: 2, name: "Second"},
    ];
}

defineBusModels();
defineModels([Partner]);

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
