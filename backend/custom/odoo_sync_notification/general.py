# -*- coding: utf-8 -*-
##############################################################################
#
#    OpenERP, Open Source Management Solution
#    Copyright (C) 2004-today OpenERP SA (<http://www.openerp.com>)
#    Copyright (C) 2011-today Synconics Technologies Pvt. Ltd. (<http://www.synconics.com>)
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
#
##############################################################################

import datetime
from openerp import SUPERUSER_ID, api
from openerp.osv import osv, orm, fields

class general_synchronization(osv.osv):
    _inherit = "general.synchronization"
    
    @api.cr_uid_ids_context
    def get_message_add_queue(self, cr, uid, context=None):
        self.pool.get('general.country.queue').get_message_add_queue(cr, uid, context)
        self.pool.get('general.state.queue').get_message_add_queue(cr, uid, context)
        self.pool.get('general.partner.queue').get_message_add_queue(cr, uid, context)
        self.pool.get('general.brand.queue').get_message_add_queue(cr, uid, context)
        self.pool.get('general.category.queue').get_message_add_queue(cr, uid, context)
        self.pool.get('general.product.queue').get_message_add_queue(cr, uid, context)       
        self.pool.get('general.sale.queue').get_message_add_queue(cr, uid, context)
        self.pool.get('general.hot.product.queue').get_message_add_queue(cr, uid, context)
        self.pool.get('general.session.product.queue').get_message_add_queue(cr, uid, context)
        self.pool.get('general.saledial.queue').get_message_add_queue(cr, uid, context)
        self.pool.get('general.convert.queue').get_message_add_queue(cr, uid, context)
        self.pool.get('general.knumber.queue').get_message_add_queue(cr, uid, context)
        self.pool.get('general.give.k.queue').get_message_add_queue(cr, uid, context)
        self.pool.get('general.notify.content.queue').get_message_add_queue(cr, uid, context)
        self.pool.get('general.send.notify.queue').get_message_add_queue(cr, uid, context)
        return {}

class general_country_queue(osv.Model):
    _inherit = "general.country.queue"
    
    #------------------------------------------------------
    # Push Message 
    #------------------------------------------------------
    @api.cr_uid_ids_context
    def get_message_add_queue(self, cr, uid, context=None):
        ids = self.search(cr, uid, [('name','!=', False)],limit=5)
        if ids:
            ref_pool = self.pool.get('res.country')            
            itemids = self.createRabbitMQ(cr, uid, self.browse(cr, uid, ids, context), ref_pool, context)
            self.unlink(cr, uid, itemids, context)
            return {}
        return {}
    
class general_state_queue(osv.Model):
    _inherit = "general.state.queue"
    
    #------------------------------------------------------
    # Push Message 
    #------------------------------------------------------
    @api.cr_uid_ids_context
    def get_message_add_queue(self, cr, uid, context=None):
        ids = self.search(cr, uid, [('name','!=', False)],limit=5)
        if ids:
            ref_pool = self.pool.get('res.country.state')            
            itemids = self.createRabbitMQ(cr, uid, self.browse(cr, uid, ids, context), ref_pool, context)
            self.unlink(cr, uid, itemids, context)
            return {}
        return {}
    
class general_partner_queue(osv.Model):
    _inherit = "general.partner.queue"
    
    #------------------------------------------------------
    # Push Message 
    #------------------------------------------------------
    @api.cr_uid_ids_context
    def get_message_add_queue(self, cr, uid, context=None):
        ids = self.search(cr, uid, [('name','!=', False)],limit=5)
        if ids:
            ref_pool = self.pool.get('res.partner')            
            itemids = self.createRabbitMQ(cr, uid, self.browse(cr, uid, ids, context), ref_pool, context)
            self.unlink(cr, uid, itemids, context)
            return {}
        return {}
    
