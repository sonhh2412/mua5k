# -*- coding: utf-8 -*-

from openerp.osv import osv, fields
from openerp.api import Environment
from openerp import api, _
from openerp.addons.odoo_sync.rabbitmq import RabbitMQ
from datetime import datetime, timedelta
from openerp.tools import DEFAULT_SERVER_DATETIME_FORMAT
import threading
import logging
import json
import time

log = logging.getLogger(__name__)
SELECTION_TYPE_NOTIFY = [
    ('all', 'Send to all customers'),
    ('many', 'Send to many customers'),
    ('once', 'Send to one customer')
]

class notify_to_customers(osv.osv):
    _name = 'notify.to.customers'
    _description = 'Notify To Customers'
    
    _columns = {
        'name': fields.char('Name'),
        'content': fields.html('Notify Content'),
        'type': fields.selection(SELECTION_TYPE_NOTIFY, 'Type notify'),
        'partner_id': fields.many2one('res.partner', 'Customer receive notify', domain="[('customer','=',True)]"),
        'partner_ids': fields.many2many('res.partner', 'notify_res_partner_rel', 'notify_id', 'partner_id', 'Customers receive notify', domain="[('customer','=',True)]"),
        'detail_ids': fields.one2many('notify.to.customers.detail', 'ref_id', 'Detail Notify'),
        'state': fields.selection([('new','New'), ('waiting','Waiting'), ('pushing','Pushing'), ('done','Done')], 'State')
    }
    
    _defaults = {
        'state': 'new',
        'type': 'all',
    }
    
    def btn_send_notify(self, cr, uid, ids, context=None):
        thread_name = "%s_Thread-Notify"%cr.dbname
        self.write(cr, uid, ids, {'state':'waiting'}, context=context)
        exits = filter(lambda x: x.name == thread_name, threading.enumerate())
        if exits: 
            return True
        return self.send_notify(cr, uid, ids, context)
    
    def cron_send_notify(self, cr, uid, ids=False, context=None):
        thread_name = "%s_Thread-Notify"%cr.dbname
        exits = filter(lambda x: x.name == thread_name, threading.enumerate())
        if exits: 
            return True
        notify_ids = self.search(cr, uid, [('state', 'in', ('waiting', 'pushing'))], limit = 1)
        if notify_ids:
            self.send_notify(cr, uid, notify_ids, context) 
        return True
    
    def send_notify(self, cr, uid, ids, context=None):
        try:
            threaded_calculation = threading.Thread(target=self.thread_send_notify, args=(cr, uid, ids, context))
            threaded_calculation.setName("%s_Thread-Notify"%cr.dbname)
            threaded_calculation.start()
        except Exception as e:
            log.exception(e)
            cr.rollback()
        return {
            'type': 'ir.actions.client',
            'tag': 'reload',
        }
    
    def thread_send_notify(self, cr, uid, ids, context=None):
        detail_obj = self.pool.get('notify.to.customers.detail')
        partner_obj = self.pool.get('res.partner')
        number_limit = 50
        with Environment.manage():
            try:
                new_cr = self.pool.cursor()
                for data in self.browse(new_cr, uid, ids, context=context):
                    self.createRabbitMQforNotifyContent(new_cr, uid, [self.browse(new_cr, uid, data.id)], "createMQ")
                    new_cr.commit()
                    time.sleep(1)
                    self.write(new_cr, uid, [data.id], {'state':'pushing'}, context=context)
                    new_cr.commit()
                    customer_ids = []
                    if data.type == 'all':
                        customer_ids += partner_obj.search(new_cr, uid, [('customer','=',True)], context=context)
                    elif data.type == 'many':
                        customer_ids += data.partner_ids.ids
                    elif data.type  == 'once':
                        customer_ids += [data.partner_id.id]
                    received_ids = map(lambda x: x.partner_id.id if x.partner_id else False, data.detail_ids)
                    customer_ids = [x for x in customer_ids if x not in received_ids]
                    list_website_ids = [x.website_id for x in partner_obj.browse(new_cr, uid, customer_ids, context=context)]
                    ranger = len(customer_ids) % number_limit and  (len(customer_ids) / number_limit) + 1 or len(customer_ids) / number_limit
                    for index in range(ranger):
                        max_item = (index+1) * number_limit > len(customer_ids) and len(customer_ids) or (index+1) * number_limit
                        partner_ids = customer_ids[index*number_limit:max_item]
                        website_ids = list_website_ids[index*number_limit:max_item]
                        for partner_id in partner_ids:
                            detail_obj.create(new_cr, uid, {'partner_id': partner_id, 'ref_id':data.id}, context=context)
                            new_cr.commit()
                        message = self.makeDataQueueforSendNotify(new_cr, uid, data, website_ids, "createMQ")
                        self.createRabbitMQforSendNotify(new_cr, uid, [self.browse(new_cr, uid, data.id)], message, "createMQ")
                        new_cr.commit()
                        time.sleep(1)
                    self.write(new_cr, uid, [data.id], {'state':'done'}, context=context)
                    new_cr.commit()
            except Exception as e:
                log.exception(e)
                new_cr.commit()
                log.info(e)
            finally:
                new_cr.close()
        return True
    
    def makeDataQueueforSendNotify(self, cr, uid, data, partner_ids, types):
        vals = {
                "partner_ids": partner_ids,
                "notify_id": data.id,
                "type": types,
                }
        return json.dumps({'jdata': vals})
    
    def makeDataQueueWaitingSyncSendNotify(self, cr, uid, datas, sync_id, message, types ):
        ids = map(lambda x: x.id, datas)
        max_recipients = 5
        chunks = [ids[x:x + max_recipients] for x in xrange(0, len(ids), max_recipients)]
        for chunk in chunks:
            values = {'sync_id':sync_id, 'name':chunk, 'message': message}
            check_exists = self.pool.get('general.send.notify.queue').search(cr, uid, [('name','=',str(chunk)),('sync_id','=',sync_id),('message','=',message)])
            if not check_exists:
                self.pool.get('general.send.notify.queue').create(cr, uid, values)
        return True
    
    def createRabbitMQforSendNotify(self, cr, uid, notifys, message, types):
        api = RabbitMQ()
        return api.createRabbitMQforSendNotify(cr, uid, notifys, message, self, self.pool.get('general.synchronization'), 'send_notify', 'send_notify_logs', types)
    
    def makeDataQueueforNotifyContent(self, cr, uid, data, types):
        date_create = datetime.strptime(data.create_date, DEFAULT_SERVER_DATETIME_FORMAT)
        zonetime = date_create + timedelta(hours=7)
        str_date_create = datetime.strftime(zonetime, DEFAULT_SERVER_DATETIME_FORMAT)
        vals = {
                "id": data.id,
                "title": data.name,
                "content": data.content,
                "type_notify": data.type,
                "date_create": str_date_create,
                "type": types,
                }
        return json.dumps({'jdata': vals})
    
    def makeDataQueueWaitingSyncNotifyContent(self, cr, uid, datas, sync_id, types):
        ids = map(lambda x: x.id, datas)
        max_recipients = 5
        chunks = [ids[x:x + max_recipients] for x in xrange(0, len(ids), max_recipients)]
        for chunk in chunks:
            values = {'sync_id':sync_id, 'name':chunk}
            check_exists = self.pool.get('general.notify.content.queue').search(cr, uid, [('name','=',str(chunk)),('sync_id','=',sync_id)])
            if not check_exists:
                self.pool.get('general.notify.content.queue').create(cr, uid, values)
        return True
    
    def createRabbitMQforNotifyContent(self, cr, uid, notifys, types):
        api = RabbitMQ()
        return api.createRabbitMQforNotifyContent(cr, uid, notifys, self, self.pool.get('general.synchronization'), 'notify_content', 'notify_content_logs', types)
    
notify_to_customers()

class notify_to_customers_detail(osv.osv):
    _name = 'notify.to.customers.detail'
    _description = 'Notify To Customers Detail'
    
    _columns = {
        'ref_id': fields.many2one('notify.to.customers', 'Reference Id', ondelete='cascade'),
        'partner_id': fields.many2one('res.partner', 'Customer'),
    }
    
notify_to_customers_detail()