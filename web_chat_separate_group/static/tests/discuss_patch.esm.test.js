import "@web_chat_separate_group/discuss_patch.esm";

import {
    Command,
    defineModels,
    fields,
    serverState,
} from "@web/../tests/web_test_helpers";
import {
    click,
    contains,
    mailModels,
    openDiscuss,
    start,
    startServer,
} from "@mail/../tests/mail_test_helpers";
import {describe, expect, test} from "@odoo/hoot";
import {ResUsersSettings} from "@mail/../tests/mock_server/mock_models/res_users_settings";
import {queryAllTexts} from "@odoo/hoot-dom";

describe.current.tags("desktop");

// The base mocked res.users.settings does not declare the group-open flag,
// so the Groups category stays collapsed (and the RPC write rejects the
// unknown field). Replace the model with an extended version that declares
// it; methods are kept by extending the original class.
class ResUsersSettingsExt extends ResUsersSettings {
    is_discuss_sidebar_category_group_open = fields.Generic({default: true});
}
defineModels({...mailModels, ResUsersSettings: ResUsersSettingsExt});

test("Groups category is displayed in the discuss sidebar", async () => {
    // The Groups category is computed lazily when a group thread references
    // `store.discuss.groups`, so the test data has to include one.
    const pyEnv = await startServer();
    const partnerId = pyEnv["res.partner"].create({name: "Other"});
    pyEnv["discuss.channel"].create({
        name: "Trigger",
        channel_type: "group",
        channel_member_ids: [
            Command.create({partner_id: serverState.partnerId}),
            Command.create({partner_id: partnerId}),
        ],
    });
    await start();
    await openDiscuss();
    await contains(".o-mail-DiscussSidebarCategory-group");
});

test("Group channel is displayed under the Groups category", async () => {
    const pyEnv = await startServer();
    const partnerId = pyEnv["res.partner"].create({name: "Other User"});
    pyEnv["discuss.channel"].create({
        name: "Test Group",
        channel_type: "group",
        channel_member_ids: [
            Command.create({partner_id: serverState.partnerId}),
            Command.create({partner_id: partnerId}),
        ],
    });
    await start();
    await openDiscuss();
    await contains(
        ".o-mail-DiscussSidebarCategory-group + .o-mail-DiscussSidebarChannel-container",
        {text: "Test Group"}
    );
});

test("Direct chat is not displayed under the Groups category", async () => {
    const pyEnv = await startServer();
    const partnerId = pyEnv["res.partner"].create({name: "Demo User"});
    pyEnv["discuss.channel"].create({
        channel_type: "chat",
        channel_member_ids: [
            Command.create({partner_id: serverState.partnerId}),
            Command.create({partner_id: partnerId}),
        ],
    });
    await start();
    await openDiscuss();
    await contains(
        ".o-mail-DiscussSidebarCategory-chat + .o-mail-DiscussSidebarChannel-container",
        {text: "Demo User"}
    );
    await contains(
        ".o-mail-DiscussSidebarCategory-group + .o-mail-DiscussSidebarChannel-container",
        {count: 0}
    );
});

test("Channel is not displayed under the Groups category", async () => {
    const pyEnv = await startServer();
    pyEnv["discuss.channel"].create({
        name: "general",
        channel_type: "channel",
    });
    await start();
    await openDiscuss();
    await contains(
        ".o-mail-DiscussSidebarCategory-channel + .o-mail-DiscussSidebarChannel-container",
        {text: "general"}
    );
    await contains(
        ".o-mail-DiscussSidebarCategory-group + .o-mail-DiscussSidebarChannel-container",
        {count: 0}
    );
});

test("Quick search input is always visible in the sidebar", async () => {
    // Without the patch, the quick search only appears when more than 19
    // channels are pinned. The patch forces hasQuickSearch to always be true.
    const pyEnv = await startServer();
    pyEnv["discuss.channel"].create({
        name: "general",
        channel_type: "channel",
    });
    await start();
    await openDiscuss();
    await contains(".o-mail-DiscussSidebarQuickSearchInput");
});

test("Groups are sorted alphabetically by name", async () => {
    const pyEnv = await startServer();
    const otherId = pyEnv["res.partner"].create({name: "Other"});
    pyEnv["discuss.channel"].create([
        {
            name: "Zebra",
            channel_type: "group",
            channel_member_ids: [
                Command.create({partner_id: serverState.partnerId}),
                Command.create({partner_id: otherId}),
            ],
        },
        {
            name: "Alpha",
            channel_type: "group",
            channel_member_ids: [
                Command.create({partner_id: serverState.partnerId}),
                Command.create({partner_id: otherId}),
            ],
        },
        {
            name: "Mango",
            channel_type: "group",
            channel_member_ids: [
                Command.create({partner_id: serverState.partnerId}),
                Command.create({partner_id: otherId}),
            ],
        },
    ]);
    await start();
    await openDiscuss();
    await contains(".o-mail-DiscussSidebarChannel", {count: 3});
    const names = queryAllTexts(
        ".o-mail-DiscussSidebarCategory-group ~ .o-mail-DiscussSidebarChannel-container .o-mail-DiscussSidebarChannel"
    );
    expect(names).toEqual(["Alpha", "Mango", "Zebra"]);
});

test("Messaging menu exposes a Groups filter button", async () => {
    const pyEnv = await startServer();
    const partnerId = pyEnv["res.partner"].create({name: "Other"});
    pyEnv["discuss.channel"].create({
        name: "My Group",
        channel_type: "group",
        channel_member_ids: [
            Command.create({partner_id: serverState.partnerId}),
            Command.create({partner_id: partnerId}),
        ],
    });
    await start();
    await click(".o_menu_systray .dropdown-toggle:has(i[aria-label='Messages'])");
    await contains(".o-mail-MessagingMenu-headerFilter", {text: "Groups"});
    await click(".o-mail-MessagingMenu-headerFilter", {text: "Groups"});
    await contains(".o-mail-MessagingMenu-headerFilter.fw-bold.o-active", {
        text: "Groups",
    });
    await contains(".o-mail-NotificationItem", {text: "My Group"});
});
