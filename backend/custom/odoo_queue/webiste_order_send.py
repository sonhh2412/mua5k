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
# credentials = pika.PlainCredentials('oanhle', '123')
# connection = pika.BlockingConnection(pika.ConnectionParameters(
#                     host='localhost',credentials=credentials))   
#server test
credentials = pika.PlainCredentials('10k', 'admin123!')
connection = pika.BlockingConnection(pika.ConnectionParameters(
                    host='120.72.83.181',credentials=credentials))  
 
channel = connection.channel()
channel.queue_declare(queue='website_order',durable=True)
channel.exchange_declare(exchange='website_order_logs',
                 exchange_type='fanout')
channel.queue_bind(exchange='website_order_logs',
           queue='website_order')

d = u'445, nguyễn ảnh thủ, quận 12'
note = u'Giao nhanh cho bà nha'
lines = []
line1 ={'product_id':3,# id cua product odoo sync qua truoc do
          'qty':5,
          'price':1200000, # gia cua san pham         
          }
lines.append(line1)
line2 = {'product_id':4,# id cua product odoo sync qua truoc do
          'qty':10,
          'price':8900000, # gia cua san pham         
          }
lines.append(line2)
line3 = {'product_id':11,# id cua product odoo sync qua truoc do
          'qty':6,
          'price':90900000, # gia cua san pham         
          }
lines.append(line3)
results = {
            'web_customer_id':'345',# id cua khach hang tren website
            'customer_account':'oanhle@icsc.vn',# tai khoan login cua khach hang tren website
            'web_address_ship':'123',# id cua dia chi khach hang tren website, neu khong co de bang web_customer_id
            'web_address_ship_street':d.encode('utf8'), # dia chi cua ship
            'web_address_ship_state_id':1, # thanh pho ship
            'web_address_ship_country_id':253, # quoc gia ship
            'web_address_ship_phone':'0988992157', # dien thoai lien he
            'order_name':'DH00001', # ma don hang cua web
            'order_id':'1212324', #id don hang web
            'order_date':'2016-04-20 13:05:00', #ngay h khach hang dat hang, format yyyy/mm/dd hh:mm:hh
            'note':note.encode('utf8'), # ghi chu cua khach hang
            'lines':lines, # chi tiet don hang
            'type_order':'cod', # cac option phai nam trong [('cod', 'COD'),('wallet', 'PayDiamond')]
            'paid':True,# Nếu thanh toán trên website ok ==> trả về True, ngược lại False
           
           }
array = json.dumps(results)  
for _ in range(1):    
    channel.basic_publish(exchange='website_order_logs',
              routing_key='website_order',
              body=array,
              properties=pika.BasicProperties(
                 delivery_mode = 2, # make message persistent
              ))
    print(" [x] Sent %r" % array)
connection.close()

