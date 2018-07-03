# -*- coding: utf-8 -*-
from openerp import models, fields, api


class MailPushDevice(models.Model):
    _name = 'mail_push.device'

    @api.model
    def _default_service_type(self):
        return [('fcm', 'FCM')]

    name = fields.Char(string="Device Name")
    partner_id = fields.Many2one('res.partner', 'Partner', ondelete='cascade')
    subscription_id = fields.Char('Subscription ID', groups='base.group_system')
    service_type = fields.Selection('_default_service_type', 'Notification Service')

    @api.model
    def create(self, values):
        identity = super(MailPushDevice, self).create(values)
        body = "<strong>%s</strong> device registered for Mobile notifications" % (identity.name)
        identity.partner_id.message_post(body=body, subtype="mail.mt_comment")
        return identity

    @api.multi
    def unlink(self):
        for device_identity in self:
            body = "<strong>%s</strong> device removed for Mobile notifications" % (device_identity.name)
            device_identity.partner_id.message_post(body=body, subtype="mail.mt_comment")
        return super(MailPushDevice, self).unlink()

    @api.model
    def add_device(self, subscription_id, device_name, service_type):
        """This method is going to use for adding new device subscription.

            :param  subscription_id : subscription_id or token from notification service
            :param  device_name: name of device e.g Nexus 5
        """
        partner = self.env.user.partner_id
        subscription_exist = self.sudo().search([('subscription_id', '=', subscription_id)])
        if subscription_exist:
            subscription_exist.partner_id = partner.id
        else:
            self.sudo().create({'subscription_id': subscription_id, 'name': device_name, 'partner_id': partner.id, 'service_type': service_type})
