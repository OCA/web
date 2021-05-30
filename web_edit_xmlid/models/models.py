from odoo import models, fields


class BaseModel(models.BaseModel):
    _inherit = 'base'

    def ensure_xml_id(self, skip=False):
        """ Public version of `__ensure_xml_id` used by DebugManager.
            Since `__ensure_xml_id` use raw SQL queries to create data
            standard ORM fields (`create_uid`, `write_uid`, `create_date`,
            `write_date`) are not filled correctly.
        """
        res = self.__ensure_xml_id(skip)
        xids = []
        for record, xid in res:
            xids.append(self.env['ir.model.data'].xmlid_lookup(xid)[0])
        # To avoid having our record manually linked with a XML_ID to be
        # deleted when the module that owns this record will be updated, we
        # set `noupdate` to True.
        # This is done only once since `write_uid` will be set there.
        xml_ids = self.env['ir.model.data'].search(
            [('id', 'in', xids), ('write_uid', '=', False)]
        )
        xml_ids.write({
            'noupdate': True,
            'date_init': fields.Datetime.now(),
            'date_update': fields.Datetime.now(),
        })
        return res
