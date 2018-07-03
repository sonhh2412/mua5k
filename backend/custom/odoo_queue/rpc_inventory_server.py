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

import xmlrpclib
import pika
import time

def rpc_getInventory(addr='http://127.0.0.1', port=8069, dbname='mycompany', data={}):
    #time.sleep(1)
    ids = xmlrpclib.ServerProxy('%s:%s/xmlrpc/object' % (addr, port)).execute(
        dbname, 1, '123', 'general.rpc.queue', 'write', [1], data )
    if ids and len(ids) > 1:
        #time.sleep(1)
        return ids
    return {}
    

connection = pika.BlockingConnection(pika.ConnectionParameters(
        host='localhost'))

channel = connection.channel()

channel.queue_declare(queue='rpc_inventory_queue')

def on_request(ch, method, props, body):
    data = {'product_ids': eval(body),
            'type':'inventory'}
    print(" [.] Inventory for (%s)" % data)
    response = rpc_getInventory(addr='http://localhost',port=8069, dbname='lama', data=data)

    ch.basic_publish(exchange='',
                     routing_key=props.reply_to,
                     properties=pika.BasicProperties(correlation_id = \
                                                         props.correlation_id),
                     body=str(response))
    ch.basic_ack(delivery_tag = method.delivery_tag)

channel.basic_qos(prefetch_count=100)
channel.basic_consume(on_request, queue='rpc_inventory_queue')
print(" [x] Awaiting RPC requests about inventory")
channel.start_consuming()

    


# send message
