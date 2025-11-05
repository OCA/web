/**  @odoo-module **/

import {registerPatch} from "@mail/model/model_core";

registerPatch({
    name: "Thread",
    fields: {
        /**
         * @overload
         * Set to false to disable Audio/Video call buttons and Call options menu
         * in thread view.
         */
        hasCallFeature: {
            compute() {
                return false;
            },
        },
    },
});

registerPatch({
    name: "ChatWindow",
    fields: {
        /**
         * @overload
         * Set to false to disable Audio/Video call buttons in the minimized chatter.
         */
        hasCallButtons: {
            compute() {
                return false;
            },
        },
    },
});
