# -*- coding: utf-8 -*-

from openerp import tools
from openerp.osv import osv, fields
from datetime import datetime, timedelta
from openerp.addons.odoo_sync.rabbitmq import RabbitMQ
import json
from openerp import api, _
from openerp.tools import DEFAULT_SERVER_DATE_FORMAT, DEFAULT_SERVER_DATETIME_FORMAT

class give_k(osv.osv):
    _inherit = 'give.k'
    
    def makeDataQueueforGiveK(self, cr, uid, data, types ):
        str_date_start = str_date_end = ""
        if data.date_start:
            date_start = datetime.strptime(data.date_start, DEFAULT_SERVER_DATETIME_FORMAT)
            zonetime = date_start + timedelta(hours=7)
            str_date_start = datetime.strftime(zonetime, DEFAULT_SERVER_DATETIME_FORMAT)   
        if data.date_end:
            date_end = datetime.strptime(data.date_end, DEFAULT_SERVER_DATETIME_FORMAT)
            zonetime = date_end + timedelta(hours=7)
            str_date_end = datetime.strftime(zonetime, DEFAULT_SERVER_DATETIME_FORMAT)
        vals = {
                "id": data.id,
                "startDate": str_date_start,
                "endDate": str_date_end,
                "k_number": data.number_k or 0,
                "active": data.is_active or False,
                "type": types,
                }
        return json.dumps({'jdata': vals})
    
    def makeDataQueueforGiveKUnlink(self, cr, uid, datas, types ):
        vals = {
                "id": datas.ids,
                'type':types,
                }  
        return json.dumps({'jdata': vals})
    
    def makeDataQueueWaitingSyncGiveK(self, cr, uid, datas, sync_id, types ):
        ids = map(lambda x: x.id, datas)
        max_recipients = 5
        chunks = [ids[x:x + max_recipients] for x in xrange(0, len(ids), max_recipients)]
        for chunk in chunks:
            values = {'sync_id':sync_id, 'name':chunk}
            check_exists = self.pool.get('general.give.k.queue').search(cr, uid, [('name','=',str(chunk)),('sync_id','=',sync_id)])
            if not check_exists:
                self.pool.get('general.give.k.queue').create(cr, uid, values)
        return True
    
    def createRabbitMQforGiveK(self, cr, uid, giveks, types):
        api = RabbitMQ()
        if types != 'deleteMQ':
            return api.createRabbitMQforGiveK(cr, uid, giveks, self, self.pool.get('general.synchronization'), 'give_k', 'give_k_logs', types)
        return api.createRabbitMQforGiveKUnlink(cr, uid, giveks, self, self.pool.get('general.synchronization'), 'give_k', 'give_k_logs', types)
    
    def create(self, cr, uid, vals, context=None):
        give_id = super(give_k, self).create(cr, uid, vals, context=context)
        #dong bo
        self.createRabbitMQforGiveK(cr, uid, [self.browse(cr, uid, give_id)], "createMQ")
        return give_id
    
    def unlink(self, cr, uid, ids, context=None):
        if isinstance(ids, (int, long)):
            ids = [ids]
        #dong bo
        self.createRabbitMQforGiveK(cr, uid, self.browse(cr, uid, ids), "deleteMQ")
        result = super(give_k, self).unlink(cr, uid, ids, context=context)
        return result
    
    def write(self, cr, uid, ids, vals, context=None):
        give_id = super(give_k, self).write(cr, uid, ids, vals, context=context)
        #dong bo
        self.createRabbitMQforGiveK(cr, uid, [self.browse(cr, uid, ids)], "createMQ")
        return give_id
    
give_k()
    