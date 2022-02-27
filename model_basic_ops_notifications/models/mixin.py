# -*- coding: utf-8 -*-

import logging
from contextlib import contextmanager
from functools import wraps

from odoo import _, api, models

BASIC_MODEL_OPS_NOTIFICATION_MIXIN_MODEL_NAME = "model_basic_ops_notifications.mixin"
BUS_MODEL_NAME = "bus.bus"

_logger = logging.getLogger(__name__)


class BasicModelOpsNotification(models.AbstractModel):
    _name = BASIC_MODEL_OPS_NOTIFICATION_MIXIN_MODEL_NAME
    _description = "Notifications Mixin."

    _model_male_repr = True
    _model_successfull_single_repr = "The record"
    _model_successfull_single_selected_repr = "The selected record"
    _model_successfull_plural_repr = "The records"
    _model_successfull_plural_selected_repr = "The selected records"
    _success_notification_type = "success"
    _failure_notification_type = "danger"
    _sticky_notification = False
    _non_reportable_fields = []

    @api.model
    def _get_operations_repr_map(self):
        # TODO: Please, i'm sure there is a better way of doing this.
        single_have_been = _("(single) have been")
        plural_have_been = _("(plural) have been")
        male_created = _("(male) created")
        female_created = _("(female) created")
        male_modified = _("(male) modified")
        female_modified = _("(female) modified")
        male_deleted = _("(male) deleted")
        female_deleted = _("(female) deleted")
        successfully = _("successfully")
        successfull_single_creation = (
            f"%s {single_have_been} {male_created if self._model_male_repr else female_created} {successfully}."
        )
        successfull_plural_creation = (
            f"%s {plural_have_been} {male_created if self._model_male_repr else female_created}s {successfully}."
        )
        successfull_single_modification = (
            f"%s {single_have_been} {male_modified if self._model_male_repr else female_modified} {successfully}."
        )
        successfull_plural_modification = (
            f"%s {plural_have_been} {male_modified if self._model_male_repr else female_modified}s {successfully}."
        )
        successfull_single_deletion = (
            f"%s {single_have_been} {male_deleted if self._model_male_repr else female_deleted} {successfully}."
        )
        successfull_plural_deletion = (
            f"%s {plural_have_been} {male_deleted if self._model_male_repr else female_deleted}s {successfully}."
        )
        failed_creation = _("It has been impossible to create %s.")
        failed_modification = _("It has been impossible to modify %s.")
        failed_deletion = _("It has been impossible to delete %s.")
        _model_failed_single_repr = self._model_successfull_single_repr.lower()
        _model_failed_single_selected_repr = self._model_successfull_single_selected_repr.lower()
        _model_failed_plural_repr = self._model_successfull_plural_repr.lower()
        _model_failed_plural_selected_repr = self._model_successfull_plural_selected_repr.lower()
        return {
            "success": {
                "create": {
                    "single": successfull_single_creation % self._model_successfull_single_repr,
                    "plural": successfull_plural_creation % self._model_successfull_plural_repr,
                },
                "write": {
                    "single": successfull_single_modification % self._model_successfull_single_repr,
                    "single_selected": successfull_single_modification % self._model_successfull_single_selected_repr,
                    "plural": successfull_plural_modification % self._model_successfull_plural_repr,
                    "plural_selected": successfull_plural_modification % self._model_successfull_plural_selected_repr,
                },
                "unlink": {
                    "single": successfull_single_deletion % self._model_successfull_single_repr,
                    "single_selected": successfull_single_deletion % self._model_successfull_single_selected_repr,
                    "plural": successfull_plural_deletion % self._model_successfull_plural_repr,
                    "plural_selected": successfull_plural_deletion % self._model_successfull_plural_selected_repr,
                },
            },
            "failure": {
                "create": {
                    "single": failed_creation % _model_failed_single_repr,
                    "plural": failed_creation % _model_failed_plural_repr,
                },
                "write": {
                    "single": failed_modification % _model_failed_single_repr,
                    "single_selected": failed_modification % _model_failed_single_selected_repr,
                    "plural": failed_modification % _model_failed_plural_repr,
                    "plural_selected": failed_modification % _model_failed_plural_selected_repr,
                },
                "unlink": {
                    "single": failed_deletion % _model_failed_single_repr,
                    "single_selected": failed_deletion % _model_failed_single_selected_repr,
                    "plural": failed_deletion % _model_failed_plural_repr,
                    "plural_selected": failed_deletion % _model_failed_plural_selected_repr,
                },
            },
        }

    def _get_notification_message(self, operation, successfull=True, refer_to_selected=False):
        single_or_plural = "single" if len(self) == 1 else "plural"
        if operation in ["write", "unlink"] and refer_to_selected:
            single_or_plural = "single_selected" if len(self) == 1 else "plural_selected"
        return (
            self._get_operations_repr_map()
            .get("success" if successfull else "failure", {})
            .get(operation, {})
            .get(single_or_plural, None)
        )

    @api.model
    def create(self, vals_list):
        result = super().create(vals_list)
        if result and not self._context.get("suppress_notifications", None):
            result._perform_notification()
        return result

    def write(self, vals):
        result = super().write(vals)

        if result and not self._context.get("suppress_notifications", None):
            # TODO: Find a way to differentiate `write` requests made from the list and form view.
            # In the context Odoo always put `'view_type': 'list'`...
            # So we can also use `refer_to_selected` in that moment.
            non_computed = [
                fname for fname in vals if not self._fields[fname].compute and not self._fields[fname].related
            ]
            non_ignored = [fname for fname in non_computed if fname not in self._non_reportable_fields]
            if non_ignored:
                self._perform_notification(operation="write", modified_vals=non_computed)
        return result

    def unlink(self):
        result = super().unlink()
        if result and not self._context.get("suppress_notifications", None):
            # TODO: Find a way to differentiate `unlink` requests made from the list and form view.
            # In the context Odoo always put `'view_type': 'list'`...
            # So we can also use `refer_to_selected` in that moment.
            self._perform_notification(operation="unlink")
        return result

    @api.model
    def _perform_notification(
        self,
        operation="create",
        successfull=True,
        refer_to_selected=False,
        message=None,
        modified_vals=None,
        as_action=False,
        title=None,
        notification_type="success",
        sticky=False,
        next_action=None,
    ):
        message = message or self._get_notification_message(
            operation, successfull=successfull, refer_to_selected=refer_to_selected
        )
        if message:
            if not as_action:
                self.env[BUS_MODEL_NAME]._sendone(
                    self.env.user.partner_id,
                    "notify-record-operation",
                    {
                        "message": message,
                        "type": self._success_notification_type if successfull else self._failure_notification_type,
                        "sticky": self._sticky_notification,
                    },
                )
                _logger_message = f'Notification performed for model "{self._name}" on "{operation}" operation.'
                if modified_vals:
                    _logger_message_extension = '\nSince a "write" operation was trigger here are the modified values:'
                    _logger_message = f"{_logger_message}{_logger_message_extension} {modified_vals}"
                _logger.info(_logger_message)
            else:
                next_action = next_action or {"type": "ir.actions.act_window_close"}
                notify_action = {
                    "type": "ir.actions.client",
                    "tag": "display_notification",
                    "params": {"message": message, "type": notification_type, "sticky": sticky, "next": next_action},
                }
                if title:
                    notify_action["params"]["title"] = title
                return notify_action


