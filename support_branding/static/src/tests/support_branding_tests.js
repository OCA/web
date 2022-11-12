odoo.define("support_branding.crash_manager_tests", function (require) {
    "use strict";

    /* global QUnit*/

    const CrashManager = require("web.CrashManager").CrashManager;
    const testUtils = require("web.test_utils");
    const createActionManager = testUtils.createActionManager;

    QUnit.module("support_branding", {}, function () {
        QUnit.test("Error Dialog is created", async function (assert) {
            // No of assertion expected.
            assert.expect(5);

            // Create action manager to trigger error dialog
            var actionManager = await createActionManager({
                services: {
                    crash_manager: CrashManager,
                },
            });

            // Check if action with crash manager service was created.
            assert.notOk(
                _.isEmpty(actionManager),
                "Action manager with " +
                    "crash manager service should be created and not empty"
            );

            // Test custom error
            const error = {
                type: "Support Branding Odoo Client Error",
                message: "Message",
                data: {
                    debug: "Traceback",
                },
            };
            // NB: This will use the saved res.config settings of support
            // branding containing the support mail. It is fetched in crash
            // manager init function as saved in res.config settings.
            // attached is a default data xml with sample data.
            actionManager.call("crash_manager", "show_error", error);
            await testUtils.nextTick();
            var $mail_dialog = "form.support-branding-submit-form";

            // Confirm if we have a form and its required elements.
            assert.containsOnce(
                $,
                $mail_dialog,
                "Error dialog should be opened and showing mail section on footer"
            );
            assert.containsOnce(
                $,
                ".support-desc",
                "We should have a textarea to add our issues"
            );
            assert.containsOnce(
                $,
                "button.support-btn",
                "We should have a send mail button to send support mail"
            );

            // Add a test text mail.
            $(".support-desc").val(
                "Send this as a test mail to configured support mail"
            );

            // Try to send mail, by default a popup will be triggered
            // defaulting to form call of 'mailto'.
            await testUtils.dom.click($("button.support-btn"), {allowInvisible: true});

            // Close error dialog
            await testUtils.dom.click($("button.close"), {allowInvisible: true});

            // Confirm dialog was closed
            assert.containsNone($, $mail_dialog, "Error Dialog should be closed");

            actionManager.destroy();
        });
    });
});
