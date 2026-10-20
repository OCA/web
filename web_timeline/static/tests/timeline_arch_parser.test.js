import {beforeEach, describe, expect, test} from "@odoo/hoot";
import {
    TimelineArchParser,
    TimelineParseArchError,
} from "@web_timeline/views/timeline/timeline_arch_parser.esm";
import {allowTranslations} from "@web/../tests/web_test_helpers";
import {parseXML} from "@web/core/utils/xml";

describe.current.tags("headless");

// Error messages are translated strings
beforeEach(() => allowTranslations());

const FAKE_ORDER_FIELDS = {
    display_name: {string: "Display Name", type: "char"},
    date_start: {string: "Date start", type: "date"},
    date_end: {string: "Date end", type: "date"},
    partner_id: {string: "Partner", type: "many2one", relation: "partner"},
};

function parseArch(arch) {
    const parser = new TimelineArchParser();
    return parser.parse(parseXML(arch), FAKE_ORDER_FIELDS);
}

function check(paramName, paramValue, expectedName, expectedValue) {
    const arch = `<timeline date_start="start_date" default_group_by="partner_id" ${paramName}="${paramValue}" />`;
    expect(parseArch(arch)[expectedName]).toBe(expectedValue);
}

test("throw if date_start is not set", () => {
    expect(() => parseArch(`<timeline default_group_by="partner_id"/>`)).toThrow(
        TimelineParseArchError
    );
});

test("throw if default_group_by is not set", () => {
    expect(() => parseArch(`<timeline date_start="date_start"/>`)).toThrow(
        TimelineParseArchError
    );
});

test("hasEditDialog", () => {
    check("event_open_popup", "", "open_popup_action", false);
    check("event_open_popup", "true", "open_popup_action", true);
    check("event_open_popup", "True", "open_popup_action", true);
    check("event_open_popup", "1", "open_popup_action", true);
    check("event_open_popup", "false", "open_popup_action", false);
    check("event_open_popup", "False", "open_popup_action", false);
    check("event_open_popup", "0", "open_popup_action", false);
});

for (const [attr, key] of [
    ["create", "canCreate"],
    ["edit", "canUpdate"],
    ["delete", "canDelete"],
]) {
    test(attr, () => {
        check(attr, "", key, true);
        check(attr, "true", key, true);
        check(attr, "True", key, true);
        check(attr, "1", key, true);
        check(attr, "false", key, false);
        check(attr, "False", key, false);
        check(attr, "0", key, false);
        check(attr, "12", key, true);
    });
}

test("mode", () => {
    check("mode", "day", "mode", "day");
    check("mode", "week", "mode", "week");
    check("mode", "month", "mode", "month");
    expect(() =>
        parseArch(
            `<timeline date_start="start_date" default_group_by="partner_id" mode="other" />`
        )
    ).toThrow(TimelineParseArchError);
    expect(() =>
        parseArch(
            `<timeline date_start="start_date" default_group_by="partner_id" mode="" />`
        )
    ).toThrow(TimelineParseArchError);
});

test("colors", () => {
    const archInfo = parseArch(`
        <timeline date_start="start_date" default_group_by="partner_id" colors="gray: state == 'cancel'; #ec7063: state == 'done'"/>
    `);
    expect(archInfo.colors).toHaveLength(2);
    expect(archInfo.colors[0].field).toBe("state");
    expect(archInfo.colors[0].color).toBe("gray");
    expect(archInfo.colors[0].ast.left.value).toBe("state");
    expect(archInfo.colors[0].ast.op).toBe("==");
    expect(archInfo.colors[0].ast.right.value).toBe("cancel");
    expect(archInfo.fieldNames).toInclude("state");
});

test("templates", () => {
    const archInfo = parseArch(`
        <timeline date_start="start_date" default_group_by="partner_id">
            <field name="other_field" />
            <templates>
                <t t-name="timeline-item">
                    <span t-out="record.other_field" />
                </t>
            </templates>
        </timeline>
    `);
    expect(Object.keys(archInfo.templateDocs)).toEqual(["timeline-item"]);
    expect(archInfo.fieldNames).toInclude("other_field");
});
