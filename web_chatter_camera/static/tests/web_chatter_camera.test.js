import {
    contains,
    defineMailModels,
    inputFiles,
    insertText,
    openFormView,
    start,
    startServer,
} from "@mail/../tests/mail_test_helpers";
import {describe, expect, mockUserAgent, test} from "@odoo/hoot";

describe.current.tags("desktop");
defineMailModels();

test("camera button uploads the picture as an attachment on mobile", async () => {
    mockUserAgent("android");
    const pyEnv = await startServer();
    const partnerId = pyEnv["res.partner"].create({name: "Camera Partner"});
    await start();
    await openFormView("res.partner", partnerId);
    await contains(".o-mail-Chatter-camera");
    await inputFiles(".o-mail-Chatter-cameraInput", [
        new File(["image"], "photo.jpg", {type: "image/jpeg"}),
    ]);
    await contains(".o-mail-AttachmentImage, .o-mail-AttachmentCard");
    expect(
        pyEnv["ir.attachment"].search_read([["res_id", "=", partnerId]])
    ).toHaveLength(1);
});

test("camera button saves a new record before uploading", async () => {
    mockUserAgent("android");
    const pyEnv = await startServer();
    await start();
    await openFormView("res.partner", undefined, {
        arch: `
            <form>
                <sheet><field name="name"/></sheet>
                <chatter/>
            </form>`,
    });
    await insertText(".o_field_widget[name=name] input", "New Partner");
    await contains(".o-mail-Chatter-camera");
    await inputFiles(".o-mail-Chatter-cameraInput", [
        new File(["image"], "photo.jpg", {type: "image/jpeg"}),
    ]);
    await contains(".o-mail-AttachmentImage, .o-mail-AttachmentCard");
    expect(pyEnv["res.partner"].search([["name", "=", "New Partner"]])).toHaveLength(1);
});
