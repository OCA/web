import {beforeEach, describe, expect, test} from "@odoo/hoot";
import {DayPilotArchParser} from "@web_daypilot/daypilot_arch_parser.esm";

describe("DayPilotArchParser", () => {
    let parser = null;

    beforeEach(() => {
        parser = new DayPilotArchParser();
    });

    test("parses basic daypilot arch", () => {
        const arch = `
            <daypilot date_start="start" date_stop="stop">
                <field name="name"/>
            </daypilot>
        `;
        const xmlDoc = new DOMParser().parseFromString(arch, "text/xml");
        const result = parser.parse(xmlDoc.documentElement);

        expect(result.dateStartField).toBe("start");
        expect(result.dateStopField).toBe("stop");
    });

    test("parses optional attributes", () => {
        const arch = `
            <daypilot
                date_start="start"
                date_stop="stop"
                default_scale="week"
                time_slot_duration="30"
                business_hours_start="9"
                business_hours_end="17"
                business_hours_only="true"
            >
                <field name="name"/>
            </daypilot>
        `;
        const xmlDoc = new DOMParser().parseFromString(arch, "text/xml");
        const result = parser.parse(xmlDoc.documentElement);

        expect(result.scale).toBe("Week");
        expect(result.timeSlotDuration).toBe(30);
        expect(result.businessHoursStart).toBe(9);
        expect(result.businessHoursEnd).toBe(17);
        expect(result.businessHoursOnly).toBe(true);
    });

    test("parses default values for optional attributes", () => {
        const arch = `
            <daypilot date_start="start" date_stop="stop">
                <field name="name"/>
            </daypilot>
        `;
        const xmlDoc = new DOMParser().parseFromString(arch, "text/xml");
        const result = parser.parse(xmlDoc.documentElement);

        expect(result.scale).toBe("CellDuration");
        expect(result.timeSlotDuration).toBe(60);
        expect(result.businessHoursStart).toBe(8);
        expect(result.businessHoursEnd).toBe(18);
        expect(result.businessHoursOnly).toBe(true);
    });

    test("parses field names", () => {
        const arch = `
            <daypilot date_start="start" date_stop="stop">
                <field name="name"/>
                <field name="user_id"/>
                <field name="appointment_type_id"/>
            </daypilot>
        `;
        const xmlDoc = new DOMParser().parseFromString(arch, "text/xml");
        const result = parser.parse(xmlDoc.documentElement);

        expect(result.fieldNames).toContain("name");
        expect(result.fieldNames).toContain("user_id");
        expect(result.fieldNames).toContain("appointment_type_id");
    });

    test("parses resource attribute", () => {
        const arch = `
            <daypilot date_start="start" date_stop="stop" resource="user_id">
                <field name="name"/>
            </daypilot>
        `;
        const xmlDoc = new DOMParser().parseFromString(arch, "text/xml");
        const result = parser.parse(xmlDoc.documentElement);

        expect(result.resource).toBe("user_id");
    });

    test("resource defaults to null when not specified", () => {
        const arch = `
            <daypilot date_start="start" date_stop="stop">
                <field name="name"/>
            </daypilot>
        `;
        const xmlDoc = new DOMParser().parseFromString(arch, "text/xml");
        const result = parser.parse(xmlDoc.documentElement);

        expect(result.resource).toBeNull();
    });
});
