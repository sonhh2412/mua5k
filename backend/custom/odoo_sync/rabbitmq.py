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

class RabbitMQ(object):
    
    def createRabbitMQDial(self, cr, uid, datas, object_pool, sync_pool, queueName, exchangeName, types):
        try:
            host = sync_pool.getConnectQueue(cr, uid)
            if host:
                credentials = pika.PlainCredentials(host[1], host[2])
                connection = pika.BlockingConnection(pika.ConnectionParameters(
                    host=host[0],port=host[3], virtual_host=host[4],credentials=credentials)) 
                channel = connection.channel()
                channel.queue_declare(queue=queueName,durable=True)
                channel.exchange_declare(exchange=exchangeName,
                                 exchange_type='fanout')
                channel.queue_bind(exchange=exchangeName,
                           queue=queueName)
                for data in datas:
                    message = "%s"%(object_pool.makeDataQueueDial(cr, uid, data, types))
                    channel.basic_publish(exchange=exchangeName,
                              routing_key=queueName,
                              body=message,
                              properties=pika.BasicProperties(
                                 delivery_mode = 2, # make message persistent
                              ))
                    print(" [x] Sent %r" % message)
                connection.close()
                return True
            return False
        except:
            sync_id = sync_pool.getConnectQueueId(cr, uid)
            if sync_id:
                object_pool.makeDataQueueWaitingSyncDial(cr, uid, datas, sync_id, types)
            return False
        
    def createRabbitMQDialfO(self, cr, uid, datas, object_pool, sync_pool, queueName, exchangeName, types):
        try:
            host = sync_pool.getConnectQueue(cr, uid)
            if host:
                credentials = pika.PlainCredentials(host[1], host[2])
                connection = pika.BlockingConnection(pika.ConnectionParameters(
                    host=host[0],port=host[3], virtual_host=host[4],credentials=credentials)) 
                channel = connection.channel()
                channel.queue_declare(queue=queueName,durable=True)
                channel.exchange_declare(exchange=exchangeName,
                                 exchange_type='fanout')
                channel.queue_bind(exchange=exchangeName,
                           queue=queueName)
                for data in datas:
                    message = "%s"%(object_pool.makeDataQueueDial(cr, uid, data, types))
                    channel.basic_publish(exchange=exchangeName,
                              routing_key=queueName,
                              body=message,
                              properties=pika.BasicProperties(
                                 delivery_mode = 2, # make message persistent
                              ))
                    print(" [x] Sent %r" % message)
                connection.close()
                return True
            return False
        except:
            return False
        
    def createRabbitMQ(self, cr, uid, datas, object_pool, sync_pool, queueName, exchangeName, types):
        try:
            host = sync_pool.getConnectQueue(cr, uid)
            if host:
                credentials = pika.PlainCredentials(host[1], host[2])
                connection = pika.BlockingConnection(pika.ConnectionParameters(
                    host=host[0],port=host[3], virtual_host=host[4],credentials=credentials)) 
                channel = connection.channel()
                channel.queue_declare(queue=queueName,durable=True)
                channel.exchange_declare(exchange=exchangeName,
                                 exchange_type='fanout')
                channel.queue_bind(exchange=exchangeName,
                           queue=queueName)
                for data in datas:
                    message = "%s"%(object_pool.makeDataQueue(cr, uid, data, types))
                    channel.basic_publish(exchange=exchangeName,
                              routing_key=queueName,
                              body=message,
                              properties=pika.BasicProperties(
                                 delivery_mode = 2, # make message persistent
                              ))
                    print(" [x] Sent %r" % message)
                connection.close()
                return True
            return False
        except:
            sync_id = sync_pool.getConnectQueueId(cr, uid)
            if sync_id:
                object_pool.makeDataQueueWaitingSync(cr, uid, datas, sync_id, types)
            return False
    #Xoa 1 luc nhieu record  
    def createRabbitMQforUnlink(self, cr, uid, datas, object_pool, sync_pool, queueName, exchangeName, types):
        try:
            host = sync_pool.getConnectQueue(cr, uid)
            if host:
                credentials = pika.PlainCredentials(host[1], host[2])
                connection = pika.BlockingConnection(pika.ConnectionParameters(
                    host=host[0],port=host[3], virtual_host=host[4],credentials=credentials)) 
                channel = connection.channel()
                channel.queue_declare(queue=queueName,durable=True)
                channel.exchange_declare(exchange=exchangeName,
                                 exchange_type='fanout')
                channel.queue_bind(exchange=exchangeName,
                           queue=queueName)
                message = "%s"%(object_pool.makeDataQueueforUnlink(cr, uid, datas, types))
                channel.basic_publish(exchange=exchangeName,
                          routing_key=queueName,
                          body=message,
                          properties=pika.BasicProperties(
                             delivery_mode = 2, # make message persistent
                          ))
                print(" [x] Sent %r" % message)
                connection.close()
                return True
            return False
        except:
            sync_id = sync_pool.getConnectQueueId(cr, uid)
            if sync_id:
                object_pool.makeDataQueueWaitingSync(cr, uid, datas, sync_id, types)
            return False
        
        
    #Xu ly san pham hot  
    def createRabbitMQforHotProducts(self, cr, uid, datas, object_pool, sync_pool, queueName, exchangeName, types):
        try:
            host = sync_pool.getConnectQueue(cr, uid)
            if host:
                credentials = pika.PlainCredentials(host[1], host[2])
                connection = pika.BlockingConnection(pika.ConnectionParameters(
                    host=host[0],port=host[3], virtual_host=host[4],credentials=credentials)) 
                channel = connection.channel()
                channel.queue_declare(queue=queueName,durable=True)
                channel.exchange_declare(exchange=exchangeName,
                                 exchange_type='fanout')
                channel.queue_bind(exchange=exchangeName,
                           queue=queueName)
                for data in datas:
                    message = "%s"%(object_pool.makeDataQueueforHotProducts(cr, uid, data, types))
                    channel.basic_publish(exchange=exchangeName,
                              routing_key=queueName,
                              body=message,
                              properties=pika.BasicProperties(
                                 delivery_mode = 2, # make message persistent
                              ))
                    print(" [x] Sent %r" % message)
                connection.close()
                return True
            return False
        except:
            sync_id = sync_pool.getConnectQueueId(cr, uid)
            if sync_id:
                object_pool.makeDataQueueWaitingSyncHotProduct(cr, uid, datas, sync_id, types)
            return False
        
    #Xu ly phien san pham  
    def createRabbitMQforSessionProducts(self, cr, uid, datas, object_pool, sync_pool, queueName, exchangeName, types):
        try:
            host = sync_pool.getConnectQueue(cr, uid)
            if host:
                credentials = pika.PlainCredentials(host[1], host[2])
                connection = pika.BlockingConnection(pika.ConnectionParameters(
                    host=host[0],port=host[3], virtual_host=host[4],credentials=credentials)) 
                channel = connection.channel()
                channel.queue_declare(queue=queueName,durable=True)
                channel.exchange_declare(exchange=exchangeName,
                                 exchange_type='fanout')
                channel.queue_bind(exchange=exchangeName,
                           queue=queueName)
                for data in datas:
                    message = "%s"%(object_pool.makeDataQueueforSessionProducts(cr, uid, data, types))
                    channel.basic_publish(exchange=exchangeName,
                              routing_key=queueName,
                              body=message,
                              properties=pika.BasicProperties(
                                 delivery_mode = 2, # make message persistent
                              ))
                    print(" [x] Sent %r" % message)
                connection.close()
                return True
            return False
        except:
            sync_id = sync_pool.getConnectQueueId(cr, uid)
            if sync_id:
                object_pool.makeDataQueueWaitingSyncSessionProduct(cr, uid, datas, sync_id, types)
            return False
        
    #Xử lý khi xóa phiên sản phẩm
    def createRabbitMQforSessionProductsUnlink(self, cr, uid, datas, object_pool, sync_pool, queueName, exchangeName, types):
        try:
            host = sync_pool.getConnectQueue(cr, uid)
            if host:
                credentials = pika.PlainCredentials(host[1], host[2])
                connection = pika.BlockingConnection(pika.ConnectionParameters(
                    host=host[0],port=host[3], virtual_host=host[4],credentials=credentials)) 
                channel = connection.channel()
                channel.queue_declare(queue=queueName,durable=True)
                channel.exchange_declare(exchange=exchangeName,
                                 exchange_type='fanout')
                channel.queue_bind(exchange=exchangeName,
                           queue=queueName)
                message = "%s"%(object_pool.makeDataQueueforSessionProductsUnlink(cr, uid, datas, types))
                channel.basic_publish(exchange=exchangeName,
                          routing_key=queueName,
                          body=message,
                          properties=pika.BasicProperties(
                             delivery_mode = 2, # make message persistent
                          ))
                print(" [x] Sent %r" % message)
                connection.close()
                return True
            return False
        except:
            sync_id = sync_pool.getConnectQueueId(cr, uid)
            if sync_id:
                object_pool.makeDataQueueWaitingSyncSessionProduct(cr, uid, datas, sync_id, types)
            return False
            
    #Xử lý tạo tặng K
    def createRabbitMQforGiveK(self, cr, uid, datas, object_pool, sync_pool, queueName, exchangeName, types):
        try:
            host = sync_pool.getConnectQueue(cr, uid)
            if host:
                credentials = pika.PlainCredentials(host[1], host[2])
                connection = pika.BlockingConnection(pika.ConnectionParameters(
                    host=host[0],port=host[3], virtual_host=host[4],credentials=credentials)) 
                channel = connection.channel()
                channel.queue_declare(queue=queueName,durable=True)
                channel.exchange_declare(exchange=exchangeName,
                                 exchange_type='fanout')
                channel.queue_bind(exchange=exchangeName,
                           queue=queueName)
                for data in datas:
                    message = "%s"%(object_pool.makeDataQueueforGiveK(cr, uid, data, types))
                    channel.basic_publish(exchange=exchangeName,
                              routing_key=queueName,
                              body=message,
                              properties=pika.BasicProperties(
                                 delivery_mode = 2, # make message persistent
                              ))
                    print(" [x] Sent %r" % message)
                connection.close()
                return True
            return False
        except Exception as ex:
            sync_id = sync_pool.getConnectQueueId(cr, uid)
            if sync_id:
                object_pool.makeDataQueueWaitingSyncGiveK(cr, uid, datas, sync_id, types)
            return False
        
    #Xử lý khi xóa Tang K
    def createRabbitMQforGiveKUnlink(self, cr, uid, datas, object_pool, sync_pool, queueName, exchangeName, types):
        try:
            host = sync_pool.getConnectQueue(cr, uid)
            if host:
                credentials = pika.PlainCredentials(host[1], host[2])
                connection = pika.BlockingConnection(pika.ConnectionParameters(
                    host=host[0],port=host[3], virtual_host=host[4],credentials=credentials)) 
                channel = connection.channel()
                channel.queue_declare(queue=queueName,durable=True)
                channel.exchange_declare(exchange=exchangeName,
                                 exchange_type='fanout')
                channel.queue_bind(exchange=exchangeName,
                           queue=queueName)
                message = "%s"%(object_pool.makeDataQueueforGiveKUnlink(cr, uid, datas, types))
                channel.basic_publish(exchange=exchangeName,
                          routing_key=queueName,
                          body=message,
                          properties=pika.BasicProperties(
                             delivery_mode = 2, # make message persistent
                          ))
                print(" [x] Sent %r" % message)
                connection.close()
                return True
            return False
        except:
            sync_id = sync_pool.getConnectQueueId(cr, uid)
            if sync_id:
                object_pool.makeDataQueueWaitingSyncGiveK(cr, uid, datas, sync_id, types)
            return False

    #Xử lý tạo thông báo
    def createRabbitMQforNotifyContent(self, cr, uid, datas, object_pool, sync_pool, queueName, exchangeName, types):
        try:
            host = sync_pool.getConnectQueue(cr, uid)
            if host:
                credentials = pika.PlainCredentials(host[1], host[2])
                connection = pika.BlockingConnection(pika.ConnectionParameters(
                    host=host[0],port=host[3], virtual_host=host[4],credentials=credentials)) 
                channel = connection.channel()
                channel.queue_declare(queue=queueName,durable=True)
                channel.exchange_declare(exchange=exchangeName,
                                 exchange_type='fanout')
                channel.queue_bind(exchange=exchangeName,
                           queue=queueName)
                for data in datas:
                    message = "%s"%(object_pool.makeDataQueueforNotifyContent(cr, uid, data, types))
                    channel.basic_publish(exchange=exchangeName,
                              routing_key=queueName,
                              body=message,
                              properties=pika.BasicProperties(
                                 delivery_mode = 2, # make message persistent
                              ))
                    print(" [x] Sent %r" % message)
                connection.close()
                return True
            return False
        except Exception as ex:
            sync_id = sync_pool.getConnectQueueId(cr, uid)
            if sync_id:
                object_pool.makeDataQueueWaitingSyncNotifyContent(cr, uid, datas, sync_id, types)
            return False

    #Xử lý gửi thông báo
    def createRabbitMQforSendNotify(self, cr, uid, datas, message, object_pool, sync_pool, queueName, exchangeName, types):
        try:
            host = sync_pool.getConnectQueue(cr, uid)
            if host:
                credentials = pika.PlainCredentials(host[1], host[2])
                connection = pika.BlockingConnection(pika.ConnectionParameters(
                    host=host[0],port=host[3], virtual_host=host[4],credentials=credentials)) 
                channel = connection.channel()
                channel.queue_declare(queue=queueName,durable=True)
                channel.exchange_declare(exchange=exchangeName,
                                 exchange_type='fanout')
                channel.queue_bind(exchange=exchangeName,
                           queue=queueName)
                channel.basic_publish(exchange=exchangeName,
                          routing_key=queueName,
                          body=message,
                          properties=pika.BasicProperties(
                             delivery_mode = 2, # make message persistent
                          ))
                print(" [x] Sent %r" % message)
                connection.close()
                return True
            return False
        except Exception as ex:
            print ex
            sync_id = sync_pool.getConnectQueueId(cr, uid)
            if sync_id:
                object_pool.makeDataQueueWaitingSyncSendNotify(cr, uid, datas, sync_id, message, types)
            return False
    
    # createRabbitMQFromOdooQueue
    def createRabbitMQfO(self, cr, uid, datas, object_pool, sync_pool, queueName, exchangeName, types):
        try:
            host = sync_pool.getConnectQueue(cr, uid)
            if host:
                credentials = pika.PlainCredentials(host[1], host[2])
                connection = pika.BlockingConnection(pika.ConnectionParameters(
                    host=host[0],port=host[3], virtual_host=host[4],credentials=credentials))   
                channel = connection.channel()
                channel.queue_declare(queue=queueName,durable=True)
                channel.exchange_declare(exchange=exchangeName,
                                 exchange_type='fanout')
                channel.queue_bind(exchange=exchangeName,
                           queue=queueName)
                for data in datas:
                    message = "%s"%(object_pool.makeDataQueue(cr, uid, data, types))
                    channel.basic_publish(exchange=exchangeName,
                              routing_key=queueName,
                              body=message,
                              properties=pika.BasicProperties(
                                 delivery_mode = 2, # make message persistent
                              ))
                    print(" [x] Sent %r" % message)
                connection.close()
                return True
            return False
        except:
            return False

    # createRabbitMQFromOdooQueueDelelete
    def createRabbitMQfODel(self, cr, uid, message, sync_pool, queueName, exchangeName):
        try:
            host = sync_pool.getConnectQueue(cr, uid)
            if host:
                credentials = pika.PlainCredentials(host[1], host[2])
                connection = pika.BlockingConnection(pika.ConnectionParameters(
                    host=host[0],port=host[3], virtual_host=host[4],credentials=credentials)) 
                channel = connection.channel()
                channel.queue_declare(queue=queueName,durable=True)
                channel.exchange_declare(exchange=exchangeName,
                                 exchange_type='fanout')
                channel.queue_bind(exchange=exchangeName,
                           queue=queueName)
                channel.basic_publish(exchange=exchangeName,
                          routing_key=queueName,
                          body="%s"%message,
                          properties=pika.BasicProperties(
                             delivery_mode = 2, # make message persistent
                          ))
                print(" [x] Sent %r" % message)
                connection.close()
                return True
            return False
        except:
            return False




RabbitMQ()
