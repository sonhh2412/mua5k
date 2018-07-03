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

class res_country_state(osv.osv):
    _inherit = "res.country.state"
    
    def makeDataQueue(self, cr, uid, state, types ):  
        if types!='deleteMQ':
            vals = {
                    "id": state.id, 
                    "name": state.name.encode('utf8') or "",               
                    'type':types,
                    "countryId":state.country_id and state.country_id.id or "",
                    # "countryName":state.country_id and state.country_id.name.encode('utf8') or "",
                    # "countryCode":state.country_id.code,
                    "code":state.code
                    }
        else:
            vals = {
                    "id": [state.id],
                    'type':types,
                    }  
        return json.dumps({'jdata': vals})   
    
    def makeDataQueueforUnlink(self, cr, uid, states, types ):  
        vals = {
                "id": states.ids,
                'type':types,
                }  
        return json.dumps({'jdata': vals})       
    
    def createRabbitMQPrivate(self, cr, uid, states, types):
        try:
            host = self.pool.get('general.synchronization').getConfiguration(cr, uid) 
            if host:  
                credentials = pika.PlainCredentials(host[1], host[2])
                connection = pika.BlockingConnection(pika.ConnectionParameters(
                    host=host[0],port=host[3], virtual_host=host[4],credentials=credentials))  
                channel = connection.channel()
                channel.queue_declare(queue='state',durable=True)
                channel.exchange_declare(exchange='state_logs',
                                 exchange_type='fanout')
                channel.queue_bind(exchange='state_logs',
                           queue='state')
                for state in states:
                    message = "%s"%(self.makeDataQueue(cr, uid, state, types))
                    channel.basic_publish(exchange='state_logs',
                              routing_key='state',
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
            check_exists = self.pool.get('general.state.queue').search(cr, uid, [('name','=',str(chunk)),('sync_id','=',sync_id),('is_delete','=',is_delete)])
            if not check_exists:
                self.pool.get('general.state.queue').create(cr, uid, values)
        return True
    
    # function nay dung re-sync cho cac case fail
    def createRabbitMQfO(self, cr, uid, states, types):
        api = RabbitMQ()
        return api.createRabbitMQfO(cr, uid, states, self, self.pool.get('general.synchronization'), 'state', 'state_logs', types)
    
        
    def createRabbitMQ(self, cr, uid, states, types):
        api = RabbitMQ()
        if types != 'deleteMQ':
            return api.createRabbitMQ(cr, uid, states, self, self.pool.get('general.synchronization'), 'state', 'state_logs', types)
        return api.createRabbitMQforUnlink(cr, uid, states, self, self.pool.get('general.synchronization'), 'state', 'state_logs', types)
    
    def write(self, cr, uid, ids, vals, context=None):
        if isinstance(ids, (int, long)):
            ids = [ids]
        res = super(res_country_state, self).write(cr, uid, ids, vals, context=context)
        states = self.browse(cr, uid, ids)
        self.createRabbitMQ(cr, uid, states,"updateMQ")
        return res
    
    def create(self, cr, uid,  vals, context=None):
        res_id = super(res_country_state, self).create(cr, uid, vals, context=context)
        state = self.browse(cr, uid, res_id)
        self.createRabbitMQ(cr, uid, [state],"createMQ")
        return res_id
    
    def unlink(self, cr, uid, ids, context=None):
        if isinstance(ids, (int, long)):
            ids = [ids]
        states = self.browse(cr, uid, ids)
        self.createRabbitMQ(cr, uid, states, "deleteMQ")
        res = super(res_country_state, self).unlink(cr, uid, ids,  context=context)
        return res
    
res_country_state()