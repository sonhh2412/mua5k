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
from openerp import _
from openerp.exceptions import except_orm, Warning, RedirectWarning
from openerp.addons.odoo_sync.rabbitmq import RabbitMQ
import json

def callback(ch, method, properties, body):
        print(" [x] Received %r" % body)
        
class general_synchronization(osv.osv):
    _name = "general.synchronization"
    _description = "synchronization to Queue"
    _columns = {
                'name':fields.char('Host', required=True),
                'username':fields.char('User Name', required=True),
                'password':fields.char('Password', required=True),
                'port':fields.integer('Port', required=True),
                'virtual_host':fields.char('Virtual Host', required=True),
                'country_ids': fields.one2many('general.country.queue', 'sync_id', 'Countries'),
                'state_ids': fields.one2many('general.state.queue', 'sync_id', 'States'),
                'partner_ids': fields.one2many('general.partner.queue', 'sync_id', 'Partners'),
                'brand_ids': fields.one2many('general.brand.queue', 'sync_id', 'Brands'),
                'category_ids': fields.one2many('general.category.queue', 'sync_id', 'Categories'),
                'product_ids': fields.one2many('general.product.queue', 'sync_id', 'Products'),
                'sale_ids': fields.one2many('general.sale.queue', 'sync_id', 'Sale Orders'), 
                'hot_product_ids': fields.one2many('general.hot.product.queue','sync_id', 'Hot Products'),
                'session_product_ids': fields.one2many('general.session.product.queue','sync_id', 'Session Products')  ,
                'sale_dial_ids': fields.one2many('general.saledial.queue', 'sync_id', 'Sale Dial Orders'),   
                'convert_ids': fields.one2many('general.convert.queue', 'sync_id', 'Categories Convert'), 
                'knumber_ids': fields.one2many('general.knumber.queue', 'sync_id', 'Knumber Change'), 
                'give_k_ids': fields.one2many('general.give.k.queue', 'sync_id', 'Give K Change'),
                'content_notify_ids': fields.one2many('general.notify.content.queue', 'sync_id', 'Notify Content'),
                'notify_ids': fields.one2many('general.send.notify.queue', 'sync_id', 'Send Notify'),
                }
    _defaults = {
                 'name':'localhost',
                 'virtual_host':'/',
                 'port':5672
                 
                 }
    
    _sql_constraints = [
        ('name_uniq', 'unique (name)', 'The host for queue must be unique per configuration!'),
    ]
    
    def action_sync(self, cr, uid, pool):
        avaiable_ids = pool.search(cr, uid, [])
        if avaiable_ids:
            pool.createRabbitMQ(cr, uid, pool.browse(cr, uid, avaiable_ids),"syncAllMQ")
        return True
    
    def action_product_sync(self, cr, uid, pool):
        avaiable_ids = pool.search(cr, uid, [('sale_ok','=',True),('website_published','=',True)])
        if avaiable_ids:
            pool.createRabbitMQ(cr, uid, pool.browse(cr, uid, avaiable_ids),"syncAllMQ")
        return True
    
    def action_sync_convert_category(self, cr, uid, ids, context=None):
        return self.action_sync(cr, uid, self.pool.get('category.convert'))  
    
    def action_sync_country(self, cr, uid, ids, context=None):
        return self.action_sync(cr, uid, self.pool.get('res.country'))       
    
    def action_sync_country_state(self, cr, uid, ids, context=None):
        return self.action_sync(cr, uid, self.pool.get('res.country.state')) 
    
    def action_sync_customer(self, cr, uid, ids, context=None):
        return self.action_sync(cr, uid, self.pool.get('res.partner')) 
    
    def action_sync_product_brand(self, cr, uid, ids, context=None):
        return self.action_sync(cr, uid, self.pool.get('product.brand')) 
    
    def action_sync_product_public_category(self, cr, uid, ids, context=None):
        return self.action_sync(cr, uid, self.pool.get('product.public.category')) 
    
    def action_sync_product_parent(self, cr, uid, ids, context=None):
        return self.action_product_sync(cr, uid, self.pool.get('product.template')) 
    
    def action_sync_product_child(self, cr, uid, ids, context=None):
        return self.action_product_sync(cr, uid, self.pool.get('product.product')) 
    
    def action_push_hot_products(self, cr, uid, pool):
        avaiable_ids = pool.search(cr, uid, [])
        if avaiable_ids:
            pool.createRabbitMQforHotProducts(cr, uid, pool.browse(cr, uid, avaiable_ids),"syncAllMQ")
        return True
    
    def action_sync_product_hots(self, cr, uid, ids, context=None):
        return self.action_push_hot_products(cr, uid, self.pool.get('product.public.category')) 
    
    def action_push_session_products(self, cr, uid, pool):
        avaiable_ids = self.pool['product.session'].search(cr, uid, [('date_stop','=',False),('active','=',True)], order='product_id asc, id asc')
        if avaiable_ids:
            pool.createRabbitMQforSessionProducts(cr, uid, pool.browse(cr, uid, avaiable_ids),"syncAllMQ")
        return True
    
    def action_sync_product_sessions(self, cr, uid, ids, context=None):
        return self.action_push_session_products(cr, uid, self.pool.get('product.session')) 
    
    def write(self, cr, uid, ids, vals, context=None):
        if isinstance(ids, (int, long)):
            ids = [ids]
        if 'name' in vals or 'username' in vals or 'password' in vals or 'port' in vals or 'virtual_host' in vals:
            for data in self.browse(cr, uid, ids):
                name = vals.get('name',data.name)
                username = vals.get('username',data.username)
                password = vals.get('password',data.password)
                port = vals.get('port',data.port)
                virtual_host = vals.get('virtual_host',data.virtual_host)
                if not self.checkConnection(cr, uid, name, username, password, port, virtual_host):
                    raise except_orm(_('Error!'),
                        _("The host '%s' is not available! Please repair it again!") % (name,))
        return super(general_synchronization, self).write(cr, uid, ids, vals, context=context)
    
    def create(self, cr, uid, vals, context=None):
