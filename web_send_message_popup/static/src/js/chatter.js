// /** @odoo-module **/
// 
//    const AbstractRendererOwl = require("web.AbstractRendererOwl");
//    const QWeb = require("web.QWeb");
//    const session = require("web.session");
//    
//    import { Chatter } from "@mail/models/Chatter";
// 
//    const { MyChatter } = require("@mail/models/Chatter");
// 
//    const components = { Chatter };
//    export class MyChatter2 extends Chatter {
//         onClickSendMessage() {
//             console.info("********************function *****onClickSendMessage**********************");
//             this._super.apply(this, arguments);
//             if (this.chatter.composerView.composer && !this.chatter.composerView.composer.isLog) {
//                 this.chatter.composerView.composer.update({isLog: true});
//                 this.chatter.composerView.composer.openFullComposer();
//                 ////                 this.chatter.isComposerVisible &&
// 
//             }
//         }
// }
// odoo.define("web_send_message_popup/static/src/js/chatter.js", function (require) {
//     "use strict";
// 
//     const components = {
//         Composer: require("mail.chatter"),
//     };
//     const {patch} = require("web.utils");
//     console.info("*************************JS**********************");
// 
//     patch(components.Composer.prototype, "web_send_message_popup/static/src/js/chatter.js", {
//         /**
//          * Overwrite to always launch full composer instead of quick messages
//          */
//         onClickSendMessage() {
//             console.info("********************function *****onClickSendMessage**********************");
//             this._super.apply(this, arguments);
//             if (this.chatter.composerView.composer && !this.chatter.composerView.composer.isLog) {
//                 this.chatter.composerView.composer.update({isLog: true});
//                 this.chatter.composerView.composer.openFullComposer();
//                 ////                 this.chatter.isComposerVisible &&
// 
//             }
//         },
//     });
// });
