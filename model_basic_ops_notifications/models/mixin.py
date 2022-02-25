# -*- coding: utf-8 -*-

import logging

from odoo import _, api, models

BASIC_MODEL_OPS_NOTIFICATION_MIXIN_MODEL_NAME = "model_basic_ops_notifications.mixin"
BUS_MODEL_NAME = "bus.bus"

_logger = logging.getLogger(__name__)


class BasicModelOpsNotification(models.AbstractModel):
    _name = BASIC_MODEL_OPS_NOTIFICATION_MIXIN_MODEL_NAME
    _description = "Mixin para notificaciones."

    _model_male_repr = True
    _model_successfull_single_repr = "The record"
    _model_successfull_single_selected_repr = "The selected record"
    _model_successfull_plural_repr = "The records"
    _model_successfull_plural_selected_repr = "The selected records"
    _default_notification_type = "success"
    _sticky_notification = False

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
        if result and not self._context.get("do_not_notify", None):
            result._perform_notification()
        return result

    def write(self, vals):
        result = super().write(vals)
        if result and not self._context.get("do_not_notify", None):
            # TODO: Find a way to differentiate `unlink` requests made from the list and form view.
            # In the context Odoo always put `'view_type': 'list'`...
            # So we can also use `refer_to_selected` in that moment.
            self._perform_notification(operation="write", modified_vals=vals)
        return result

    def unlink(self):
        result = super().unlink()
        if result and not self._context.get("do_not_notify", None):
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
        alternate_message=None,
        alternate_notification_type="warning",
        modified_vals=None,
    ):
        message = alternate_message or self._get_notification_message(
            operation, successfull=successfull, refer_to_selected=refer_to_selected
        )
        if message:
            self.env[BUS_MODEL_NAME]._sendone(
                self.env.user.partner_id,
                f"notify-record-operation",
                {
                    "message": message,
                    "type": self._default_notification_type if successfull else alternate_notification_type,
                    "sticky": self._sticky_notification,
                },
            )
            _logger_message = f'Notification performed for model "{self._name}" on "{operation}" operation.'
            if modified_vals:
                _logger_message = f'{_logger_message}\nSince a "write" operation was trigger here are the modified values: {modified_vals}'
            _logger.info(_logger_message)