class general_brand_queue(osv.Model):
    _inherit = "general.brand.queue"
    
    #------------------------------------------------------
    # Push Message 
    #------------------------------------------------------
    @api.cr_uid_ids_context
    def get_message_add_queue(self, cr, uid, context=None):
        ids = self.search(cr, uid, [('name','!=', False)],limit=5)
        if ids:
            ref_pool = self.pool.get('product.brand')            
            itemids = self.createRabbitMQ(cr, uid, self.browse(cr, uid, ids, context), ref_pool, context)
            self.unlink(cr, uid, itemids, context)
            return {}
        return {}
    
class general_category_queue(osv.Model):
    _inherit = "general.category.queue"
    
    #------------------------------------------------------
    # Push Message 
    #------------------------------------------------------
    @api.cr_uid_ids_context
    def get_message_add_queue(self, cr, uid, context=None):
        ids = self.search(cr, uid, [('name','!=', False)],limit=5)
        if ids:
            ref_pool = self.pool.get('product.public.category')            
            itemids = self.createRabbitMQ(cr, uid, self.browse(cr, uid, ids, context), ref_pool, context)
            self.unlink(cr, uid, itemids, context)
            return {}
        return {}

class general_template_queue(osv.Model):
    _inherit = "general.template.queue"
    
    #------------------------------------------------------
    # Push Message 
    #------------------------------------------------------
    @api.cr_uid_ids_context
    def get_message_add_queue(self, cr, uid, context=None):
        ids = self.search(cr, uid, [('name','!=', False)],limit=5)
        if ids:
            ref_pool = self.pool.get('product.template')            
            itemids = self.createRabbitMQ(cr, uid, self.browse(cr, uid, ids, context), ref_pool, context)
            self.unlink(cr, uid, itemids, context)
            return {}
        return {}
    
class general_product_queue(osv.Model):
    _inherit = "general.product.queue"
    
    #------------------------------------------------------
    # Push Message 
    #------------------------------------------------------
    @api.cr_uid_ids_context
    def get_message_add_queue(self, cr, uid, context=None):
        ids = self.search(cr, uid, [('name','!=', False)],limit=5)
        if ids:
            ref_pool = self.pool.get('product.product')            
            itemids = self.createRabbitMQ(cr, uid, self.browse(cr, uid, ids, context), ref_pool, context)
            self.unlink(cr, uid, itemids, context)
            return {}
        return {}


    
class general_sale_queue(osv.Model):
    _inherit = "general.sale.queue"
    
    #------------------------------------------------------
    # Push Message 
    #------------------------------------------------------
    @api.cr_uid_ids_context
    def get_message_add_queue(self, cr, uid, context=None):
        ids = self.search(cr, uid, [('name','!=', False)],limit=5)
        if ids:
            ref_pool = self.pool.get('sale.order')            
            itemids = self.createRabbitMQ(cr, uid, self.browse(cr, uid, ids, context), ref_pool, context)
            self.unlink(cr, uid, itemids, context)
            return {}
        return {}
    
class general_hot_product_queue(osv.Model):
    _inherit = "general.hot.product.queue"
    
    #------------------------------------------------------
    # Push Message 
    #------------------------------------------------------
    @api.cr_uid_ids_context
    def get_message_add_queue(self, cr, uid, context=None):
        ids = self.search(cr, uid, [('name','!=', False)],limit=5)
        if ids:
            ref_pool = self.pool.get('product.public.category')            
            itemids = self.createRabbitMQ(cr, uid, self.browse(cr, uid, ids, context), ref_pool, context)
            self.unlink(cr, uid, itemids, context)
            return {}
        return {}
    
class general_session_product_queue(osv.Model):
    _inherit = "general.session.product.queue"
    
    #------------------------------------------------------
    # Push Message 
    #------------------------------------------------------
    @api.cr_uid_ids_context
    def get_message_add_queue(self, cr, uid, context=None):
        ids = self.search(cr, uid, [('name','!=', False)],limit=5)
        if ids:
            ref_pool = self.pool.get('product.session')            
            itemids = self.createRabbitMQ(cr, uid, self.browse(cr, uid, ids, context), ref_pool, context)
            self.unlink(cr, uid, itemids, context)
            return {}
        return {}
    
    