#         if not self.checkConnection(cr, uid, vals.get('name'), vals.get('username'), vals.get('password'), vals.get('port'), vals.get('virtual_host')):
#             raise except_orm(_('Error!'),
#                 _("The host '%s' is not available! Please repair it again!") % (vals.get('name'),))
        return super(general_synchronization, self).create(cr, uid, vals, context=context)
    
    def checkConnection(self, cr, uid, host, username, password, port, virtual_host):
        try:
            credentials = pika.PlainCredentials(username, password)
            connection = pika.BlockingConnection(pika.ConnectionParameters(
                    host=host,port=int(port),virtual_host=str(virtual_host),credentials=credentials))       
            connection.close()
            return True
        except:
            return False
        return False
        
    def getConfiguration(self, cr, uid):
        config_ids = self.search(cr, uid, [])
        for config in self.browse(cr, uid, config_ids):
            if self.checkConnection(cr, uid, config.name,config.username,config.password, config.port, config.virtual_host):
                return [config.name,config.username,config.password, int(config.port), str(config.virtual_host)]
            else:
                return False
        return False
    
    def getConnectQueue(self, cr, uid):
        config_ids = self.search(cr, uid, [])
        for config in self.browse(cr, uid, config_ids):
            return [config.name, config.username, config.password, config.port, config.virtual_host]
        return False
    
    def getConnectQueueId(self, cr, uid):
        config_ids = self.search(cr, uid, [])
        for config in self.browse(cr, uid, config_ids):
            return config.id
        return False
    
general_synchronization()

class general_country_queue(osv.osv):
    _name = "general.country.queue"
    _description = "Country Queue"
    
    def _sumstt(self, cr, uid, ids, name=None, args=None, context=None):
        res={}
        count=0
        if context is None:
            context = {}
        for data in self.browse(cr, uid, ids, context):
            sync_id = data.sync_id
            if sync_id: 
                count += 1
            res[data.id]=count
        return res
    
    _columns = {
                'no':fields.function(_sumstt,type='integer',string ='No.',),
                'sync_id':fields.many2one('general.synchronization','Synchronization'),
                'name': fields.char('Country Ids'),
                'list_ids': fields.many2many('res.country','general_country_queue_rel','qid','cid',string='Countries Waiting Sync'),
                'is_delete':fields.boolean('Del'),
                }
    
    def createRabbitMQ(self, cr, uid, datas, country_pool, context=None):
        itemids=[]
        for data in datas:
            if data.name:
                if not data.is_delete:
                    country_ids = country_pool.search(cr, uid, [('id','in', eval(data.name))]) #filter id lai lan nua phong truong hop bi xoa
                    countries = country_pool.browse(cr, uid, country_ids)
                    result = country_pool.createRabbitMQfO(cr, uid, countries,"")
                    if result:
                        itemids.append(data.id)
                else:
                    api = RabbitMQ()
                    message = {
                        "id": eval(data.name),
                        'type':"deleteMQ",
                        }                             
                    result = api.createRabbitMQfODel(cr, uid, message, self.pool.get('general.synchronization'), 'country', 'country_logs')
                    if result:
                        itemids.append(data.id)
        return itemids
    
    def action_createRabbitMQ(self, cr, uid, ids, context=None):
        country_pool = self.pool.get('res.country')
        sync_id = False
        for data in self.browse(cr, uid, ids, context):
            sync_id = data.sync_id.id
        itemids = self.createRabbitMQ(cr, uid, self.browse(cr, uid, ids, context), country_pool, context)
        self.unlink(cr, uid, itemids, context)
        view_ref = self.pool.get('ir.model.data').get_object_reference(cr, uid, 'odoo_sync', 'view_general_synchronization_form')
        view_id = view_ref and view_ref[1] or False,
        return {
            'type': 'ir.actions.act_window',
            'name': _('Synchronization'),
            'res_model': 'general.synchronization',
            'res_id': sync_id,
            'view_type': 'form',
            'view_mode': 'form',
            'view_id': view_id,
            'target': 'current',
            'nodestroy': False,
        }
    
general_country_queue()

class general_state_queue(osv.osv):
    _name = "general.state.queue"
    _description = "State Queue"
    
    def _sumstt(self, cr, uid, ids, name=None, args=None, context=None):
        res={}
        count=0
        if context is None:
            context = {}
        for data in self.browse(cr, uid, ids, context):
            sync_id = data.sync_id
            if sync_id: 
                count += 1
            res[data.id]=count
        return res
    
    _columns = {
                'no':fields.function(_sumstt,type='integer',string ='No.',),
                'sync_id':fields.many2one('general.synchronization','Synchronization'),
                'name': fields.char('State Ids'),
                'list_ids': fields.many2many('res.country.state','general_country_state_queue_rel','qid','sid',string='States Waiting Sync'),
                'is_delete':fields.boolean('Del'),
                }

    def createRabbitMQ(self, cr, uid, datas, state_pool, context=None):
        itemids=[]
        for data in datas:
            if data.name:
                if not data.is_delete:
                    state_ids = state_pool.search(cr, uid, [('id','in', eval(data.name))]) #filter id lai lan nua phong truong hop bi xoa
                    states = state_pool.browse(cr, uid, state_ids)
                    result = state_pool.createRabbitMQfO(cr, uid, states,"")
                    if result:
                        itemids.append(data.id)
                else:
                    api = RabbitMQ()
                    message = {
                        "id": eval(data.name),
                        'type':"deleteMQ",
                        }                             
                    result = api.createRabbitMQfODel(cr, uid, message, self.pool.get('general.synchronization'), 'state', 'state_logs')
                    if result:
                        itemids.append(data.id)
        return itemids
    
    def action_createRabbitMQ(self, cr, uid, ids, context=None):
        state_pool = self.pool.get('res.country.state')
        sync_id = False
        for data in self.browse(cr, uid, ids, context):
            sync_id = data.sync_id.id
        itemids = self.createRabbitMQ(cr, uid, self.browse(cr, uid, ids, context), state_pool, context)
        self.unlink(cr, uid, itemids, context)
        view_ref = self.pool.get('ir.model.data').get_object_reference(cr, uid, 'odoo_sync', 'view_general_synchronization_form')
        view_id = view_ref and view_ref[1] or False,
        return {
            'type': 'ir.actions.act_window',
            'name': _('Synchronization'),
            'res_model': 'general.synchronization',
            'res_id': sync_id,
            'view_type': 'form',
            'view_mode': 'form',
            'view_id': view_id,
            'target': 'current',
            'nodestroy': False,
        }
        
