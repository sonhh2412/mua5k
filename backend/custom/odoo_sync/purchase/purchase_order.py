# -*- coding: utf-8 -*-
from openerp import SUPERUSER_ID
from openerp.osv import osv, fields
from openerp.tools import DEFAULT_SERVER_DATE_FORMAT, DEFAULT_SERVER_DATETIME_FORMAT
from openerp.tools.translate import _
import openerp.addons.decimal_precision as dp
import time

class purchase_order(osv.osv):
    _inherit = "purchase.order"
    _columns = {
        
    }
    _defaults = {
                
    }
    def wkf_confirm_order(self, cr, uid, ids, context=None):
        super(purchase_order, self).wkf_confirm_order(cr, uid, ids, context=context)
        sale_pool = self.pool.get('sale.order')
        sale_ids = []
        for po in self.browse(cr, uid, ids, context=context):
            sale_origin = po.origin and po.origin.split(',') or False
            sale_ids = sale_pool.search(cr, uid, [('name','in',sale_origin)])
            if sale_ids:
                sale_pool.write(cr, uid, sale_ids, {'purchase_id': po.id})
                sale_pool.createRabbitMQ(cr, uid, sale_pool.browse(cr, uid, sale_ids), "updateOrder")
        return True
    
class procurement_order(osv.osv):
    _inherit = "procurement.order"
    
    def write(self, cr, uid, ids, vals, context=None):
        sale_pool = self.pool.get('sale.order')
        res = super(procurement_order, self).write(cr, uid, ids, vals, context=context)
        if vals.get('state',"") == 'done':
            for proc in self.browse(cr, uid, ids, context=context):
                if proc.sale_line_id:
                    sale_pool.createRabbitMQ(cr, uid, sale_pool.browse(cr, uid, proc.sale_line_id.order_id.id), "updateOrder")
        return res
    
        
    
    
