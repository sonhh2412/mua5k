# -*- coding: utf-8 -*-
from openerp.http import request
from openerp.osv import fields, osv

class IrHttp(osv.AbstractModel):
    _inherit = 'ir.http'

    def session_info(self):
        result = super(IrHttp, self).session_info()
        result.update({
            'device_subscription_ids': request.env.user.partner_id.device_identity_ids.mapped('subscription_id'),
            'fcm_project_id': request.env['mail.channel']._get_default_fcm_credentials()["fcm_project_id"],
            'inbox_action': request.env.ref('mail.mail_channel_action_client_chat').id
        })
        return result