class general_saledial_queue(osv.Model):
    _inherit = "general.saledial.queue"
    
    #------------------------------------------------------
    # Push Message 
    #------------------------------------------------------
    @api.cr_uid_ids_context
    def get_message_add_queue(self, cr, uid, context=None):
        ids = self.search(cr, uid, [('name','!=', False)],limit=5)
        if ids:
            ref_pool = self.pool.get('sale.order')            
            itemids = self.createRabbitMQ(cr, uid, self.browse(cr, uid, ids, context), ref_pool, context)
            self.unlink(cr, uid, itemids, context)
            return {}
        return {}
    
class general_convert_queue(osv.Model):
    _inherit = "general.convert.queue"
    
    #------------------------------------------------------
    # Push Message 
    #------------------------------------------------------
    @api.cr_uid_ids_context
    def get_message_add_queue(self, cr, uid, context=None):
        ids = self.search(cr, uid, [('name','!=', False)],limit=5)
        if ids:
            ref_pool = self.pool.get('category.convert')            
            itemids = self.createRabbitMQ(cr, uid, self.browse(cr, uid, ids, context), ref_pool, context)
            self.unlink(cr, uid, itemids, context)
            return {}
        return {}
    
class general_knumber_queue(osv.Model):
    _inherit = "general.knumber.queue"
    
    #------------------------------------------------------
    # Push Message 
    #------------------------------------------------------
    @api.cr_uid_ids_context
    def get_message_add_queue(self, cr, uid, context=None):
        ids = self.search(cr, uid, [('name','!=', False)],limit=5)
        if ids:
            ref_pool = self.pool.get('credit.card.member')            
            itemids = self.createRabbitMQ(cr, uid, self.browse(cr, uid, ids, context), ref_pool, context)
            self.unlink(cr, uid, itemids, context)
            return {}
        return {}
    
class general_give_k_queue(osv.Model):
    _inherit = "general.give.k.queue"
    
    #------------------------------------------------------
    # Push Message 
    #------------------------------------------------------
    @api.cr_uid_ids_context
    def get_message_add_queue(self, cr, uid, context=None):
        ids = self.search(cr, uid, [('name','!=', False)],limit=5)
        if ids:
            ref_pool = self.pool.get('give.k')            
            itemids = self.createRabbitMQ(cr, uid, self.browse(cr, uid, ids, context), ref_pool, context)
            self.unlink(cr, uid, itemids, context)
            return {}
        return {}

class general_notify_content_queue(osv.Model):
    _inherit = "general.notify.content.queue"
    
    #------------------------------------------------------
    # Push Message 
    #------------------------------------------------------
    @api.cr_uid_ids_context
    def get_message_add_queue(self, cr, uid, context=None):
        ids = self.search(cr, uid, [('name','!=', False)],limit=5)
        if ids:
            ref_pool = self.pool.get('notify.to.customers')            
            itemids = self.createRabbitMQ(cr, uid, self.browse(cr, uid, ids, context), ref_pool, context)
            self.unlink(cr, uid, itemids, context)
            return {}
        return {}

class general_send_notify_queue(osv.Model):
    _inherit = "general.send.notify.queue"
    
    #------------------------------------------------------
    # Push Message 
    #------------------------------------------------------
    @api.cr_uid_ids_context
    def get_message_add_queue(self, cr, uid, context=None):
        ids = self.search(cr, uid, [('name','!=', False)],limit=5)
        if ids:
            ref_pool = self.pool.get('notify.to.customers')            
            itemids = self.createRabbitMQ(cr, uid, self.browse(cr, uid, ids, context), ref_pool, context)
            self.unlink(cr, uid, itemids, context)
            return {}
        return {}
    
# vim:expandtab:smartindent:tabstop=4:softtabstop=4:shiftwidth=4:

