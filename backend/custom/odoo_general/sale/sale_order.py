# -*- coding: utf-8 -*-
from openerp import SUPERUSER_ID
from openerp.osv import osv, fields
from openerp.tools import DEFAULT_SERVER_DATE_FORMAT, DEFAULT_SERVER_DATETIME_FORMAT
from openerp.tools.translate import _
import openerp.addons.decimal_precision as dp
import time

class sale_order(osv.osv):
    _inherit = "sale.order"
    
    _columns = {
                'time_sale': fields.char('Date Order/Website'),# Thoi gian kieu quy doi luu tu tren web xuong
                'is_dial':fields.boolean('Dial Sale Order'),
                'product_session_id':fields.many2one('product.session','Product Session'),
                'number_win': fields.related('product_session_id', 'number_win', type='char', string='Codes'),
                }
    _defaults = {
                 'is_dial':False,
                 }
    
    def act_done(self, cr, uid, ids, context=None):
        return self.write(cr, uid, ids, {'state': 'done'}, context=context)
   
class sale_order_line(osv.osv):
    _inherit = "sale.order.line"
    
    def _get_route_dropship_id(self, cr, uid, context=None):
        if context is None:
            context = {}
        res = self.pool.get('stock.location.route').search(cr, uid, [('name', '=', "Drop Shipping" )])
        result = map(lambda x: x, res)
        return result and result[0] or False
    
    _defaults = {
        'route_id':_get_route_dropship_id
    }
    
    def write(self, cr, uid, ids, vals, context=None):
        if isinstance(ids, (int, long)):
            ids = [ids]
        if not vals.get('route_id'):
            vals['route_id'] = self._get_route_dropship_id(cr, uid, context)
        res = super(sale_order_line, self).write(cr, uid, ids, vals, context=context)
        return res
    
    def create(self, cr, uid, vals, context=None):
        if vals.get('product_id'):
            product = self.pool.get('product.product').browse(cr, uid, vals.get('product_id'))
            vals['delay'] = product.sale_delay
        return super(sale_order_line, self).create(cr, uid, vals, context=context)
    

    
