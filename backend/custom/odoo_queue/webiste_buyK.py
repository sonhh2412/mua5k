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
import pika
import uuid
import json

#danh cho web
#localhost
credentials = pika.PlainCredentials('oanhle', '123')
connection = pika.BlockingConnection(pika.ConnectionParameters(
                    host='localhost',credentials=credentials))   
#server test
# credentials = pika.PlainCredentials('10k', 'admin123!')
# connection = pika.BlockingConnection(pika.ConnectionParameters(
#                     host='120.72.83.181',credentials=credentials))  
  
channel = connection.channel()
channel.queue_declare(queue='website_transactionK',durable=True)
channel.exchange_declare(exchange='website_transactionK_logs',
                 exchange_type='fanout')
channel.queue_bind(exchange='website_transactionK_logs',
           queue='website_transactionK')

    
results = {
       'partner_id':['1232342343kh2601','kh2601'], #[id_website,'login']
       'type_exchange':"addition", # co 2 gia tri them va bot tuong ung [('addition','+'),('subtraction','-')]
       'amount_exchange':100000, #so K thay doi
       'date_exchange':'2016-01-25 01:05:00', #thoi gian giao dich format nhu the nay
       'millisecond':325, #0< phan ngan giay <100
       }
array = json.dumps(results)  
print(" [x] Requesting for Xo so (%s)"%(array))
channel.basic_publish(exchange='website_transactionK_logs',
          routing_key='website_transactionK',
          body=array,
          properties=pika.BasicProperties(
             delivery_mode = 2, # make message persistent
          ))
print(" [x] Sent %r" % array)
connection.close()

