/** @odoo-module **/
// License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).

import { _t } from "@web/core/l10n/translation";
import { registry } from "@web/core/registry";
import { CharField, charField } from "@web/views/fields/char/char_field";
import { TextField, textField } from "@web/views/fields/text/text_field";
import { useService } from "@web/core/utils/hooks";

export class CopyToClipboardCharWidget extends CharField {
  static template = "web_widget_copy_to_clipboard.CharCopyToClipboard";

  setup() {
    super.setup();
    this.notification = useService("notification");
  }

  onInputChange(ev) {
    this.props.record.update({ [this.props.name]: ev.target.value });
  }

  async onCopyClick() {
    const value = this.props.record.data[this.props.name] || "";
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      this.notification.add(_t("Copied to clipboard!"), {
        type: "success",
      });
    } catch (err) {
      console.error("Clipboard error:", err);
      this.notification.add(_t("Failed to copy!"), {
        type: "danger",
      });
    }
  }
}

export class CopyToClipboardTextWidget extends TextField {
  static template = "web_widget_copy_to_clipboard.TextCopyToClipboard";

  setup() {
    super.setup();
    this.notification = useService("notification");
  }

  onInputChange(ev) {
    this.props.record.update({ [this.props.name]: ev.target.value });
  }

  async onCopyClick() {
    const value = this.props.record.data[this.props.name] || "";
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      this.notification.add(_t("Copied to clipboard!"), {
        type: "success",
      });
    } catch (err) {
      console.error("Clipboard error:", err);
      this.notification.add(_t("Failed to copy!"), {
        type: "danger",
      });
    }
  }
}

registry.category("fields").add("copy_to_clipboard", {
  ...charField,
  component: CopyToClipboardCharWidget,
});

registry.category("fields").add("copy_to_clipboard_text", {
  ...textField,
  component: CopyToClipboardTextWidget,
});
