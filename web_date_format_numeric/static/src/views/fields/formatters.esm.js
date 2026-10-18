// Copyright 2026 Camptocamp SA
// License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html.).

import {exprToBoolean} from "@web/core/utils/strings";
import {session} from "@web/session";
import {formatDate} from "@web/views/fields/formatters";

formatDate.extractOptions = ({options}) => ({
    numeric: exprToBoolean(options.numeric ?? session.use_date_format_numeric),
});