general_state_queue()

class general_partner_queue(osv.osv):
    _name = "general.partner.queue"
    _description = "Partner Queue"
    
    def _sumstt(self, cr, uid, ids, name=None, args=None, context=None):
        res={}
        count=0
        if context is None:
            context = {}
        for data in self.browse(cr, uid, ids, context):
            sync_id = data.sync_id
            if sync_id: 
                count += 1
            res[data.id]=count
        return res
    
    _columns = {
                'no':fields.function(_sumstt,type='integer',string ='No.',),
                'sync_id':fields.many2one('general.synchronization','Synchronization'),
                'name': fields.char('Customer Ids'),
                'list_ids': fields.many2many('res.partner','general_partner_queue_rel','qid','pid',string='Customers Waiting Sync'),
                'is_delete':fields.boolean('Del'),
                }
    
    def createRabbitMQ(self, cr, uid, datas, partner_pool, context=None):
        itemids=[]
        for data in datas:
            if data.name:
                if not data.is_delete:
                    partner_ids = partner_pool.search(cr, uid, [('id','in', eval(data.name))]) #filter id lai lan nua phong truong hop bi xoa
                    partners = partner_pool.browse(cr, uid, partner_ids)
                    result = partner_pool.createRabbitMQfO(cr, uid, partners,"")
                    if result:
                        itemids.append(data.id)
                else:
                    api = RabbitMQ()
                    message = {
                        "id": eval(data.name),
                        'type':"deleteMQ",
                        }                             
                    result = api.createRabbitMQfODel(cr, uid, message, self.pool.get('general.synchronization'), 'customer', 'customer_logs')
                    if result:
                        itemids.append(data.id)
        return itemids
    
    def action_createRabbitMQ(self, cr, uid, ids, context=None):
        partner_pool = self.pool.get('res.partner')
        sync_id = False
        for data in self.browse(cr, uid, ids, context):
            sync_id = data.sync_id.id
        itemids = self.createRabbitMQ(cr, uid, self.browse(cr, uid, ids, context), partner_pool, context)
        self.unlink(cr, uid, itemids, context)
        view_ref = self.pool.get('ir.model.data').get_object_reference(cr, uid, 'odoo_sync', 'view_general_synchronization_form')
        view_id = view_ref and view_ref[1] or False,
        return {
            'type': 'ir.actions.act_window',
            'name': _('Synchronization'),
            'res_model': 'general.synchronization',
            'res_id': sync_id,
            'view_type': 'form',
            'view_mode': 'form',
            'view_id': view_id,
            'target': 'current',
            'nodestroy': False,
        } 
    
general_partner_queue()

class general_brand_queue(osv.osv):
    _name = "general.brand.queue"
    _description = "Brand Queue"
    
    def _sumstt(self, cr, uid, ids, name=None, args=None, context=None):
        res={}
        count=0
        if context is None:
            context = {}
        for data in self.browse(cr, uid, ids, context):
            sync_id = data.sync_id
            if sync_id: 
                count += 1
            res[data.id]=count
        return res
    
    _columns = {
                'no':fields.function(_sumstt,type='integer',string ='No.',),
                'sync_id':fields.many2one('general.synchronization','Synchronization'),
                'name': fields.char('Brand Ids'),
                'list_ids': fields.many2many('product.brand','general_brand_queue_rel','qid','bid',string='Brands Waiting Sync'),
                'is_delete':fields.boolean('Del'),
                }
    
    def createRabbitMQ(self, cr, uid, datas, brand_pool, context=None):
        itemids=[]
        for data in datas:
            if data.name:
                if not data.is_delete:
                    brand_ids = brand_pool.search(cr, uid, [('id','in', eval(data.name))]) #filter id lai lan nua phong truong hop bi xoa
                    brands = brand_pool.browse(cr, uid, brand_ids)
                    result = brand_pool.createRabbitMQfO(cr, uid, brands,"")
                    if result:
                        itemids.append(data.id)
                else:
                    api = RabbitMQ()
                    message = {
                        "id": eval(data.name),
                        'type':"deleteMQ",
                        }                             
                    result = api.createRabbitMQfODel(cr, uid, message, self.pool.get('general.synchronization'), 'product_brand', 'product_brand_logs')
                    if result:
                        itemids.append(data.id)
        return itemids
    
    def action_createRabbitMQ(self, cr, uid, ids, context=None):
        brand_pool = self.pool.get('product.brand')
        sync_id = False
        for data in self.browse(cr, uid, ids, context):
            sync_id = data.sync_id.id
        itemids = self.createRabbitMQ(cr, uid, self.browse(cr, uid, ids, context), brand_pool, context)
        self.unlink(cr, uid, itemids, context)
        view_ref = self.pool.get('ir.model.data').get_object_reference(cr, uid, 'odoo_sync', 'view_general_synchronization_form')
        view_id = view_ref and view_ref[1] or False,
        return {
            'type': 'ir.actions.act_window',
            'name': _('Synchronization'),
            'res_model': 'general.synchronization',
            'res_id': sync_id,
            'view_type': 'form',
            'view_mode': 'form',
            'view_id': view_id,
            'target': 'current',
            'nodestroy': False,
        } 
    
general_brand_queue()

