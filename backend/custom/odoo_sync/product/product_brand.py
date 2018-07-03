# -*- coding: utf-8 -*-
##############################################################################
#
#    OpenERP, Open Source Management Solution
#    Copyright (C) 2004-2009 Tiny SPRL (<http://tiny.be>).
#    Copyright (C) 2010-2014 OpenERP s.a. (<http://openerp.com>).
#
#    This program is free software: you can redistribute it and/or modify
#    it under the terms of the GNU Affero General Public License as
#    published by the Free Software Foundation, either version 3 of the
#    License, or (at your option) any later version.
#
#    This program is distributed in the hope that it will be useful,
#    but WITHOUT ANY WARRANTY; without even the implied warranty of
#    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#    GNU Affero General Public License for more details.
#
#    You should have received a copy of the GNU Affero General Public License
#    along with this program.  If not, see <http://www.gnu.org/licenses/>.
#    Terminal view queue: sudo rabbitmqctl list_queues
#    
##############################################################################
# -------------  
#!/usr/bin/env python
from openerp import tools
from openerp.osv import osv, fields
import pika
import sys
from openerp.addons.odoo_sync.rabbitmq import RabbitMQ
import json
from openerp.addons.website.models.website import slug

class product_brand(osv.osv):
    _inherit = "product.brand"
    _columns = {
                'src_image':fields.char('Image Link', required=False),               
                }
    
    def makeDataQueue(self, cr, uid, brand, types):     
        if types!='deleteMQ':
            vals = {"id": brand.id,
                    "name": brand.name.encode('utf8') or "",
                    "description": brand.description and brand.description.encode('utf8') or "",
                    "type": types,
                    'image': brand.src_image,
                    'slug': slug(brand),
                    }
        else:
            vals = {
                    "id": [brand.id],
                    'type':types,
                    } 
        return json.dumps({'jdata': vals}) 
    
    def createRabbitMQPrivate(self, cr, uid, brands, types):
        try:
            host = self.pool.get('general.synchronization').getConfiguration(cr, uid) 
            if host:
                credentials = pika.PlainCredentials(host[1], host[2])
                connection = pika.BlockingConnection(pika.ConnectionParameters(
                    host=host[0],port=host[3], virtual_host=host[4],credentials=credentials))   
                channel = connection.channel()
                channel.queue_declare(queue='product_brand',durable=True)
                channel.exchange_declare(exchange='product_brand_logs',
                                 exchange_type='fanout')
                channel.queue_bind(exchange='product_brand_logs',
                           queue='product_brand')
                for brand in brands:
                    
                    message = "%s"%(self.makeDataQueue(cr, uid, brand, types))
                    channel.basic_publish(exchange='product_brand_logs',
                              routing_key='product_brand',
                              body=message,
                              properties=pika.BasicProperties(
                                 delivery_mode = 2, # make message persistent
                              ))
                    print(" [x] Sent %r" % message)
                connection.close()
                return True
            return True
        except:
            return True
        
    def makeDataQueueWaitingSync(self, cr, uid, datas, sync_id, types): 
        ids = map(lambda x: x.id, datas)
        max_recipients = 300
        chunks = [ids[x:x + max_recipients] for x in xrange(0, len(ids), max_recipients)]
        is_delete = True if types=="deleteMQ" else False
        for chunk in chunks:
            values = {
                                    'list_ids': [(4, id) for id in chunk],
                                    'sync_id':sync_id,
                                    'name':chunk,
                                    'is_delete': is_delete,
                     } 
            check_exists = self.pool.get('general.brand.queue').search(cr, uid, [('name','=',str(chunk)),('sync_id','=',sync_id),('is_delete','=',is_delete)])
            if not check_exists:
                self.pool.get('general.brand.queue').create(cr, uid, values)
        return True
    
    def makeDataQueueforUnlink(self, cr, uid, datas, types ):  
        vals = {
                "id": datas.ids,
                'type':types,
                }  
        return json.dumps({'jdata': vals})
    
    # function nay dung re-sync cho cac case fail
    def createRabbitMQfO(self, cr, uid, brands, types):
        api = RabbitMQ()
        return api.createRabbitMQfO(cr, uid, brands, self, self.pool.get('general.synchronization'), 'product_brand', 'product_brand_logs', types)
    
       
    def createRabbitMQ(self, cr, uid, brands, types):
        api = RabbitMQ()
        if types != 'deleteMQ':
            return api.createRabbitMQ(cr, uid, brands, self, self.pool.get('general.synchronization'), 'product_brand', 'product_brand_logs', types)
        return api.createRabbitMQforUnlink(cr, uid, brands, self, self.pool.get('general.synchronization'), 'product_brand', 'product_brand_logs', types)
    
    def write(self, cr, uid, ids, vals, context=None):
        if isinstance(ids, (int, long)):
            ids = [ids]
        res = super(product_brand, self).write(cr, uid, ids, vals, context=context)
        brands = self.browse(cr, uid, ids)
        self.createRabbitMQ(cr, uid, brands, "updateMQ")
        return res
    
    def create(self, cr, uid,  vals, context=None):
        res_id = super(product_brand, self).create(cr, uid, vals, context=context)
        brand = self.browse(cr, uid, res_id)
        self.createRabbitMQ(cr, uid, [brand], "createMQ")
        return res_id
    
    def unlink(self, cr, uid, ids, context=None):
        if isinstance(ids, (int, long)):
            ids = [ids]
        brands = self.browse(cr, uid, ids)
        self.createRabbitMQ(cr, uid, brands, "deleteMQ")
        res = super(product_brand, self).unlink(cr, uid, ids,  context=context)
        return res
    
product_brand()