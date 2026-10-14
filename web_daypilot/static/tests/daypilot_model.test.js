import {beforeEach, describe, expect, test} from "@odoo/hoot";
import {DayPilotModel} from "@web_daypilot/daypilot_model.esm";

describe("DayPilotModel", () => {
    let model = null;
    let mockServices = null;

    beforeEach(() => {
        mockServices = {
            notification: {
                // eslint-disable-next-line no-empty-function -- add is intentionally empty as a mock method
                add: () => {},
            },
            orm: {
                searchRead: () => Promise.resolve([]),
                call: () =>
                    Promise.resolve({
                        length: 0,
                        records: [],
                        resources: [],
                    }),
                write: () => Promise.resolve(true),
            },
        };

        const params = {
            metaData: {
                dateStartField: "start",
                dateStopField: "stop",
                resource: "user_id",
                fields: {
                    start: {type: "datetime"},
                    stop: {type: "datetime"},
                    user_id: {type: "many2one"},
                    name: {type: "char"},
                },
                resModel: "calendar.event",
                domain: [],
                defaultScale: "day",
                timeSlotDuration: 20,
                businessHoursStart: 8,
                businessHoursEnd: 20,
                businessHoursOnly: false,
            },
        };

        model = new DayPilotModel(params, mockServices);
        model.env = {
            config: {
                context: {},
            },
        };
    });

    test("initializes with correct properties", () => {
        expect(model.metaData.dateStartField).toBe("start");
        expect(model.metaData.dateStopField).toBe("stop");
        expect(model.metaData.resource).toBe("user_id");
        expect(model.data).toEqual({});
    });

    test("loads data from server method", async () => {
        const mockRecords = [
            {
                id: 1,
                start: "2026-06-27 10:00:00",
                stop: "2026-06-27 11:00:00",
                user_id: [1, "Staff 1"],
                name: "Appointment 1",
            },
        ];

        mockServices.orm.call = () =>
            Promise.resolve({
                length: 1,
                records: mockRecords,
                resources: [{id: 1, name: "Staff 1"}],
            });

        await model.load({domain: []});

        expect(model.data.resources).toHaveLength(1);
        expect(model.data.events).toHaveLength(1);
    });

    test("generates resources from server data", () => {
        model.data = {
            resources: [
                {id: "1", name: "Staff 1"},
                {id: "2", name: "staff 2"},
            ],
        };

        const resources = model.resources;

        expect(resources).toHaveLength(2);
        expect(resources[0].id).toBe("1");
        expect(resources[0].name).toBe("Staff 1");
    });

    test("generates events from server data", () => {
        model.data = {
            events: [
                {
                    id: 1,
                    start: "2026-06-27T10:00:00.000Z",
                    end: "2026-06-27T11:00:00.000Z",
                    text: "Appointment 1",
                    resource: "1",
                },
            ],
        };

        const events = model.events;

        expect(events).toHaveLength(1);
        expect(events[0].id).toBe(1);
        expect(events[0].text).toBe("Appointment 1");
        expect(events[0].resource).toBe("1");
    });

    test("reschedule event via server", async () => {
        mockServices.orm.write = () => Promise.resolve(true);
        mockServices.orm.call = () =>
            Promise.resolve({
                length: 0,
                records: [],
                resources: [],
            });

        await model.reschedule(1, {
            start: "2026-06-27 12:00:00",
            stop: "2026-06-27 13:00:00",
        });

        expect(mockServices.orm.write).toHaveBeenCalledWith(
            "calendar.event",
            [1],
            expect.objectContaining({
                start: "2026-06-27 12:00:00",
                stop: "2026-06-27 13:00:00",
            })
        );
    });

    test("generates dialog context with start and stop", () => {
        const context = model.getDialogContext({
            resource: "1",
            start: "2026-06-27 10:00:00",
            stop: "2026-06-27 11:00:00",
        });

        expect(context.default_start).toBe("2026-06-27 10:00:00");
        expect(context.default_stop).toBe("2026-06-27 11:00:00");
        expect(context.default_user_id).toBe(1);
    });

    test("initial day range focuses today, not tomorrow", async () => {
        // Without context dates the day range must focus on today: the header
        // displays focusDate, which used to be startDate + one range (tomorrow).
        model.metaData.defaultRange = "day";
        const metaData = model._getInitialRangeParams({
            context: {},
        });

        const today = luxon.DateTime.local().startOf("day");
        expect(metaData.focusDate.toISODate()).toBe(today.toISODate());
        expect(metaData.startDate.toISODate()).toBe(today.toISODate());
    });

    test("initial range focuses the context start date", async () => {
        model.metaData.defaultRange = "day";
        const metaData = model._getInitialRangeParams({
            context: {default_start_date: "2026-09-15"},
        });

        expect(metaData.focusDate.toISODate()).toBe("2026-09-15");
        expect(metaData.startDate.toISODate()).toBe("2026-09-15");
    });
});
