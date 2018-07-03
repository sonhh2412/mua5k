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
from openerp.addons.odoo_sync.rabbitmq import RabbitMQ
import json
from openerp import api, _
from openerp.tools import DEFAULT_SERVER_DATE_FORMAT, DEFAULT_SERVER_DATETIME_FORMAT
import datetime
import time
from dateutil.relativedelta import relativedelta
import calendar

MONTH_SELECTION= [('01','January'), 
                  ('02','February'), 
                  ('03','March'), 
                  ('04','April'), 
                  ('05','May'), 
                  ('06','June'),
                  ('07','July'), 
                  ('08','August'), 
                  ('09','September'), 
                  ('10','October'), 
                  ('11','November'), 
                  ('12','December')]

class date_of_birth(osv.osv):
    _name = "date.of.birth"
    _columns = {
                'name': fields.char('Name'),
                'value': fields.integer('Value')
                }
date_of_birth()
    
    
class res_partner(osv.osv):
    _inherit = "res.partner"
    
    def _day_of_birth(self, cr, uid, context=None):
        res = []
        for i in range(1, 32):
            res.append((i, '%s' % str(i)))
        return res

    _columns = {
                'website_id': fields.char('Id on Website'),
                'account': fields.char('Account on website'),
                'district_id': fields.many2one("res.district", 'District'),
                'ward_id': fields.many2one("res.ward", 'Ward'),
                'birthday': fields.date('Birth Date'),
                'month_of_birth':fields.selection(MONTH_SELECTION, 'Month'),
                'year_of_birth': fields.selection([(num, str(num)) for num in range(1900, (datetime.datetime.now().year)+1 )], 'Year'),
                'day_of_birth': fields.many2one('date.of.birth', 'Day'),
                'last_day_of_month': fields.integer('Last day'),
                }
    
    def onchange_month_year(self, cr, uid, ids, month, year, context=None):
        if not month or not year:
            return {}
        result = {}
        maxday = calendar.monthrange(year,int(month))[1]
        result['last_day_of_month'] = maxday
        if month and year:
            result['day_of_birth'] = self.pool['ir.model.data'].get_object_reference(cr, uid, 'odoo_sync', 'date_of_birth_1_default')[1]
        else:
            result['day_of_birth'] = False
        return {'value': result}
    
    
    def makeDataQueueforUnlink(self, cr, uid, states, types ):  
        vals = {
                "id": states.ids,
                'type':types,
                }  
        return json.dumps({'jdata': vals})       
    
    
    def makeDataQueue(self, cr, uid, partner, types ):  
        if types!='deleteMQ':
            parent_id = False
            parent_name = ""
            if partner.parent_id:
                parent_id = partner.parent_id.id     
                parent_name = partner.parent_id.name.encode('utf8')

            vals = {
                    "id": partner.id, 
                    "name": partner.name.encode('utf8') or "",               
                    'type':types,
                    'street':partner.street and partner.street.encode('utf8') or "",
                    'street2':partner.street2 and partner.street2.encode('utf8') or "",
                    'city':partner.city and partner.city.encode('utf8') or "",
                    'stateId':partner.state_id and partner.state_id.id or False ,
                    'stateName':partner.state_id and partner.state_id.id or "63",
                    'countryID':partner.country_id and partner.country_id.id or "243" ,
                    'countryName':partner.country_id and partner.country_id.id or "",
                    'phone':partner.phone or "",
                    "mobile":partner.mobile or "",
                    "jobPosition":partner.function and partner.function.encode('utf8') or "",
                    "fax":partner.fax or "",
                    "email": partner.email or "",
                    'title':partner.title and partner.title.name.encode('utf8') or "",
                    "comment":partner.comment and partner.comment.encode('utf8') or "",               
                    'parentId':parent_id,
                    'parent_name':parent_name or "",
                    'login':partner.login or "",
                    'password':partner.password or "",
                    'avantar_link':partner.avantar_link or "",
                    'website_id': partner.website_id,
                    'gender' : partner.gender or 'confiden',
                    'income_monthly' : partner.income_monthly or "0",
                    'year_of_birth' : partner.year_of_birth or 1990,
                    'month_of_birth' : partner.month_of_birth or '01',
                    'day_of_birth' : partner.day_of_birth.name or '01',
                    'signature' : partner.signature or '',
                    }
        else:
            vals = {
                    "id": [partner.id],
                    'type':types,
                    }  
        return json.dumps({'jdata': vals})        
    
    def createRabbitMQPrivate(self, cr, uid, partners,types ):
        try:
            host = self.pool.get('general.synchronization').getConfiguration(cr, uid) 
            if host:  
                credentials = pika.PlainCredentials(host[1], host[2])
                connection = pika.BlockingConnection(pika.ConnectionParameters(
                    host=host[0],port=host[3], virtual_host=host[4],credentials=credentials))   
                channel = connection.channel()
                channel.queue_declare(queue='customer',durable=True)
                channel.exchange_declare(exchange='customer_logs',
                                 exchange_type='fanout')
                channel.queue_bind(exchange='customer_logs',
                           queue='customer')
                for partner in partners:
                    
                    message = "%s"%(self.makeDataQueue(cr, uid, partner, types))
                    channel.basic_publish(exchange='customer_logs',
                              routing_key='customer',
                              body=message,
                              properties=pika.BasicProperties(
                                 delivery_mode = 2, # make message persistent
                              ))
                    print(" [x] Sent %r" % message)
                connection.close()
                return True
            return True
        except:
            return True
        
    def makeDataQueueWaitingSync(self, cr, uid, datas, sync_id , types): 
        ids = map(lambda x: x.id, datas)
        max_recipients = 300
        chunks = [ids[x:x + max_recipients] for x in xrange(0, len(ids), max_recipients)]
        is_delete = True if types=="deleteMQ" else False
        for chunk in chunks:
            values = {
                                    'list_ids': [(4, id) for id in chunk],
                                    'sync_id':sync_id,
                                    'name':chunk,
                                    'is_delete': is_delete,
                     } 
            check_exists = self.pool.get('general.partner.queue').search(cr, uid, [('name','=',str(chunk)),('sync_id','=',sync_id),('is_delete','=',is_delete)])
            if not check_exists:
                self.pool.get('general.partner.queue').create(cr, uid, values)
        return True
    
    # function nay dung re-sync cho cac case fail
    def createRabbitMQfO(self, cr, uid, partners, types):
        api = RabbitMQ()
        return api.createRabbitMQfO(cr, uid, partners, self, self.pool.get('general.synchronization'), 'customer', 'customer_logs', types)
    
       
    def createRabbitMQ(self, cr, uid, partners, types):
        api = RabbitMQ()
        if types != 'deleteMQ':
            return api.createRabbitMQ(cr, uid, partners, self, self.pool.get('general.synchronization'), 'customer', 'customer_logs', types)
        return api.createRabbitMQforUnlink(cr, uid, partners, self, self.pool.get('general.synchronization'), 'customer', 'customer_logs', types)
    
    def write(self, cr, uid, ids, vals, context=None):
        if isinstance(ids, (int, long)):
            ids = [ids]
        res = super(res_partner, self).write(cr, uid, ids, vals, context=context)
        partners_ids = map(lambda x: x.id, filter(lambda x: x.website_id and not x.parent_id, self.browse(cr, uid, ids)))
        if partners_ids:
            partners = self.browse(cr, uid, partners_ids)
            self.createRabbitMQ(cr, uid, partners,"updateMQ")
        return res
    
    
    def unlink(self, cr, uid, ids, context=None):
        if isinstance(ids, (int, long)):
            ids = [ids]
        partners_ids = map(lambda x: x.id, filter(lambda x: x.website_id, self.browse(cr, uid, ids)))
        if partners_ids:
            partners = self.browse(cr, uid, partners_ids)
            self.createRabbitMQ(cr, uid, partners, "deleteMQ")
        res = super(res_partner, self).unlink(cr, uid, ids,  context=context)
        return res
    
    @api.cr_uid_ids_context
    def action_set_partner(self, cr, uid, vals, context=None):        
        state_id = False
  
        state = vals.get('state_id') or False

        if state:
            state_id = self.pool.get('res.country.state').search(cr, uid, [('id','=', state)])
        country_id = False
        country = vals.get('country_id') or False
        if country:
            country_id = self.pool.get('res.country').search(cr, uid, [('id','=', country)])
        parent_id = False
        parent_account = vals.get('parent_id') or False
        if parent_account:
            parent_id = self.search(cr, uid, [('login','=', parent_account)])
        datestr = datetime.datetime.utcnow().strftime('%d-%m-%Y %H:%M:%S')
        if vals.get('register_date'):
            dateorder = datetime.datetime.strptime(vals.get('register_date'), DEFAULT_SERVER_DATETIME_FORMAT)
            zonetime = dateorder - datetime.timedelta(hours=7)
            datestr = datetime.datetime.strftime(zonetime, DEFAULT_SERVER_DATETIME_FORMAT)   
        day_ids = self.pool.get('date.of.birth').search(cr, uid, [('value','=',vals.get('day_of_birth') )])
        results = {
           'website_id':vals.get('web_id') or False,
           'name':vals.get('name') or "unknown from webiste",
           'street':vals.get('street') or False,
           'state_id':state_id and state_id[0] or False, # id này là id của state mà web nhận từ odoo trước đó
           'country_id':country_id and country_id[0] or 253, # id cua country mà web nhận từ odoo trước đó
           'phone':vals.get('phone') or False,
           'email':vals.get('email') or False,    
           'login': vals.get('account') or False,
           'parent_id': parent_id and parent_id[0] or False,
           'customer':True,
           'is_company':True,
           'password':vals.get('password') or False,
           'password_temp' : vals.get('password') or False,
           'month_of_birth':vals.get('month_of_birth') or False,
           'year_of_birth':vals.get('year_of_birth') or False,
           'day_of_birth':day_ids and day_ids[0] or False,
           'gender':vals.get('gender') or False,
           'signature':vals.get('signature') or False,
           'register_date':datestr,
           'income_monthly':vals.get('income_monthly') or False,
           'last_day_of_month':vals.get('last_day_of_month') or 30,
           'avantar_link':vals.get('avantar_link',False) or False
           }
        parent_of_address = False
        # check exists
        check_ids = self.search(cr, uid, [('login','=',vals.get('account')),('account','!=',False)])
        if not check_ids:
            check_ids = self.search(cr, uid, [('website_id','=',vals.get('web_id')),('website_id','!=',False)])
        
        if not check_ids:
            # tao khach hang
            partner_id = self.create(cr, uid, results)
            parent_of_address = partner_id
        else:
            self.write(cr, uid, check_ids, results)    
            parent_of_address = check_ids[0]    
        address = vals.get('address') or False        
        if address:
            
            try:
                address = eval(address)
            except:
                address = address
            for item in address:
                state_id = False
                state = item.get('state_id') or False
                if state:
                    state_id = self.pool.get('res.country.state').search(cr, uid, [('id','=', state)])
                country_id = False
                country = item.get('country_id') or False
                if country:
                    country_id = self.pool.get('res.country').search(cr, uid, [('id','=', country)])
                address_vals = {
                   'website_id':item.get('website_id') or False,
                   'name':item.get('name') or "unknown address from webiste",
                   'street':item.get('street') or False,
                   'state_id':state_id and state_id[0] or False, # id này là id của state mà web nhận từ odoo trước đó
                   'country_id':country_id and country_id[0] or 253, # id cua country mà web nhận từ odoo trước đó
                   'phone':item.get('phone') or False,
                   'email':item.get('email') or False,  
                   'parent_id': parent_of_address,
                   'customer':False
                   }
                
                # check address exists
                add_ids = self.search(cr, uid, [('website_id','!=',False),('website_id','=',item.get('website_id')),('parent_id','=',parent_of_address)])                 
                if not add_ids:
                    add_ids = self.search(cr, uid, [('street','!=',False),('street','=',item.get('street')),('parent_id','=',parent_of_address)])                   
                if add_ids:
                    self.write(cr, uid, add_ids, address_vals)
                else:
                    self.create(cr, uid, address_vals)
        return True
    
