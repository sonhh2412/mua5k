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

#localhost
# credentials = pika.PlainCredentials('oanhle', '123')
# connection = pika.BlockingConnection(pika.ConnectionParameters(
#                     host='localhost',credentials=credentials)) 
#danh cho web
credentials = pika.PlainCredentials('10k', 'admin123!')
connection = pika.BlockingConnection(pika.ConnectionParameters(
                    host='120.72.83.181',credentials=credentials))   
channel = connection.channel()
channel.queue_declare(queue='website_customer',durable=True)
channel.exchange_declare(exchange='website_customer_logs',
                 exchange_type='fanout')
channel.queue_bind(exchange='website_customer_logs',
           queue='website_customer')


f = u'220, Cộng hòa, phường 13, tân bình'
i=56822
for _ in range(3):
    i +=1
    a = u'địa chỉ 1'
    b = u'330, mai hắc đế, quận 1, HCM'
    address = []
    adrr1 = {
               'web_id':i+50,
               'name':a.encode('utf8'),
               'street':b.encode('utf8') ,
               'state_id':61, # id này là id của state mà web nhận từ odoo trước đó
               'country_id':243, # id cua country mà web nhận từ odoo trước đó
               'phone':'0988992157',
               'email':'oanhle@icsc.vn',                 
               }
    address.append(adrr1)
    c = u'địa chỉ 2'
    d = u'445, nguyễn ảnh thủ, quận 12'
    adrr2 = {
               'web_id':i+51,
               'name':c.encode('utf8'),
               'street':d.encode('utf8'),
               'state_id':61, # id này là id của state mà web nhận từ odoo trước đó
               'country_id':243, # id cua country mà web nhận từ odoo trước đó
               'phone':'0988992157',
               'email':'oanhle@icsc.vn',                 
               }
    address.append(adrr2)
    e = u'khách hàng %s'%i
    results = {
           'web_id':i,
           'name':e.encode('utf8'),
           'street':f.encode('utf8'),
           'state_id':60, # id này là id của state mà web nhận từ odoo trước đó
           'country_id':243, # id cua country mà web nhận từ odoo trước đó
           'phone':'0988992157',
           'email':'oanhle@icsc.vn',
           'address':address,  
           'parent_id':False,
           'account':'login%s'%i,  #day la account cua khach hang chinh, neu khong co de False  
           'password':'login%s'%i  ,
           'month_of_birth':'11',#bat buoc 2 so
           'year_of_birth':2016,
           'day_of_birth':12,
           'gender':'male', #Nam trong 3 gia tri nay male, female, confiden
           'signature':'abcndsda', #chu ky
           'register_date':'2016-01-25 01:05:00', # format nhu vay
           'income_monthly':100000000, # thu nhap binh quan/thang,
           'last_day_of_month':31 ,#ngay cuoi cung cua thang ví dụ tháng 2 có 28, năm nhuận thì 29, tháng 1 có 31 ngày.....,
           'avantar_link':'link_image' #duong dan fpt hinh anh ca nhan
           }
    array = json.dumps(results)  
    print(" [x] Requesting for customer register (%s)"%(array))
    channel.basic_publish(exchange='website_customer_logs',
              routing_key='website_customer',
              body=array,
              properties=pika.BasicProperties(
                 delivery_mode = 2, # make message persistent
              ))
    print(" [x] Sent %r" % array)
connection.close()

