# -*- coding: utf-8 -*-
from openerp import tools
from openerp.osv import osv, fields
import pika
import sys
from openerp.addons.odoo_sync.rabbitmq import RabbitMQ
import json

class credit_card_member(osv.osv):
    _inherit = 'credit.card.member'
    
    def makeDataLine(self, cr, uid, line):
        reason = line.reason and line.reason.name or ""
        return {
                'website_id': line.partner_id.website_id,
                'login':line.partner_id.login or "" ,
                'type':line.type == 'addition' and '+' or '-',
                'amount':line.amount,
                'reason':len(reason)>0 and reason.encode('utf8') or ""
                }

    def makeDataQueue(self, cr, uid, data,type):  
        line_data=filter(lambda x: x.partner_id.website_id, data.detail_ids)
        if line_data:
            vals = map(lambda x: self.makeDataLine(cr, uid, x), line_data)
            return json.dumps({'jdata': vals}) 
        return True 
    
    def makeDataQueueWaitingSync(self, cr, uid, datas, sync_id, types ): 
        ids = map(lambda x: x.id, datas)
        max_recipients = 300
        chunks = [ids[x:x + max_recipients] for x in xrange(0, len(ids), max_recipients)]
        for chunk in chunks:
            values = {
                                    'sync_id':sync_id,
                                    'name':chunk,
                     } 
            check_exists = self.pool.get('general.knumber.queue').search(cr, uid, [('name','=',str(chunk)),('sync_id','=',sync_id)])
            if not check_exists:
                self.pool.get('general.knumber.queue').create(cr, uid, values)
        return True
    
    # function nay dung re-sync cho cac case fail
    def createRabbitMQfO(self, cr, uid, datas, types):
        api = RabbitMQ()
        return api.createRabbitMQfO(cr, uid, datas, self, self.pool.get('general.synchronization'), 'odoo_change_Knumber', 'odoo_change_Knumber_logs', types)
    
    
    def createRabbitMQ(self, cr, uid, datas, types):
        api = RabbitMQ()
        return api.createRabbitMQ(cr, uid, datas, self, self.pool.get('general.synchronization'), 'odoo_change_Knumber', 'odoo_change_Knumber_logs', types)
    
    
    def act_update_credit(self, cr, uid, ids, context=None):
        super(credit_card_member, self).act_update_credit(cr, uid, ids, context=context)
        datas = self.browse(cr, uid, ids)
        self.createRabbitMQ(cr, uid, datas,"")
        return True
