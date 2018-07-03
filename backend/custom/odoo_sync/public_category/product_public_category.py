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


class product_public_category(osv.osv):
    _inherit = "product.public.category"


    def id_get(self, cr, uid, ids, context=None):
        res = []
        for cat in self.browse(cr, uid, ids, context=context):
            categids = [int(cat.id)]
            pcat = cat.parent_id
            while pcat:
                categids.append(int(pcat.id))
                pcat = pcat.parent_id
            res.append((cat.id, ' / '.join(reversed(categids))))
        return res

    def renderMake (self, obj):
        return {
            'images' : obj.name,
            'sequence' : obj.sequence,
            'href' : obj.link_href
        }

    def makeDataQueue(self, cr, uid, category, types):
        if types!='deleteMQ':
            images = map(lambda x: x.link_href, category.image_ids.sorted(lambda x: x.sequence))
            vals = {"id": category.id,
                    "slug": slug(category),
                    "name": category.name or "",
                    "complete_name":category.complete_name or "",
                    "sequence": category.sequence or 0,
                    "parent_id": category.parent_id and category.parent_id.id or 0,
                    # "parent_name": category.parent_id and category.parent_id.complete_name or "",
                    # "parent_full_id": category.parent_id and self.id_get(cr, uid, [category.parent_id.id]) or "",
                    "type": types,
                    "sub_images": images,
                    # 'product_host_ids' : [] 
                    # "icon": category.icon or "",
                    # "bg_color": category.bg_color or ""
                    }
        else:
            vals = {
                    "id": [category.id],
                    'type':types,
                    }
        return json.dumps({'jdata': vals})
    
    def makeDataQueueforUnlink(self, cr, uid, datas, types ):  
        vals = {
                "id": datas.ids,
                'type':types,
                }  
        return json.dumps({'jdata': vals})   
    
    def makeDataQueueforHotProducts(self, cr, uid, data, types ):  
        hots = map(lambda x: x.id, data.hot_products)
        vals = {
                "category_id": data.id,
                'type':types,
                "hots":hots
                }  
        return json.dumps({'jdata': vals})   

    def createRabbitMQPrivate(self, cr, uid, categories, types):
        try:
            host = self.pool.get('general.synchronization').getConfiguration(cr, uid)
            if host:
                credentials = pika.PlainCredentials(host[1], host[2])
                connection = pika.BlockingConnection(pika.ConnectionParameters(
                    host=host[0],port=host[3], virtual_host=host[4],credentials=credentials)) 
                channel = connection.channel()
                channel.queue_declare(queue='product_public_category',durable=True)
                channel.exchange_declare(exchange='product_public_category_logs',
                                 exchange_type='fanout')
                channel.queue_bind(exchange='product_public_category_logs',
                           queue='product_public_category')
                for category in categories:
                    message = "%s"%(self.makeDataQueue(cr, uid, category, types))
                    channel.basic_publish(exchange='product_public_category_logs',
                              routing_key='product_public_category',
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

    def makeDataQueueWaitingSync(self, cr, uid, datas, sync_id, types ):
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
            check_exists = self.pool.get('general.category.queue').search(cr, uid, [('name','=',str(chunk)),('sync_id','=',sync_id),('is_delete','=',is_delete)])
            if not check_exists:
                self.pool.get('general.category.queue').create(cr, uid, values)
        return True
    
    def makeDataQueueWaitingSyncHotProduct(self, cr, uid, datas, sync_id, types ):
        ids = map(lambda x: x.id, datas)
        max_recipients = 300
        chunks = [ids[x:x + max_recipients] for x in xrange(0, len(ids), max_recipients)]
        for chunk in chunks:
            values = {
                                    'sync_id':sync_id,
                                    'name':chunk,
                     }
            check_exists = self.pool.get('general.hot.product.queue').search(cr, uid, [('name','=',str(chunk)),('sync_id','=',sync_id)])
            if not check_exists:
                self.pool.get('general.hot.product.queue').create(cr, uid, values)
        return True

    # function nay dung re-sync cho cac case fail
    def createRabbitMQfO(self, cr, uid, categories, types):
        api = RabbitMQ()
        return api.createRabbitMQfO(cr, uid, categories, self, self.pool.get('general.synchronization'), 'product_public_category', 'product_public_category_logs', types)

    def createRabbitMQ(self, cr, uid, categories, types):
        api = RabbitMQ()
        if types != 'deleteMQ':
            return api.createRabbitMQ(cr, uid, categories, self, self.pool.get('general.synchronization'), 'product_public_category', 'product_public_category_logs', types)
        return api.createRabbitMQforUnlink(cr, uid, categories, self, self.pool.get('general.synchronization'), 'product_public_category', 'product_public_category_logs', types)
    
    def createRabbitMQforHotProducts(self, cr, uid, categories, types):
        api = RabbitMQ()
        return api.createRabbitMQforHotProducts(cr, uid, categories, self, self.pool.get('general.synchronization'), 'product_hot', 'product_hot_logs', types)
    
    def write(self, cr, uid, ids, vals, context=None):
        if isinstance(ids, (int, long)):
            ids = [ids]
        res = super(product_public_category, self).write(cr, uid, ids, vals, context=context)
        categories = self.browse(cr, uid, ids)
        self.createRabbitMQ(cr, uid, categories, "updateMQ")
        return res

    def create(self, cr, uid,  vals, context=None):
        res_id = super(product_public_category, self).create(cr, uid, vals, context=context)
        category = self.browse(cr, uid, res_id)
        self.createRabbitMQ(cr, uid, [category], "createMQ")
        return res_id

    def unlink(self, cr, uid, ids, context=None):
        if isinstance(ids, (int, long)):
            ids = [ids]
        categories = self.browse(cr, uid, ids)
        self.createRabbitMQ(cr, uid, categories, "deleteMQ")
        res = super(product_public_category, self).unlink(cr, uid, ids,  context=context)
        return res

product_public_category()


