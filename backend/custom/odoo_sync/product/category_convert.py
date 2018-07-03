# -*- coding: utf-8 -*-

from openerp import api, tools, SUPERUSER_ID
from openerp.osv import osv, fields, expression

import openerp.addons.decimal_precision as dp
from openerp.tools.translate import _
import json
from openerp.addons.odoo_sync.rabbitmq import RabbitMQ

class category_convert(osv.osv):
    _inherit = "category.convert"
   
    def makeDataQueue(self, cr, uid, data, types):     
        product_ids = map(lambda x: x.id, data.product_ids)
        vals = {"id": data.id,
                "name":data.name,
                "amount":data.amount,
                "product_ids":product_ids
                }
        return json.dumps({'jdata': vals}) 
    
    def createRabbitMQ(self, cr, uid, brands, types):
        api = RabbitMQ()
        return api.createRabbitMQ(cr, uid, brands, self, self.pool.get('general.synchronization'), 'product_convert', 'product_convert_logs', "types")
    
    def createRabbitMQfO(self, cr, uid, brands, types):
        api = RabbitMQ()
        return api.createRabbitMQfO(cr, uid, brands, self, self.pool.get('general.synchronization'), 'product_convert', 'product_convert_logs', "types")
    
    def makeDataQueueWaitingSync(self, cr, uid, datas, sync_id, types): 
        ids = map(lambda x: x.id, datas)
        max_recipients = 300
        chunks = [ids[x:x + max_recipients] for x in xrange(0, len(ids), max_recipients)]
        for chunk in chunks:
            values = {
                                    'list_ids': [(4, id) for id in chunk],
                                    'sync_id':sync_id,
                                    'name':chunk,
                     } 
            check_exists = self.pool.get('general.convert.queue').search(cr, uid, [('name','=',str(chunk)),('sync_id','=',sync_id)])
            if not check_exists:
                self.pool.get('general.convert.queue').create(cr, uid, values)
        return True
    
    def write(self, cr, uid, ids, vals, context=None):
        res = super(category_convert, self).write(cr, uid, ids, vals, context=context)
        self.createRabbitMQ(cr, uid, self.browse(cr, uid, ids, context=context),"")
            
        return res
    

        