res_partner()

class res_partner_history_exchange(osv.osv):
    _inherit = 'res.partner.history.exchange'
    
    @api.cr_uid_ids_context
    def action_create_transaction(self, cr, uid, vals, context=None):
        
        if vals.get('partner_id',False):
            try:
                partner_ids = eval(vals.get('partner_id',False))
            except:
                partner_ids = vals.get('partner_id',False)
            partner_id = self.pool.get('res.partner').search(cr, uid, [('website_id','=',partner_ids[0]),('website_id','!=',False)])
            if not partner_id:
                partner_id = self.pool.get('res.partner').search(cr, uid, [('login','=',partner_ids[1])])
            if not partner_id:
                partner_id = self.pool.get('res.partner').create(cr, uid, {'name':partner_ids[1],'login':partner_ids[1],
                                                                           'website_id':partner_ids[0],'customer':True
                                                                           })
            else:
                partner_id = partner_id[0]
            dateorder = datetime.datetime.strptime(vals.get('date_exchange'), DEFAULT_SERVER_DATETIME_FORMAT)
            zonetime = dateorder - datetime.timedelta(hours=7)
            datestr = datetime.datetime.strftime(zonetime, DEFAULT_SERVER_DATETIME_FORMAT)   
            values = {
                       'partner_id':partner_id ,
                       'type_exchange':vals.get('type_exchange','addition'),
                       'amount_exchange':vals.get('amount_exchange',0),
                       'date_exchange':datestr,
                       'millisecond': vals.get('millisecond', 0),
                      }
       
            self.create(cr, uid, values)
        return True
    
    
