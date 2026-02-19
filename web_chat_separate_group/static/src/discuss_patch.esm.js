import {_t} from "@web/core/l10n/translation";
import {DiscussApp} from "@mail/core/public_web/discuss_app_model";
import {DiscussAppCategory} from "@mail/core/public_web/discuss_app_category_model";
import {patch} from "@web/core/utils/patch";
import {Record} from "@mail/model/record";
import {Thread} from "@mail/core/common/thread_model";
import {DiscussSidebarCategories} from "@mail/discuss/core/public_web/discuss_sidebar_categories";

// Setup group category
patch(DiscussApp.prototype, {
    setup(env) {
        super.setup(env);
        this.groups = Record.one("DiscussAppCategory", {
            compute() {
                return {
                    extraClass: "o-mail-DiscussSidebarCategory-group",
                    icon: "fa fa-users",
                    id: "groups",
                    name: _t("Groups"),
                    isOpen: true,
                    canView: false,
                    canAdd: true,
                    sequence: 30,
                    serverStateKey: "is_discuss_sidebar_category_group_open",
                    addTitle: _t("Start a group conversation"),
                };
            },
        });
    },
});

// ROADMAP: make thread ordering method configurable
// sort threads
patch(DiscussAppCategory.prototype, {
    sortThreads(t1, t2) {
        // No matter id, allways use string comparison
        return String.prototype.localeCompare.call(t1.displayName, t2.displayName);
    },
});

// Patch compute category
patch(Thread.prototype, {
    _computeDiscussAppCategory() {
        if (this.channel_type == "chat") {
            return this.store.discuss.chats;
        } else if (this.channel_type == "group") {
            return this.store.discuss.groups;
        } else if (this.channel_type === "channel" && !this.parent_channel_id) {
            return this.store.discuss.channels;
        }
    },
});

// ROADMAP: make quick search visibility configurable
// show quick search
patch(DiscussSidebarCategories.prototype, {
    hasQuickSearch() {
        return true;
    },
});
