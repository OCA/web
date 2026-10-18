import "@web_calendar_slot_duration/js/calendar_common_renderer.esm";
import "@web_calendar_slot_duration/js/calendar_model.esm";

import {expect, test} from "@odoo/hoot";
import {mountWithCleanup, preloadBundle} from "@web/../tests/web_test_helpers";
import {CalendarCommonRenderer} from "@web/views/calendar/calendar_common/calendar_common_renderer";
import {CalendarModel} from "@web/views/calendar/calendar_model";
import {CallbackRecorder} from "@web/search/action_hook";
import {FAKE_MODEL} from "@web/../tests/views/calendar/calendar_test_helpers";

const {DateTime} = luxon;

function makeCalendarModel(calendarSlotDuration, startType = "datetime") {
    const model = Object.create(CalendarModel.prototype);
    model.env = {
        searchModel: {
            context: calendarSlotDuration
                ? {calendar_slot_duration: calendarSlotDuration}
                : {},
        },
    };
    model.meta = {
        fieldMapping: {
            date_start: "start",
            date_stop: "stop",
            all_day: "allday",
        },
        fields: {
            start: {type: startType},
            stop: {type: startType},
        },
    };
    return model;
}

async function mountRenderer(calendarSlotDuration) {
    await preloadBundle("web.fullcalendar_lib");
    return mountWithCleanup(CalendarCommonRenderer, {
        componentEnv: {
            searchModel: {
                context: calendarSlotDuration
                    ? {calendar_slot_duration: calendarSlotDuration}
                    : {},
            },
        },
        props: {
            model: FAKE_MODEL,
            initialDate: FAKE_MODEL.date,
            createRecord: () => null,
            deleteRecord: () => null,
            editRecord: () => null,
            callbackRecorder: new CallbackRecorder(),
            onSquareSelection: () => null,
            cleanSquareSelection: () => null,
        },
    });
}

function getElapsedMinutes(rawRecord, start) {
    return DateTime.fromSQL(rawRecord.stop, {zone: "UTC"}).diff(start, "minutes")
        .minutes;
}

test("calendar slot duration comes from the action context", async () => {
    const renderer = await mountRenderer("00:10:00");
    expect(renderer.options.slotDuration).toBe("00:10:00");
});

test("new timed events use the configured duration", () => {
    const start = DateTime.fromISO("2026-10-17T08:00:00", {zone: "UTC"});
    const rawRecord = makeCalendarModel("00:10:00").buildRawRecord({
        start,
        title: "Timed event",
        isAllDay: false,
    });

    expect(getElapsedMinutes(rawRecord, start)).toBe(10);
});

test("configured durations longer than one hour are calculated correctly", () => {
    const start = DateTime.fromISO("2026-10-17T08:00:00", {zone: "UTC"});
    const rawRecord = makeCalendarModel("01:30:00").buildRawRecord({
        start,
        title: "Long event",
        isAllDay: false,
    });

    expect(getElapsedMinutes(rawRecord, start)).toBe(90);
});

test("explicit and all-day event ends are preserved", () => {
    const model = makeCalendarModel("00:10:00");
    const start = DateTime.fromISO("2026-10-17T08:00:00", {zone: "UTC"});
    const explicitEnd = start.plus({hours: 2});
    const timedRecord = model.buildRawRecord({
        start,
        end: explicitEnd,
        title: "Explicit end",
        isAllDay: false,
    });
    const allDayRecord = makeCalendarModel("00:10:00", "date").buildRawRecord({
        start: DateTime.fromISO("2026-10-17", {zone: "UTC"}),
        title: "All-day event",
        isAllDay: true,
    });

    expect(getElapsedMinutes(timedRecord, start)).toBe(120);
    expect(allDayRecord.stop).toBe("2026-10-17");
});

test("events without a configured duration keep the standard one-hour default", () => {
    const start = DateTime.fromISO("2026-10-17T08:00:00", {zone: "UTC"});
    const rawRecord = makeCalendarModel().buildRawRecord({
        start,
        title: "Default event",
        isAllDay: false,
    });

    expect(getElapsedMinutes(rawRecord, start)).toBe(60);
});
