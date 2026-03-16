This module provides a mechanism to warn users about concurrent edits from
multiple users on the same record.

When a user starts editing a record, the module tracks changes made to
that record. If the same record is being edited by another user,
the module detects this and shows a warning icon in the form view's status indicator,
and a popover with details about the concurrent edits.
