# -*- coding: utf-8 -*-
# Copyright 2016 LasLabs Inc.
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

import json

from openerp import http
from openerp.http import request

from openerp.addons.web.controllers.main import db_info

import logging
_logger = logging.getLogger(__name__)


class WebStock(http.Controller):

    @http.route(
        ['/web/stock/pickings/'],
        type='http',
        auth="user",
        methods=["GET"],
    )
    def get_pickings(self, **kwargs):

        _logger.debug(kwargs)

        wizard_obj = request.env['website.stock.picking.wizard']
        wizard_id = wizard_obj.action_get_wizard()
        tpl_vals = self.__get_tpl_defaults(**kwargs)
        # @TODO: Use an autocomplete field instead of this?
        tpl_vals.update({
            'picking_types': request.env['stock.picking.type'].search([]),
        })

        if kwargs:

            search_vals = {
                'search_query': kwargs.get('search_query'),
                'picking_type_id': kwargs.get('picking_type_id'),
                'picking_state': kwargs.get('picking_state'),
            }
            if not wizard_id:
                wizard_id = wizard_obj.create(search_vals)
            else:
                wizard_id.write(search_vals)

            tpl_vals.update({
                'wizard': wizard_id,
                'pickings': wizard_id.picking_ids,
            })

            if len(wizard_id.picking_ids) == 1:
                picking_id = wizard_id.picking_ids.id
                wizard_id.unlink()
                return self.get_picking(picking_id)

        else:
            if not wizard_id:
                wizard_id = wizard_obj.create({})
            tpl_vals.update({
                'wizard': wizard_id,
                'pickings': wizard_id.picking_ids,
            })

        return request.render(
            "web_stock_picking.picking_search",
            tpl_vals,
        )

    @http.route(
        ['/web/stock/pickings/<int:picking_id>'],
        type='http',
        auth='user',
        methods=['GET'],
    )
    def get_picking(self, picking_id, **kwargs):
        tpl_vals = self.__get_tpl_defaults(**kwargs)
        picking_id = request.env['stock.picking'].browse(picking_id)
        if not picking_id:
            return self.get_pickings(
                errors=['No picking was found']
            )
        tpl_vals.update({
            'picking': picking_id,
            'warehouse': picking_id.picking_type_id.warehouse_id,
        })
        return request.render(
            "web_stock_picking.picking_detail",
            tpl_vals,
        )

    @http.route(
        ['/web/stock/pickings/<int:picking_id>'],
        type='http',
        auth='user',
        methods=['PATCH'],
    )
    def patch_picking(self, picking_id, **kwargs):
        """ Perform updates to picking according to form input """

        _logger.debug('Got POST args %s', kwargs)

        try:
            additional_action = kwargs['additional_action']
            del kwargs['additional_action']
        except KeyError:
            additional_action = None

        res = self._update_picking(picking_id, **kwargs)
        _logger.debug('Picking update response %s', res)
        if len(res.get('error_fields', [])):
            return json.dumps(res)

        if additional_action:
            self.action_additional(picking_id, additional_action)

        _logger.debug(
            'Action response for %s is %s',
            kwargs['submit_action'],
            getattr(self, kwargs['submit_action'])(picking_id)
        )

        return json.dumps(res)

    @http.route(
        ['/web/stock/pickings/<int:picking_id>/items'],
        type='http',
        auth='user',
        methods=['GET'],
    )
    def get_picking_item(self, picking_id, **kwargs):
        picking_id = self.__get_picking(picking_id)
        

    def _update_picking(self, picking_id, **kwargs):

        _logger.debug(kwargs)

        tpl_vals = self.__get_tpl_defaults(**kwargs)
        picking_id = self.__get_picking(picking_id)

        if not picking_id:
            tpl_vals['error_fields'].append(
                'Cannot find Picking Id %d' % picking_id,
            )
        else:
            try:
                request.env['website.stock.picking.wizard'].action_process_form(
                    picking_id, kwargs,
                )
                tpl_vals.update({'id': picking_id.id})
            except:
                _logger.exception('Exception while saving picking')
                tpl_vals['error_fields'].append(
                    'Error while saving %s.' %  picking_id
                )

        return tpl_vals

    def action_additional(self, picking_id, additional_action):
        """ Additional actions provided by stock wizards """
        picking_id = request.env['stock.picking'].browse(picking_id)
        if additional_action == 'immediate_transfer':
            wizard_id = request.env['stock.immediate.transfer'].create({
                'pick_id': picking_id.id,
            })
            additional_action = 'process'
            if picking_id.state == 'draft':
                self.action_confirm(picking_id.id)
        elif additional_action in ['process', 'process_cancel_backorder']:
            wizard_id = request.env['stock.backorder.confirmation'].create({
                'pick_id': picking_id.id,
            })
        return getattr(wizard_id, additional_action)()

    def action_confirm(self, picking_id):
        picking_id = self.__get_picking(picking_id)
        return picking_id.action_confirm()

    def action_assign(self, picking_id):
        picking_id = self.__get_picking(picking_id)
        return picking_id.action_assign()

    def action_force_assign(self, picking_id):
        picking_id = self.__get_picking(picking_id)
        return picking_id.force_assign()

    def action_new_transfer(self, picking_id):
        picking_id = self.__get_picking(picking_id)
        return picking_id.do_new_transfer()

    def action_print_picking(self, picking_id):
        picking_id = self.__get_picking(picking_id)
        return picking_id.do_print_picking()

    def action_cancel(self, picking_id):
        picking_id = self.__get_picking(picking_id)
        return picking_id.action_cancel()

    def action_unreserve(self, picking_id):
        picking_id = self.__get_picking(picking_id)
        return picking_id.do_unreserve()

    def action_put_in_pack(self, picking_id):
        picking_id = self.__get_picking(picking_id)
        return picking_id.put_in_pack()

    def __get_picking(self, picking_id):
        if isinstance(picking_id, int):
            return request.env['stock.picking'].browse(picking_id)
        else:
            return picking_id

    def __get_tpl_defaults(self, **kwargs):
        return {
            'errors': [],
            'error_fields': kwargs.get('error_fields', []),
            'db_info': json.dumps(db_info()),
        }