def with_specific_context(context):
    """Decorates a Odoo method in order to set a specific context."""

    def _with_specific_context(method):
        @wraps(method)
        def _wrapper(model_instance, *args, **kwargs):
            return method(model_instance.with_context(context), *args, **kwargs)

        return _wrapper

    return _with_specific_context


def suppress_notifications():
    """
    Decorates a Odoo method in order to suppress notifications.

    We can't do a context manager that work both as context manager and a decorator in this case.

    From the docs (https://docs.python.org/3/library/contextlib.html):
    Note that there is one additional limitation when using context managers as function decorators:
    there’s no way to access the return value of __enter__().
    If that value is needed, then it is still necessary to use an explicit with statement.

    Examples::
    >>> from odoo.addons.model_basic_ops_notifications.models.mixin import suppress_notifications
        ...
        @suppress_notifications()
        @api.depends("field_name")
        def _compute_method(self):
            # Here `self` will have its context already updated with the `{"suppress_notifications": True}` value.
            for i in self:
            ...
    """

    return with_specific_context({"suppress_notifications": True})


@contextmanager
def notifications_suppressor(model_instance):
    """
    Context manager to suppress notifications for a Odoo model instance.

    Examples::
    >>> from odoo.addons.model_basic_ops_notifications.models.mixin import notification_suppressor
        ...
        @api.depends("field_name")
        def _compute_method(self):
            with notifications_suppressor(self) as new_self:
                # Here `new_self` will have its context already updated with the `{"suppress_notifications": True}` value.
                for i in new_self:
                ...
    """

    yield model_instance.with_context({"suppress_notifications": True})


def depends_and_suppress_notifications(*args):
    """
    Decorates a Odoo method in order to specify its dependencies and to suppress notifications.

    Examples::
    >>> from odoo.addons.model_basic_ops_notifications.models.mixin import depends_and_suppress_notifications
        ...
        @depends_and_suppress_notifications("field_name")
        def _compute_method(self):
            # Here `self` will have its context already updated with the `{"suppress_notifications": True}` value.
            for i in self:
            ...
    """

    def _depends_and_suppress_notifications(method):
        depends = api.depends(*args)(method)
        return suppress_notifications()(depends)

    return _depends_and_suppress_notifications


def onchange_and_suppress_notifications(*args):
    """
    Decorates a Odoo method in order to specify how must behave when a field change and to suppress notifications.
    THIS WILL BE ONLY NECESSARY if you use `write` sentences within you `onchange` definitions to specify certain
    values.

    Examples::
    >>> from odoo.addons.model_basic_ops_notifications.models.mixin import onchange_and_suppress_notifications
        ...
        @onchange_and_suppress_notifications("field_name")
        def _onchange_method(self):
            # Here `self` will have its context already updated with the `{"suppress_notifications": True}` value.
            self.write({'attr': value})
            ...
    """

    def _onchange_and_suppress_notifications(method):
        onchanges = api.onchange(*args)(method)
        return suppress_notifications()(onchanges)

    return _onchange_and_suppress_notifications
