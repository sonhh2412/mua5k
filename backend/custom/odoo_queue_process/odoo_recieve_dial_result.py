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
import ConfigParser
import threading

import json
Config = ConfigParser.ConfigParser()

Config.read("/home/user/workspace/10k/backend/custom/odoo_queue_process/config.ini")



def ConfigSectionMap(section):
    dict1 = {}
    options = Config.options(section)
    for option in options:
        try:
            dict1[option] = Config.get(section, option)
            if dict1[option] == -1:
                print ("skip: %s" % option)
        except:
            print("exception on %s!" % option)
            dict1[option] = None
    return dict1
#web
rabbit_host= ConfigSectionMap("ClusterOne")['host']
rabbit_user = ConfigSectionMap("ClusterOne")['user']
rabbit_password = ConfigSectionMap("ClusterOne")['password']
prefetchCount =  ConfigSectionMap("ClusterOne")['prefetch_count_dial']
#odoo
uid = ConfigSectionMap("OdooAccount")['uid']
password = ConfigSectionMap("OdooAccount")['password']
db = ConfigSectionMap("OdooAccount")['db']
port = ConfigSectionMap("OdooAccount")['port']
host = ConfigSectionMap("OdooAccount")['host']

#function luu data odoo
def odoo_DialSession(addr='http://127.0.0.1', port=8069, dbname='mycompany', uid=1, password='admin', data={}):
    time.sleep(1)
    try:
        result = xmlrpclib.ServerProxy('%s:%s/xmlrpc/object' % (addr, port)).execute(
            dbname, int(uid), password, 'general.session.dial', 'write', [1], data )    
        return result
    except:
        return False
    
#xu ly doc du lieu ve tu queue  
class ThreadedSessionDial_worker(threading.Thread):
    def callback(self, ch, method, properties, body):
        time.sleep( body.count('.') )  
        result = odoo_DialSession(addr=host, port=port, dbname=db, uid=uid, data=body)
        if result:
            ch.basic_ack(delivery_tag = method.delivery_tag)        
            
    def __init__(self):
        threading.Thread.__init__(self)
        try:
            self.credentials = pika.PlainCredentials(rabbit_user, rabbit_password)
            self.connection = pika.BlockingConnection(pika.ConnectionParameters(
                    host=rabbit_host,credentials=self.credentials))            
            self.channel = self.connection.channel()
            self.channel.queue_declare(queue='website_dial_result',durable=True)
            self.channel.exchange_declare(exchange='website_dial_result_logs',
                             exchange_type='fanout')
            self.channel.queue_bind(exchange='website_dial_result_logs',
                       queue='website_dial_result')
            self.channel.basic_qos(prefetch_count=int(prefetchCount))
            self.channel.basic_consume(self.callback, queue='website_dial_result')
        except:
            pass

    def run(self):
        print 'Bat dau lay du lieu ve'       
        try:
            print 'Bat dau lay du lieu ve'       
            self.channel.start_consuming()
        except:
            pass

for _ in range(int(ConfigSectionMap("OdooAccount")['thread'])):
    print 'Thread hoat dong'
    try:
        td = ThreadedSessionDial_worker()
        td.start()
    except:
        pass


    


# send message
