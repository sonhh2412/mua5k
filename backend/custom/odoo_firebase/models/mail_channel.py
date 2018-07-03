# -*- coding: utf-8 -*-
from openerp import models, api


class MailChannel(models.Model):
    _inherit = 'mail.channel'

    @api.multi
    def _notify(self, message):
        """ We want to send a Cloud notification for every mentions of a partner and every direct
        message. We have to take into account the risk of duplicated notifications in case of a
        mention in a channel of `chat` type.
        """
        super(MailChannel, self)._notify(message)

        receiver_ids = self.env['res.partner']  # Empty recordset for set operations
        # Create Cloud messages for messages in a chat
        if message.message_type == 'comment':
            for channel in message.channel_ids:
                receiver_ids |= channel.channel_partner_ids - message.author_id

            # Create Cloud messages for needactions, but ignore the needaction if it is a result
            # of a mention in a chat. In this case the previously created Cloud message is enough.
            receiver_ids |= message.partner_ids
            receiver_ids |= message.needaction_partner_ids
            identities = receiver_ids.mapped('device_identity_ids')
            if identities:
                for service, service_str in self.env['mail_push.device']._default_service_type():
                    method_name = "_push_notify_%s" % (service)
                    if hasattr(self, method_name):
                        method = getattr(self, method_name)
                        service_identities = identities.filtered(lambda r: r.service_type == service)
                        method(service_identities, message)
