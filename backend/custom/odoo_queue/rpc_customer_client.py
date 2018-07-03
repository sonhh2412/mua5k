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
class CustomerRpcClient(object):
    def __init__(self):
        self.connection = pika.BlockingConnection(pika.ConnectionParameters(
                host='localhost'))

        self.channel = self.connection.channel()

        result = self.channel.queue_declare(exclusive=True)
        self.callback_queue = result.method.queue

        self.channel.basic_consume(self.on_response, no_ack=True,
                                   queue=self.callback_queue)

    def on_response(self, ch, method, props, body):
        if self.corr_id == props.correlation_id:
            self.response = body

    def call(self, n):
        self.response = None
        self.corr_id = str(uuid.uuid4())
        self.channel.basic_publish(exchange='',
                                   routing_key='rpc_customer_queue',
                                   properties=pika.BasicProperties(
                                         reply_to = self.callback_queue,
                                         correlation_id = self.corr_id,
                                         ),
                                   body=str(n))
        while self.response is None:
            self.connection.process_data_events()
        return self.response

price_rpc = CustomerRpcClient()
adrr1 = {
           'web_id':1,
           'name':'khách hàng 1',
           'street':'330, mai hắc đế, quận 1',
           'state_id':1, # id này là id của state mà web nhận từ odoo trước đó
           'country_id':253, # id cua country mà web nhận từ odoo trước đó
           'phone':'0988992157',
           'email':'oanhle@icsc.vn',                 
           }
adrr2 = {
           'web_id':1,
           'name':'khách hàng 1',
           'street':'445, nguyễn ảnh thủ, quận 12',
           'state_id':1, # id này là id của state mà web nhận từ odoo trước đó
           'country_id':253, # id cua country mà web nhận từ odoo trước đó
           'phone':'0988992157',
           'email':'oanhle@icsc.vn',                 
           }
address = [adrr1,adrr2]
results = {
           'web_id':1,
           'name':'khách hàng 1',
           'street':'220, Cộng hòa, phường 13, tân bình',
           'state_id':1, # id này là id của state mà web nhận từ odoo trước đó
           'country_id':253, # id cua country mà web nhận từ odoo trước đó
           'phone':'0988992157',
           'email':'oanhle@icsc.vn',
           'address':'%s'%(address),           
           }
array = json.dumps(results)  
print(" [x] Requesting for customer register (%s)"%(array))
response = price_rpc.call(array)
print(" [.] Got %r" % response)
   
