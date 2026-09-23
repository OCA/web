/* Copyright 2026 Liam Noonan
 * License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl). */

import {Chatter} from "@mail/chatter/web_portal/chatter";
import {Component} from "@odoo/owl";
import {FormRenderer} from "@web/views/form/form_renderer";
import {ResizablePanel} from "@web/core/resizable_panel/resizable_panel";
import {browser} from "@web/core/browser/browser";
import {omit} from "@web/core/utils/objects";
import {patch} from "@web/core/utils/patch";

const STORAGE_KEY = "web_responsive.form_chatter_width";
const CHATTER_WIDTH_CSS_VAR = "--wr-resizable-chatter-width";
const CHATTER_MIN_WIDTH_CSS_VAR = "--wr-resizable-chatter-min-width";

/** @returns {Number} from form_chatter.scss (:root --wr-resizable-chatter-min-width). */
function getChatterMinWidth() {
    return parseInt(
        getComputedStyle(document.documentElement).getPropertyValue(
            CHATTER_MIN_WIDTH_CSS_VAR
        ),
        10
    );
}

/** Form chatter container that becomes a ResizablePanel when chat is aside. */
export class FormChatter extends Component {
    static template = "web_responsive.FormChatter";
    static components = {ResizablePanel};
    static props = [...Chatter.props, "chatterComponent", "chatterContainerClass?"];

    setup() {
        this.minWidth = getChatterMinWidth();
    }

    /** Props for mail.Chatter (drop FormChatter-only props). */
    get chatterProps() {
        return omit(this.props, "chatterComponent", "chatterContainerClass");
    }

    get chatterWidth() {
        const storedWidth = browser.localStorage.getItem(STORAGE_KEY);
        return storedWidth ? parseInt(storedWidth, 10) : this.minWidth;
    }

    onResize(width) {
        browser.localStorage.setItem(STORAGE_KEY, width);
        document.documentElement.style.setProperty(CHATTER_WIDTH_CSS_VAR, `${width}px`);
    }
}

patch(FormRenderer.prototype, {
    setup() {
        super.setup();
        this.mailComponents.FormChatter = FormChatter;
    },
});