class general_category_queue(osv.osv):
    _name = "general.category.queue"
    _description = "Category Queue"
    
    def _sumstt(self, cr, uid, ids, name=None, args=None, context=None):
        res={}
        count=0
        if context is None:
            context = {}
        for data in self.browse(cr, uid, ids, context):
            sync_id = data.sync_id
            if sync_id: 
                count += 1
            res[data.id]=count
        return res
    
    _columns = {
                'no':fields.function(_sumstt,type='integer',string ='No.',),
                'sync_id':fields.many2one('general.synchronization','Synchronization'),
                'name': fields.char('Category Ids'),
                'list_ids': fields.many2many('product.public.category','general_category_queue_rel','qid','cid',string='Categories Waiting Sync'),
                'is_delete':fields.boolean('Del'),
                }
    
    def createRabbitMQ(self, cr, uid, datas, category_pool, context=None):
        itemids=[]
        for data in datas:
            if data.name:
                if not data.is_delete:
                    category_ids = category_pool.search(cr, uid, [('id','in', eval(data.name))]) #filter id lai lan nua phong truong hop bi xoa
                    categories = category_pool.browse(cr, uid, category_ids)
                    result = category_pool.createRabbitMQfO(cr, uid, categories,"")
                    if result:
                        itemids.append(data.id)
                else:
                    api = RabbitMQ()
                    message = {
                        "id": eval(data.name),
                        'type':"deleteMQ",
                        }                             
                    result = api.createRabbitMQfODel(cr, uid, message, self.pool.get('general.synchronization'), 'product_public_category', 'product_public_category_logs')
                    if result:
                        itemids.append(data.id)
        return itemids
    
    def action_createRabbitMQ(self, cr, uid, ids, context=None):
        category_pool = self.pool.get('product.public.category')
        sync_id = False
        for data in self.browse(cr, uid, ids, context):
            sync_id = data.sync_id.id
        itemids = self.createRabbitMQ(cr, uid, self.browse(cr, uid, ids, context), category_pool, context)
        self.unlink(cr, uid, itemids, context)
        view_ref = self.pool.get('ir.model.data').get_object_reference(cr, uid, 'odoo_sync', 'view_general_synchronization_form')
        view_id = view_ref and view_ref[1] or False,
        return {
            'type': 'ir.actions.act_window',
            'name': _('Synchronization'),
            'res_model': 'general.synchronization',
            'res_id': sync_id,
            'view_type': 'form',
            'view_mode': 'form',
            'view_id': view_id,
            'target': 'current',
            'nodestroy': False,
        }  
    
general_category_queue()

class general_template_queue(osv.osv):
    _name = "general.template.queue"
    _description = "Product Template Queue"
    
    def _sumstt(self, cr, uid, ids, name=None, args=None, context=None):
        res={}
        count=0
        if context is None:
            context = {}
        for data in self.browse(cr, uid, ids, context):
            sync_id = data.sync_id
            if sync_id: 
                count += 1
            res[data.id]=count
        return res
    _columns = {
                'no':fields.function(_sumstt,type='integer',string ='No.',),
                'sync_id':fields.many2one('general.synchronization','Synchronization'),
                'name': fields.char('Product Parent Ids'),
                'list_ids': fields.many2many('product.template','general_template_queue_rel','qid','pid',string='Product Parents Waiting Sync'),
                'is_delete':fields.boolean('Del'),
                }
    
    def createRabbitMQ(self, cr, uid, datas, template_pool, context=None):
        itemids=[]
        for data in datas:
            if data.name:
                if not data.is_delete:
                    template_ids = template_pool.search(cr, uid, [('id','in', eval(data.name))]) #filter id lai lan nua phong truong hop bi xoa
                    templates = template_pool.browse(cr, uid, template_ids)
                    result = template_pool.createRabbitMQfO(cr, uid, templates,"")
                    if result:
                        itemids.append(data.id)
                else:
                    api = RabbitMQ()
                    message = {
                        "id": eval(data.name),
                        'type':"deleteMQ",
                        }                             
                    result = api.createRabbitMQfODel(cr, uid, message, self.pool.get('general.synchronization'), 'product_template', 'product_template_logs')
                    if result:
                        itemids.append(data.id)
        return itemids
    
    def action_createRabbitMQ(self, cr, uid, ids, context=None):
        template_pool = self.pool.get('product.template')
        sync_id = False
        for data in self.browse(cr, uid, ids, context):
            sync_id = data.sync_id.id
        itemids = self.createRabbitMQ(cr, uid, self.browse(cr, uid, ids, context), template_pool, context)
        self.unlink(cr, uid, itemids, context)
        view_ref = self.pool.get('ir.model.data').get_object_reference(cr, uid, 'odoo_sync', 'view_general_synchronization_form')
        view_id = view_ref and view_ref[1] or False,
        return {
            'type': 'ir.actions.act_window',
            'name': _('Synchronization'),
            'res_model': 'general.synchronization',
            'res_id': sync_id,
            'view_type': 'form',
            'view_mode': 'form',
            'view_id': view_id,
            'target': 'current',
            'nodestroy': False,
        } 
    
    
general_template_queue()

class general_product_queue(osv.osv):
    _name = "general.product.queue"
    _description = "Product Queue"
    
    def _sumstt(self, cr, uid, ids, name=None, args=None, context=None):
        res={}
        count=0
        if context is None:
            context = {}
        for data in self.browse(cr, uid, ids, context):
            sync_id = data.sync_id
            if sync_id: 
                count += 1
            res[data.id]=count
        return res
    
    _columns = {
                'no':fields.function(_sumstt,type='integer',string ='No.',),
                'sync_id':fields.many2one('general.synchronization','Synchronization'),
                'name': fields.char('Product Ids'),
                'list_ids': fields.many2many('product.product','general_product_queue_rel','qid','pid',string='Product Waiting Sync'),
                'is_delete':fields.boolean('Del'),
                }
    
    def createRabbitMQ(self, cr, uid, datas, product_pool, context=None):
        itemids=[]
        for data in datas:
            if data.name:
                if not data.is_delete:
                    product_ids = product_pool.search(cr, uid, [('id','in', eval(data.name))]) #filter id lai lan nua phong truong hop bi xoa
                    products = product_pool.browse(cr, uid, product_ids)
                    result = product_pool.createRabbitMQfO(cr, uid, products,"")
                    if result:
                        itemids.append(data.id)
                else:
                    api = RabbitMQ()
                    message = {
                        "id": eval(data.name),
                        'type':"deleteMQ",
                        }                             
                    result = api.createRabbitMQfODel(cr, uid, message, self.pool.get('general.synchronization'), 'product_product', 'product_product_logs')
                    if result:
                        itemids.append(data.id)
        return itemids
    
    def action_createRabbitMQ(self, cr, uid, ids, context=None):
        product_pool = self.pool.get('product.product')
        sync_id = False
        for data in self.browse(cr, uid, ids, context):
            sync_id = data.sync_id.id
        itemids = self.createRabbitMQ(cr, uid, self.browse(cr, uid, ids, context), product_pool, context)
        self.unlink(cr, uid, itemids, context)
        view_ref = self.pool.get('ir.model.data').get_object_reference(cr, uid, 'odoo_sync', 'view_general_synchronization_form')
        view_id = view_ref and view_ref[1] or False,
        return {
            'type': 'ir.actions.act_window',
            'name': _('Synchronization'),
            'res_model': 'general.synchronization',
            'res_id': sync_id,
            'view_type': 'form',
            'view_mode': 'form',
            'view_id': view_id,
            'target': 'current',
            'nodestroy': False,
        }  
    
