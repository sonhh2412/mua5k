# -*- coding: utf-8 -*-
from openerp import models, fields


class ResPartner(models.Model):
    _inherit = 'res.partner'

    device_identity_ids = fields.One2many(
        'mail_push.device', 'partner_id', string='Device identities'
    )
