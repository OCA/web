import {expect, test} from "@odoo/hoot";
import {
    contains,
    defineModels,
    fields,
    models,
    mountView,
    toggleActionMenu,
    toggleMenuItem,
} from "@web/../tests/web_test_helpers";

class Partner extends models.Model {
    name = fields.Char({translate: true});
    _records = [
        {
            id: 1,
            name: "first record",
        },
    ];
}

defineModels([Partner]);

test("Accept popup confirmation on duplicate", async () => {
    await mountView({
        resModel: "partner",
        type: "form",
        arch: "<form><field name='name'/></form>",
        actionMenus: {},
        resId: 1,
    });
    await toggleActionMenu();
    await toggleMenuItem("Duplicate");
    expect(".modal-dialog").toHaveCount(1);
    expect(".modal .modal-title").toHaveText("Duplicate");
    expect(".modal .modal-body").toHaveText(
        "Are you sure that you would like to copy this record?"
    );
    expect(".modal .btn-primary").toHaveText("Ok");
    expect(".modal .btn-secondary").toHaveText("Cancel");

    expect(".o_breadcrumb").toHaveText("first record");
    await contains(".modal .btn-primary").click();
    expect(".modal-dialog").toHaveCount(0);
    expect(".o_breadcrumb").toHaveText("first record (copy)");
});

test("Cancel popup confirmation on duplicate", async () => {
    await mountView({
        resModel: "partner",
        type: "form",
        arch: "<form><field name='name'/></form>",
        actionMenus: {},
        resId: 1,
    });
    await toggleActionMenu();
    await toggleMenuItem("Duplicate");
    expect(".modal-dialog").toHaveCount(1);
    expect(".modal .modal-title").toHaveText("Duplicate");
    expect(".modal .modal-body").toHaveText(
        "Are you sure that you would like to copy this record?"
    );
    expect(".modal .btn-primary").toHaveText("Ok");
    expect(".modal .btn-secondary").toHaveText("Cancel");

    // Discard changes don't trigger Duplicate action
    expect(".o_breadcrumb").toHaveText("first record");
    await contains(".modal .btn-secondary").click();
    expect(".modal-dialog").toHaveCount(0);
    expect(".o_breadcrumb").toHaveText("first record");
});
