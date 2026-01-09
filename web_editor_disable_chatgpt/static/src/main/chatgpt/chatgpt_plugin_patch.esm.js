/* License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). */

import {ChatGPTPlugin} from "@html_editor/main/chatgpt/chatgpt_plugin";
import {MAIN_PLUGINS} from "@html_editor/plugin_sets";

MAIN_PLUGINS.splice(MAIN_PLUGINS.indexOf(ChatGPTPlugin), 1);
