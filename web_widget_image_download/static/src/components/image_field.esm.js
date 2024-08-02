/** @odoo-module **/

/* Copyright 2016 Flavio Corpa <flavio.corpa@tecnativa.com>
 * Copyright 2016 Jairo Llopis <jairo.llopis@tecnativa.com>
 * Copyright 2024 Manuel Regidor <manuel.regidor@sygel.es>
 * License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl). */

import {patch} from "@web/core/utils/patch";
import {ImageField} from "@web/views/fields/image/image_field";

patch(ImageField.prototype, {
    download() {
        const downloadLink = document.createElement("a");
        downloadLink.setAttribute("href", this.getUrl(this.props.name));
        downloadLink.setAttribute("download", "");
        downloadLink.click();
    },
    onFileDownload() {
        this.download();
    },
});
