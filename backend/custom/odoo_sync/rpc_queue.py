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

class general_rpc_queue(osv.osv):
    _name = "general.rpc.queue"
    _description = "XMLRPC for Queue"
  
    def write(self, cr, uid, ids, vals, context=None):
        results = []
        if 'type' in vals:
            if vals.get('type') == 'inventory':
                product_ids = vals.get('product_ids') or []
                if product_ids:
                    product_pool = self.pool.get('product.product')                    
                    products = product_pool.browse(cr, uid, product_pool.search(cr, uid, [('id','in', product_ids)]))
                    results = map(lambda product: {'product_id': product.id, 'price':product.virtual_available}, products )
            elif vals.get('type') == 'price':
                product_ids = vals.get('product_ids') or []
                if product_ids:
                    product_pool = self.pool.get('product.product')
                    products = product_pool.browse(cr, uid, product_pool.search(cr, uid, [('id','in', product_ids)]))
                    results = map(lambda product: {'product_id': product.id, 'price':product.lst_price!=0 and product.lst_price or product.standard_price}, products )
        return json.dumps({'jdata': results})  
    
general_rpc_queue()

class general_rpc_customer(osv.osv):
    _name = "general.rpc.customer"
    _description = "XMLRPC for Queue"
    
    def write(self, cr, uid, ids, vals, context=None):
        try:            
            self.pool.get('res.partner').action_set_partner(cr, uid, json.loads(vals))
        except:
            return False
        return True
    
general_rpc_queue()

class general_rpc_order(osv.osv):
    _name = "general.rpc.order"
    _description = "XMLRPC for RPC Order"
    
    def write(self, cr, uid, ids, vals, context=None):
        try:
            self.pool.get('sale.order').action_set_order(cr, uid, json.loads(vals))
        except:
            return False
        return True
    
general_rpc_queue()

class general_rpc_price(osv.osv):
    _name = "general.rpc.price"
    _description = "XMLRPC for RPC Price"
    
    def write(self, cr, uid, ids, vals, context=None):
        try:
            sync_id = self.pool.get('general.synchronization').getConnectQueueId(cr, uid)
            if sync_id:
                self.pool.get('general.synchronization').action_sync_price(cr, uid, [sync_id])
        except:
            return False
        return True
    
general_rpc_price()

class general_rpc_resync(osv.osv):
    _name = "general.rpc.resync"
    _description = "XMLRPC for RPC resync"
    
    def write(self, cr, uid, ids, vals, context=None):
        try:
            self.pool.get('general.synchronization').get_message_add_queue(cr, uid)
        except:
            return False
        return True
    
general_rpc_resync()

class general_session_add(osv.osv):
    _name = "general.session.add"
    _description = "XMLRPC for Session Create"
    
    def write(self, cr, uid, ids, vals, context=None):
        try:            
            self.pool.get('product.session').action_create_multi_session(cr, uid, json.loads(vals))
        except:
            return False
        return True
    
general_session_add()

class general_session_close(osv.osv):
    _name = "general.session.close"
    _description = "XMLRPC for Session Close"
    
    def write(self, cr, uid, ids, vals, context=None):
        try:            
            self.pool.get('product.session').action_close_multi_session(cr, uid, json.loads(vals))
        except:
            return False
        return True
    
general_session_close()


class general_session_order(osv.osv):
    _name = "general.session.order"
    _description = "XMLRPC for Session Close"
    
    def write(self, cr, uid, ids, vals, context=None):
        try:            
            self.pool.get('product.session.order').action_create_order_point(cr, uid, json.loads(vals))
            return True
        except:
            return False
        return True
    
general_session_order()

class general_session_dial(osv.osv):
    _name = "general.session.dial"
    _description = "XMLRPC for Session Close"
    
    def write(self, cr, uid, ids, vals, context=None):
        try:            
            self.pool.get('product.session').action_website_dial(cr, uid, json.loads(vals))
        except:
            return False
        return True
    
general_session_dial()

class general_partner_history(osv.osv):
    _name = "general.partner.history"
    _description = "XMLRPC for History Login Queue"
    
    def write(self, cr, uid, ids, vals, context=None):
        
        try:            
            self.pool.get('res.partner.history.login').action_create_history(cr, uid, json.loads(vals))
        except:
            return False
        return True
    
general_partner_history()

class general_rpc_transaction(osv.osv):
    _name = "general.rpc.transaction"
    _description = "XMLRPC for Session Close"
    
    def write(self, cr, uid, ids, vals, context=None):
        try:            
            self.pool.get('res.partner.history.exchange').action_create_transaction(cr, uid, json.loads(vals))
        except:
            return False
        return True
    
general_rpc_transaction()