general_product_queue()

class general_inventory_queue(osv.osv):
    _name = "general.inventory.queue"
    _description = "Inventory Queue"
    
    def _sumstt(self, cr, uid, ids, name=None, args=None, context=None):
        res={}
        count=0
        if context is None:
            context = {}
        for data in self.browse(cr, uid, ids, context):
            sync_id = data.sync_id
            if sync_id: 
                count += 1
            res[data.id]=count
        return res
    
    _columns = {
                'no':fields.function(_sumstt,type='integer',string ='No.',),
                'sync_id':fields.many2one('general.synchronization','Synchronization'),
                'name': fields.char('Product Ids'),
                'list_ids': fields.many2many('product.product','general_inventory_queue_rel','qid','pid',string='Products Sync'),
                }
    
    def createRabbitMQ(self, cr, uid, datas, product_pool, context=None):
        itemids=[]
        for data in datas:
            if data.name:
                product_ids = product_pool.search(cr, uid, [('id','in', eval(data.name))]) #filter id lai lan nua phong truong hop bi xoa
                products = product_pool.browse(cr, uid, product_ids)
                result = product_pool.createInventoryRabbitMQfO(cr, uid, products,"")
                if result:
                    itemids.append(data.id)
        return itemids
    
    def action_createRabbitMQ(self, cr, uid, ids, context=None):
        product_pool = self.pool.get('product.product')
        sync_id = False
        for data in self.browse(cr, uid, ids, context):
            sync_id = data.sync_id.id
        itemids = self.createRabbitMQ(cr, uid, self.browse(cr, uid, ids, context), product_pool, context)
        self.unlink(cr, uid, itemids, context)
        view_ref = self.pool.get('ir.model.data').get_object_reference(cr, uid, 'odoo_sync', 'view_general_synchronization_form')
        view_id = view_ref and view_ref[1] or False,
        return {
            'type': 'ir.actions.act_window',
            'name': _('Synchronization'),
            'res_model': 'general.synchronization',
            'res_id': sync_id,
            'view_type': 'form',
            'view_mode': 'form',
            'view_id': view_id,
            'target': 'current',
            'nodestroy': False,
        }  
    
general_inventory_queue()

class general_price_queue(osv.osv):
    _name = "general.price.queue"
    _description = "Product Price Queue"
    
    def _sumstt(self, cr, uid, ids, name=None, args=None, context=None):
        res={}
        count=0
        if context is None:
            context = {}
        for data in self.browse(cr, uid, ids, context):
            sync_id = data.sync_id
            if sync_id: 
                count += 1
            res[data.id]=count
        return res
    
    _columns = {
                'no':fields.function(_sumstt,type='integer',string ='No.',),
                'sync_id':fields.many2one('general.synchronization','Synchronization'),
                'name': fields.char('Product Ids'),
                'list_ids': fields.many2many('product.product','general_price_queue_rel','qid','pid',string='Products Sync'),
                }
    
    def createRabbitMQ(self, cr, uid, datas, product_pool, context=None):
        itemids=[]
        for data in datas:
            if data.name:
                product_ids = product_pool.search(cr, uid, [('id','in', eval(data.name))]) #filter id lai lan nua phong truong hop bi xoa
                products = product_pool.browse(cr, uid, product_ids)
                result = product_pool.createPriceRabbitMQfO(cr, uid, products,"")
                if result:
                    itemids.append(data.id)
        return itemids
    
    def action_createRabbitMQ(self, cr, uid, ids, context=None):
        product_pool = self.pool.get('product.product')
        sync_id = False
        for data in self.browse(cr, uid, ids, context):
            sync_id = data.sync_id.id
        itemids = self.createRabbitMQ(cr, uid, self.browse(cr, uid, ids, context), product_pool, context)
        self.unlink(cr, uid, itemids, context)
        view_ref = self.pool.get('ir.model.data').get_object_reference(cr, uid, 'odoo_sync', 'view_general_synchronization_form')
        view_id = view_ref and view_ref[1] or False,
        return {
            'type': 'ir.actions.act_window',
            'name': _('Synchronization'),
            'res_model': 'general.synchronization',
            'res_id': sync_id,
            'view_type': 'form',
            'view_mode': 'form',
            'view_id': view_id,
            'target': 'current',
            'nodestroy': False,
        }  
    
general_price_queue()

