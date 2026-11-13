/** @odoo-module **/

import {describe, expect, test} from "@odoo/hoot";
import {validateLink} from "@web_timeline_gantt_ux/dependency_edit/dependency_link_dragger.esm";

const RECORDS = {
    1: {id: 1, display_name: "A", depend_on_ids: [], allow: true},
    2: {id: 2, display_name: "B", depend_on_ids: [1], allow: true},
    3: {id: 3, display_name: "C", depend_on_ids: [], allow: false},
};

function validate(predecessorId, successorId, extra = {}) {
    return validateLink({
        predecessorId,
        successorId,
        getRecord: (id) => RECORDS[id],
        depField: "depend_on_ids",
        canLink: (rec) => rec.allow,
        isPending: () => false,
        ...extra,
    });
}

describe("web_timeline_gantt_ux link validation", () => {
    test("valid link passes", () => {
        expect(validate(2, 1)).toBe(null);
    });

    test("self-link rejected", () => {
        expect(validate(1, 1)).toInclude("cannot depend on itself");
    });

    test("unknown record rejected", () => {
        expect(validate(1, 99)).toInclude("Unknown task");
    });

    test("feature-gated record rejected", () => {
        expect(validate(1, 3)).toInclude("disabled");
        expect(validate(3, 1)).toInclude("disabled");
    });

    test("duplicate link rejected", () => {
        // B is already blocked by A.
        expect(validate(1, 2)).toInclude("already blocked by");
    });

    test("reverse duplicate rejected", () => {
        // A -> B exists; linking B as blocked-by would conflict.
        expect(validate(2, 1, {getRecord: (id) => RECORDS[id]})).toBe(null);
        const records = {
            1: {id: 1, display_name: "A", depend_on_ids: [2], allow: true},
            2: {id: 2, display_name: "B", depend_on_ids: [], allow: true},
        };
        expect(
            validateLink({
                predecessorId: 1,
                successorId: 2,
                getRecord: (id) => records[id],
                depField: "depend_on_ids",
            })
        ).toInclude("reverse link");
    });

    test("in-flight pair locked", () => {
        expect(validate(2, 1, {isPending: () => true})).toInclude(
            "already being saved"
        );
    });
});