class res_partner_history_login(osv.osv):
    _inherit = 'res.partner.history.login'
    
    @api.cr_uid_ids_context
    def action_create_history(self, cr, uid, vals, context=None):
        
        if vals.get('partner_id',False):

            try:
                partner_ids = eval(vals.get('partner_id',False))
            except:
                partner_ids = vals.get('partner_id',False)
            partner_id = self.pool.get('res.partner').search(cr, uid, [('website_id','=',partner_ids[0]),('website_id','!=',False)])
            if not partner_id:
                partner_id = self.pool.get('res.partner').search(cr, uid, [('login','=',partner_ids[1])])
            if not partner_id:
                partner_id = self.pool.get('res.partner').create(cr, uid, {'name':partner_ids[1],'login':partner_ids[1],
                                                                           'website_id':partner_ids[0],'customer':True
                                                                           })
            else:
                partner_id = partner_id[0]
            dateorder = datetime.datetime.strptime(vals.get('date_login'), DEFAULT_SERVER_DATETIME_FORMAT)
            zonetime = dateorder - datetime.timedelta(hours=7)
            datestr = datetime.datetime.strftime(zonetime, DEFAULT_SERVER_DATETIME_FORMAT)   
            values = {
                       'partner_id':partner_id ,
                       'ip':vals.get('ip',''),
                       'date':datestr
                      }
       
            self.create(cr, uid, values)
        return True
    
    