class general_sale_queue(osv.osv):
    _name = "general.sale.queue"
    _description = "Product Sale Queue"
    
    def _sumstt(self, cr, uid, ids, name=None, args=None, context=None):
        res={}
        count=0
        if context is None:
            context = {}
        for data in self.browse(cr, uid, ids, context):
            sync_id = data.sync_id
            if sync_id: 
                count += 1
            res[data.id]=count
        return res
    
    _columns = {
                'no':fields.function(_sumstt,type='integer',string ='No.',),
                'sync_id':fields.many2one('general.synchronization','Synchronization'),
                'name': fields.char('Order Ids'),
                'list_ids': fields.many2many('sale.order','general_sale_queue_rel','qid','pid',string='Sales Sync'),
                }
    
    def createRabbitMQ(self, cr, uid, datas, sale_pool, context=None):
        itemids=[]
        for data in datas:
            if data.name:
                sale_ids = sale_pool.search(cr, uid, [('id','in', eval(data.name))]) #filter id lai lan nua phong truong hop bi xoa
                sales = sale_pool.browse(cr, uid, sale_ids)
                result = sale_pool.createRabbitMQfO(cr, uid, sales,"updateOrder")
                if result:
                    itemids.append(data.id)
        return itemids
    
    def action_createRabbitMQ(self, cr, uid, ids, context=None):
        sale_pool = self.pool.get('sale.order')
        sync_id = False
        for data in self.browse(cr, uid, ids, context):
            sync_id = data.sync_id.id
        itemids = self.createRabbitMQ(cr, uid, self.browse(cr, uid, ids, context), sale_pool, context)
        self.unlink(cr, uid, itemids, context)
        view_ref = self.pool.get('ir.model.data').get_object_reference(cr, uid, 'odoo_sync', 'view_general_synchronization_form')
        view_id = view_ref and view_ref[1] or False,
        return {
            'type': 'ir.actions.act_window',
            'name': _('Synchronization'),
            'res_model': 'general.synchronization',
            'res_id': sync_id,
            'view_type': 'form',
            'view_mode': 'form',
            'view_id': view_id,
            'target': 'current',
            'nodestroy': False,
        }  
    
general_sale_queue()

class general_hot_product_queue(osv.osv):
    _name = "general.hot.product.queue"
    _description = "Hot Product Queue"
    
    def _sumstt(self, cr, uid, ids, name=None, args=None, context=None):
        res={}
        count=0
        if context is None:
            context = {}
        for data in self.browse(cr, uid, ids, context):
            sync_id = data.sync_id
            if sync_id: 
                count += 1
            res[data.id]=count
        return res
    
    _columns = {
                'no':fields.function(_sumstt,type='integer',string ='No.',),
                'sync_id':fields.many2one('general.synchronization','Synchronization'),
                'name': fields.char('Product Category Ids'),
                }
    
    def createRabbitMQ(self, cr, uid, datas, data_pool, context=None):
        itemids=[]
        for data in datas:
            if data.name:
                record_ids = data_pool.search(cr, uid, [('id','in', eval(data.name))]) #filter id lai lan nua phong truong hop bi xoa
                records = data_pool.browse(cr, uid, record_ids)
                result = data_pool.createRabbitMQforHotProducts(cr, uid, records,"")
                if result:
                    itemids.append(data.id)
        return itemids
    
    def action_createRabbitMQ(self, cr, uid, ids, context=None):
        product_pool = self.pool.get('product.public.category')
        sync_id = False
        for data in self.browse(cr, uid, ids, context):
            sync_id = data.sync_id.id
        itemids = self.createRabbitMQ(cr, uid, self.browse(cr, uid, ids, context), product_pool, context)
        self.unlink(cr, uid, itemids, context)
        view_ref = self.pool.get('ir.model.data').get_object_reference(cr, uid, 'odoo_sync', 'view_general_synchronization_form')
        view_id = view_ref and view_ref[1] or False,
        return {
            'type': 'ir.actions.act_window',
            'name': _('Synchronization'),
            'res_model': 'general.synchronization',
            'res_id': sync_id,
            'view_type': 'form',
            'view_mode': 'form',
            'view_id': view_id,
            'target': 'current',
            'nodestroy': False,
        }  
    
general_hot_product_queue()


class general_session_product_queue(osv.osv):
    _name = "general.session.product.queue"
    _description = "Hot Product Queue"
    
    def _sumstt(self, cr, uid, ids, name=None, args=None, context=None):
        res={}
        count=0
        if context is None:
            context = {}
        for data in self.browse(cr, uid, ids, context):
            sync_id = data.sync_id
            if sync_id: 
                count += 1
            res[data.id]=count
        return res
    
    _columns = {
                'no':fields.function(_sumstt,type='integer',string ='No.',),
                'sync_id':fields.many2one('general.synchronization','Synchronization'),
                'name': fields.char('Product Session Ids'),
                }
    
    def createRabbitMQ(self, cr, uid, datas, data_pool, context=None):
        itemids=[]
        for data in datas:
            if data.name:
                record_ids = data_pool.search(cr, uid, [('id','in', eval(data.name))]) #filter id lai lan nua phong truong hop bi xoa
                records = data_pool.browse(cr, uid, record_ids)
                result = data_pool.createRabbitMQforSessionProducts(cr, uid, records,"")
                if result:
                    itemids.append(data.id)
        return itemids
    
    def action_createRabbitMQ(self, cr, uid, ids, context=None):
        product_pool = self.pool.get('product.session')
        sync_id = False
        for data in self.browse(cr, uid, ids, context):
            sync_id = data.sync_id.id
        itemids = self.createRabbitMQ(cr, uid, self.browse(cr, uid, ids, context), product_pool, context)
        self.unlink(cr, uid, itemids, context)
        view_ref = self.pool.get('ir.model.data').get_object_reference(cr, uid, 'odoo_sync', 'view_general_synchronization_form')
        view_id = view_ref and view_ref[1] or False,
        return {
            'type': 'ir.actions.act_window',
            'name': _('Synchronization'),
            'res_model': 'general.synchronization',
            'res_id': sync_id,
            'view_type': 'form',
            'view_mode': 'form',
            'view_id': view_id,
            'target': 'current',
            'nodestroy': False,
        }  
    
general_session_product_queue()


