import {
    TimelineArchParser,
    TimelineParseArchError,
} from "@web_timeline/views/timeline/timeline_arch_parser.esm";
import {FAKE_ORDER_FIELDS} from "./helpers.esm";
import {parseXML} from "@web/core/utils/xml";

function parseArch(arch) {
    const parser = new TimelineArchParser();
    const xmlDoc = parseXML(arch);
    return parser.parse(xmlDoc, FAKE_ORDER_FIELDS);
}

function check(assert, paramName, paramValue, expectedName, expectedValue) {
    const arch = `<timeline date_start="start_date" default_group_by="partner_id" ${paramName}="${paramValue}" />`;
    const data = parseArch(arch);
    assert.strictEqual(data[expectedName], expectedValue);
}

QUnit.module("TimelineView - ArchParser");

QUnit.test("throw if date_start is not set", (assert) => {
    assert.throws(
        () => parseArch(`<timeline default_group_by="partner_id"/>`),
        TimelineParseArchError
    );
});

QUnit.test("throw if default_group_by is not set", (assert) => {
    assert.throws(
        () => parseArch(`<timeline date_start="date_start"/>`),
        TimelineParseArchError
    );
});

QUnit.test("hasEditDialog", (assert) => {
    check(assert, "event_open_popup", "", "open_popup_action", false);
    check(assert, "event_open_popup", "true", "open_popup_action", true);
    check(assert, "event_open_popup", "True", "open_popup_action", true);
    check(assert, "event_open_popup", "1", "open_popup_action", true);
    check(assert, "event_open_popup", "false", "open_popup_action", false);
    check(assert, "event_open_popup", "False", "open_popup_action", false);
    check(assert, "event_open_popup", "0", "open_popup_action", false);
});

QUnit.test("create", (assert) => {
    check(assert, "create", "", "canCreate", true);
    check(assert, "create", "true", "canCreate", true);
    check(assert, "create", "True", "canCreate", true);
    check(assert, "create", "1", "canCreate", true);
    check(assert, "create", "false", "canCreate", false);
    check(assert, "create", "False", "canCreate", false);
    check(assert, "create", "0", "canCreate", false);
    check(assert, "create", "12", "canCreate", true);
});

QUnit.test("edit", (assert) => {
    check(assert, "edit", "", "canUpdate", true);
    check(assert, "edit", "true", "canUpdate", true);
    check(assert, "edit", "True", "canUpdate", true);
    check(assert, "edit", "1", "canUpdate", true);
    check(assert, "edit", "false", "canUpdate", false);
    check(assert, "edit", "False", "canUpdate", false);
    check(assert, "edit", "0", "canUpdate", false);
    check(assert, "edit", "12", "canUpdate", true);
});

QUnit.test("delete", (assert) => {
    check(assert, "delete", "", "canDelete", true);
    check(assert, "delete", "true", "canDelete", true);
    check(assert, "delete", "True", "canDelete", true);
    check(assert, "delete", "1", "canDelete", true);
    check(assert, "delete", "false", "canDelete", false);
    check(assert, "delete", "False", "canDelete", false);
    check(assert, "delete", "0", "canDelete", false);
    check(assert, "delete", "12", "canDelete", true);
});

QUnit.test("mode", (assert) => {
    check(assert, "mode", "day", "mode", "day");
    check(assert, "mode", "week", "mode", "week");
    check(assert, "mode", "month", "mode", "month");
    assert.throws(() => {
        parseArch(
            `<timeline date_start="start_date" default_group_by="partner_id" mode="other" />`
        );
    }, TimelineParseArchError);

    assert.throws(() => {
        parseArch(
            `<timeline date_start="start_date" default_group_by="partner_id" mode="" />`
        );
    }, TimelineParseArchError);
});

QUnit.test("colors", (assert) => {
    const archInfo = parseArch(`
            <timeline date_start="start_date" default_group_by="partner_id" colors="gray: state == 'cancel'; #ec7063: state == 'done'"/>
        `);
    assert.strictEqual(archInfo.colors.length, 2, "colors should be 2");
    assert.strictEqual(archInfo.colors[0].field, "state", "field should be state");
    assert.strictEqual(archInfo.colors[0].color, "gray", "color should be gray");
    assert.strictEqual(
        archInfo.colors[0].ast.left.value,
        "state",
        "ast left value should be state"
    );
    assert.strictEqual(archInfo.colors[0].ast.op, "==", "ast op value should be '=='");
    assert.strictEqual(
        archInfo.colors[0].ast.right.value,
        "cancel",
        "ast right value should be cancel"
    );
    assert.ok(
        archInfo.fieldNames.includes("state"),
        "fieldNames should include field state"
    );
});

QUnit.test("templates", (assert) => {
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
    assert.ok(
        archInfo.templateDocs.hasOwnProperty("timeline-item"),
        "template name should be timeline-item"
    );
    assert.ok(
        archInfo.fieldNames.includes("other_field"),
        "fieldNames should include field other_field"
    );
});
