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
# sudo rabbitmqctl list_exchanges

#
##############################################################################

#!/usr/bin/env python
import pika

connection = pika.BlockingConnection(pika.ConnectionParameters(
        host='localhost'))
channel = connection.channel()

#channel.queue_declare(queue='task_queue5',durable=True)
channel.exchange_declare(exchange='logs',
                         exchange_type='fanout')
result = channel.queue_declare(exclusive=True)
queue_name = result.method.queue
channel.queue_bind(exchange='logs',
                   queue=queue_name)

import time
# 
# def callback(ch, method, properties, body):
#     print(" [x] Received %r" % body)
#     time.sleep(body.count(b'.'))
#     print(" [x] Done")
#     ch.basic_ack(delivery_tag = method.delivery_tag)
#     
# channel.basic_consume(callback,
#                       queue='task_queue',
#                       no_ack=True)

# def callback(ch, method, properties, body):
#     print " [x] Received %r" % (body,)
#     time.sleep( body.count(b'.') )
#     print " [x] Done"
#     ch.basic_ack(delivery_tag = method.delivery_tag)
# channel.basic_qos(prefetch_count=1)
# channel.basic_consume(callback,
#                       queue='task_queue5',
#                       no_ack=True)
# 
# print(' [*] Waiting for messages. To exit press CTRL+C')
# channel.start_consuming()

def callback(ch, method, properties, body):
    print(" [x] %r" % body)

channel.basic_consume(callback,
                      queue=queue_name,
                      no_ack=True)

channel.start_consuming()
#connection.close()

    


# send message