class general_saledial_queue(osv.osv):
    _name = "general.saledial.queue"
    _description = "Product Sale Dial Queue"
    
    def _sumstt(self, cr, uid, ids, name=None, args=None, context=None):
        res={}
        count=0
        if context is None:
            context = {}
        for data in self.browse(cr, uid, ids, context):
            sync_id = data.sync_id
            if sync_id: 
                count += 1
            res[data.id]=count
        return res
    
    _columns = {
                'no':fields.function(_sumstt,type='integer',string ='No.',),
                'sync_id':fields.many2one('general.synchronization','Synchronization'),
                'name': fields.char('Order Ids'),
                'list_ids': fields.many2many('sale.order','general_saledial_queue_rel','qid','pid',string='Sales Sync'),
                }
    
    def createRabbitMQ(self, cr, uid, datas, sale_pool, context=None):
        itemids=[]
        for data in datas:
            if data.name:
                sale_ids = sale_pool.search(cr, uid, [('id','in', eval(data.name))]) #filter id lai lan nua phong truong hop bi xoa
                sales = sale_pool.browse(cr, uid, sale_ids)
                result = sale_pool.createRabbitMQDialfO(cr, uid, sales,"createOrder")
                if result:
                    itemids.append(data.id)
        return itemids
    
    def action_createRabbitMQ(self, cr, uid, ids, context=None):
        sale_pool = self.pool.get('sale.order')
        sync_id = False
        for data in self.browse(cr, uid, ids, context):
            sync_id = data.sync_id.id
        itemids = self.createRabbitMQ(cr, uid, self.browse(cr, uid, ids, context), sale_pool, context)
        self.unlink(cr, uid, itemids, context)
        view_ref = self.pool.get('ir.model.data').get_object_reference(cr, uid, 'odoo_sync', 'view_general_synchronization_form')
        view_id = view_ref and view_ref[1] or False,
        return {
            'type': 'ir.actions.act_window',
            'name': _('Synchronization'),
            'res_model': 'general.synchronization',
            'res_id': sync_id,
            'view_type': 'form',
            'view_mode': 'form',
            'view_id': view_id,
            'target': 'current',
            'nodestroy': False,
        }  
    
general_saledial_queue()


class general_convert_queue(osv.osv):
    _name = "general.convert.queue"
    _description = "Categories Convert Queue"
    
    def _sumstt(self, cr, uid, ids, name=None, args=None, context=None):
        res={}
        count=0
        if context is None:
            context = {}
        for data in self.browse(cr, uid, ids, context):
            sync_id = data.sync_id
            if sync_id: 
                count += 1
            res[data.id]=count
        return res
    
    _columns = {
                'no':fields.function(_sumstt,type='integer',string ='No.',),
                'sync_id':fields.many2one('general.synchronization','Synchronization'),
                'name': fields.char('Category Convert Ids'),
                'list_ids': fields.many2many('category.convert','general_convert_queue_rel','qid','pid',string='Category Convert Sync'),
                }
    
    def createRabbitMQ(self, cr, uid, datas, ref_pool, context=None):
        itemids=[]
        for data in datas:
            if data.name:
                convert_ids = ref_pool.search(cr, uid, [('id','in', eval(data.name))]) #filter id lai lan nua phong truong hop bi xoa
                converts = ref_pool.browse(cr, uid, convert_ids)
                result = ref_pool.createRabbitMQfO(cr, uid, converts,"")
                if result:
                    itemids.append(data.id)
        return itemids
    
    def action_createRabbitMQ(self, cr, uid, ids, context=None):
        sale_pool = self.pool.get('category.convert')
        sync_id = False
        for data in self.browse(cr, uid, ids, context):
            sync_id = data.sync_id.id
        itemids = self.createRabbitMQ(cr, uid, self.browse(cr, uid, ids, context), sale_pool, context)
        self.unlink(cr, uid, itemids, context)
        view_ref = self.pool.get('ir.model.data').get_object_reference(cr, uid, 'odoo_sync', 'view_general_synchronization_form')
        view_id = view_ref and view_ref[1] or False,
        return {
            'type': 'ir.actions.act_window',
            'name': _('Synchronization'),
            'res_model': 'general.synchronization',
            'res_id': sync_id,
            'view_type': 'form',
            'view_mode': 'form',
            'view_id': view_id,
            'target': 'current',
            'nodestroy': False,
        }  
    
general_convert_queue()


class general_knumber_queue(osv.osv):
    _name = "general.knumber.queue"
    _description = "knumber change Queue"
    
    def _sumstt(self, cr, uid, ids, name=None, args=None, context=None):
        res={}
        count=0
        if context is None:
            context = {}
        for data in self.browse(cr, uid, ids, context):
            sync_id = data.sync_id
            if sync_id: 
                count += 1
            res[data.id]=count
        return res
    
    _columns = {
                'no':fields.function(_sumstt,type='integer',string ='No.',),
                'sync_id':fields.many2one('general.synchronization','Synchronization'),
                'name': fields.char('Credit Card Ids'),
                }
    
    def createRabbitMQ(self, cr, uid, datas, ref_pool, context=None):
        itemids=[]
        for data in datas:
            if data.name:
                convert_ids = ref_pool.search(cr, uid, [('id','in', eval(data.name))]) #filter id lai lan nua phong truong hop bi xoa
                converts = ref_pool.browse(cr, uid, convert_ids)
                result = ref_pool.createRabbitMQfO(cr, uid, converts,"")
                if result:
                    itemids.append(data.id)
        return itemids
    
    def action_createRabbitMQ(self, cr, uid, ids, context=None):
        credit_pool = self.pool.get('credit.card.member')
        sync_id = False
        for data in self.browse(cr, uid, ids, context):
            sync_id = data.sync_id.id
        itemids = self.createRabbitMQ(cr, uid, self.browse(cr, uid, ids, context), credit_pool, context)
        self.unlink(cr, uid, itemids, context)
        view_ref = self.pool.get('ir.model.data').get_object_reference(cr, uid, 'odoo_sync', 'view_general_synchronization_form')
        view_id = view_ref and view_ref[1] or False,
        return {
            'type': 'ir.actions.act_window',
            'name': _('Synchronization'),
            'res_model': 'general.synchronization',
            'res_id': sync_id,
            'view_type': 'form',
            'view_mode': 'form',
            'view_id': view_id,
            'target': 'current',
            'nodestroy': False,
        }  
    
general_knumber_queue()

