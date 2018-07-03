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

#!/usr/bin/env python
import pika

connection = pika.BlockingConnection(pika.ConnectionParameters(
        host='localhost'))
channel = connection.channel()

channel.queue_declare(queue='product_public_category',durable=True)
channel.exchange_declare(exchange='product_public_category_logs', exchange_type='fanout')
channel.queue_bind(exchange='product_public_category_logs', queue='product_public_category')
def callback(ch, method, properties, body):
    print(" [x] Received %r" % body)

channel.basic_consume(callback, queue='product_public_category', no_ack=True)

print(' [*] Waiting for messages. To exit press CTRL+C')
channel.start_consuming()
connection.close()

#!/usr/bin/env python
# import pika
# 
# connection = pika.BlockingConnection(pika.ConnectionParameters(
#         host='localhost'))
# channel = connection.channel()
# 
# channel.exchange_declare(exchange='logs',
#                          type='fanout')
# 
# result = channel.queue_declare(exclusive=True)
# queue_name = result.method.queue
# 
# channel.queue_bind(exchange='logs',
#                    queue=queue_name)
# 
# print(' [*] Waiting for logs. To exit press CTRL+C')
# 
# def callback(ch, method, properties, body):
#     print(" [x] %r" % body)
# 
# channel.basic_consume(callback,
#                       queue=queue_name,
#                       no_ack=True)
# 
# channel.start_consuming()
    

#!/usr/bin/env python
# import pika
# import uuid
# 
# class FibonacciRpcClient(object):
#     def __init__(self):
#         self.connection = pika.BlockingConnection(pika.ConnectionParameters(
#                 host='localhost'))
# 
#         self.channel = self.connection.channel()
# 
#         result = self.channel.queue_declare(exclusive=True)
#         self.callback_queue = result.method.queue
# 
#         self.channel.basic_consume(self.on_response, no_ack=True,
#                                    queue=self.callback_queue)
# 
#     def on_response(self, ch, method, props, body):
#         if self.corr_id == props.correlation_id:
#             self.response = body

#     def call(self, n):
#         self.response = None
#         self.corr_id = str(uuid.uuid4())
#         self.channel.basic_publish(exchange='',
#                                    routing_key='rpc_queue',
#                                    properties=pika.BasicProperties(
#                                          reply_to = self.callback_queue,
#                                          correlation_id = self.corr_id,
#                                          ),
#                                    body=str(n))
#         while self.response is None:
#             self.connection.process_data_events()
#         return int(self.response)
# 
# fibonacci_rpc = FibonacciRpcClient()
# 
# print(" [x] Requesting fib(30)")
# response = fibonacci_rpc.call(80)
# print(" [.] Got %r" % response)
# send message