class general_give_k_queue(osv.osv):
    _name = "general.give.k.queue"
    _description = "Give K change Queue"
    
    def _sumstt(self, cr, uid, ids, name=None, args=None, context=None):
        res={}
        count=0
        if context is None:
            context = {}
        for data in self.browse(cr, uid, ids, context):
            sync_id = data.sync_id
            if sync_id: 
                count += 1
            res[data.id]=count
        return res
    
    _columns = {
                'no':fields.function(_sumstt,type='integer',string ='No.',),
                'sync_id':fields.many2one('general.synchronization','Synchronization'),
                'name': fields.char('Give K Ids'),
                }
    
    def createRabbitMQ(self, cr, uid, datas, ref_pool, context=None):
        itemids=[]
        for data in datas:
            if data.name:
                convert_ids = ref_pool.search(cr, uid, [('id','in', eval(data.name))]) #filter id lai lan nua phong truong hop bi xoa
                converts = ref_pool.browse(cr, uid, convert_ids)
                result = ref_pool.createRabbitMQforGiveK(cr, uid, converts,"")
                if result:
                    itemids.append(data.id)
        return itemids
    
    def action_createRabbitMQ(self, cr, uid, ids, context=None):
        givek_pool = self.pool.get('give.k')
        sync_id = False
        for data in self.browse(cr, uid, ids, context):
            sync_id = data.sync_id.id
        itemids = self.createRabbitMQ(cr, uid, self.browse(cr, uid, ids, context), givek_pool, context)
        self.unlink(cr, uid, itemids, context)
        view_ref = self.pool.get('ir.model.data').get_object_reference(cr, uid, 'odoo_sync', 'view_general_synchronization_form')
        view_id = view_ref and view_ref[1] or False,
        return {
            'type': 'ir.actions.act_window',
            'name': _('Synchronization'),
            'res_model': 'general.synchronization',
            'res_id': sync_id,
            'view_type': 'form',
            'view_mode': 'form',
            'view_id': view_id,
            'target': 'current',
            'nodestroy': False,
        }  
    
general_give_k_queue()

class general_notify_content_queue(osv.osv):
    _name = 'general.notify.content.queue'
    _description = 'Notify Content Queue'
    
    def _sumstt(self, cr, uid, ids, name=None, args=None, context=None):
        res={}
        count=0
        if context is None:
            context = {}
        for data in self.browse(cr, uid, ids, context):
            sync_id = data.sync_id
            if sync_id: 
                count += 1
            res[data.id]=count
        return res
    
    _columns = {
                'no':fields.function(_sumstt,type='integer',string ='No.',),
                'sync_id':fields.many2one('general.synchronization','Synchronization'),
                'name': fields.char('Notify Ids')
                }
    
    def createRabbitMQ(self, cr, uid, datas, ref_pool, context=None):
        itemids=[]
        for data in datas:
            if data.name:
                convert_ids = ref_pool.search(cr, uid, [('id','in', eval(data.name))]) #filter id lai lan nua phong truong hop bi xoa
                converts = ref_pool.browse(cr, uid, convert_ids)
                result = ref_pool.createRabbitMQforNotifyContent(cr, uid, converts, "")
                if result:
                    itemids.append(data.id)
        return itemids
    
    def action_createRabbitMQ(self, cr, uid, ids, context=None):
        givek_pool = self.pool.get('notify.to.customers')
        sync_id = False
        for data in self.browse(cr, uid, ids, context):
            sync_id = data.sync_id.id
        itemids = self.createRabbitMQ(cr, uid, self.browse(cr, uid, ids, context), givek_pool, context)
        self.unlink(cr, uid, itemids, context)
        view_ref = self.pool.get('ir.model.data').get_object_reference(cr, uid, 'odoo_sync', 'view_general_synchronization_form')
        view_id = view_ref and view_ref[1] or False,
        return {
            'type': 'ir.actions.act_window',
            'name': _('Synchronization'),
            'res_model': 'general.synchronization',
            'res_id': sync_id,
            'view_type': 'form',
            'view_mode': 'form',
            'view_id': view_id,
            'target': 'current',
            'nodestroy': False,
        }
        
general_notify_content_queue()

class general_send_notify_queue(osv.osv):
    _name = 'general.send.notify.queue'
    _description = 'Send Notify Customer Queue'
    
    def _sumstt(self, cr, uid, ids, name=None, args=None, context=None):
        res={}
        count=0
        if context is None:
            context = {}
        for data in self.browse(cr, uid, ids, context):
            sync_id = data.sync_id
            if sync_id: 
                count += 1
            res[data.id]=count
        return res
    
    _columns = {
                'no':fields.function(_sumstt,type='integer',string ='No.',),
                'sync_id':fields.many2one('general.synchronization','Synchronization'),
                'name': fields.char('Notify Ids'),
                'message': fields.text('Message'),
                }
    
    def createRabbitMQ(self, cr, uid, datas, ref_pool, context=None):
        itemids=[]
        for data in datas:
            if data.name:
                convert_ids = ref_pool.search(cr, uid, [('id','in', eval(data.name))]) #filter id lai lan nua phong truong hop bi xoa
                converts = ref_pool.browse(cr, uid, convert_ids)
                result = ref_pool.createRabbitMQforSendNotify(cr, uid, converts, data.message, "")
                if result:
                    itemids.append(data.id)
        return itemids
    
    def action_createRabbitMQ(self, cr, uid, ids, context=None):
        givek_pool = self.pool.get('notify.to.customers')
        sync_id = False
        for data in self.browse(cr, uid, ids, context):
            sync_id = data.sync_id.id
        itemids = self.createRabbitMQ(cr, uid, self.browse(cr, uid, ids, context), givek_pool, context)
        self.unlink(cr, uid, itemids, context)
        view_ref = self.pool.get('ir.model.data').get_object_reference(cr, uid, 'odoo_sync', 'view_general_synchronization_form')
        view_id = view_ref and view_ref[1] or False,
        return {
            'type': 'ir.actions.act_window',
            'name': _('Synchronization'),
            'res_model': 'general.synchronization',
            'res_id': sync_id,
            'view_type': 'form',
            'view_mode': 'form',
            'view_id': view_id,
            'target': 'current',
            'nodestroy': False,
        }  

general_send_notify_queue()
    