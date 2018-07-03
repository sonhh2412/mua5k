# -*- coding: utf-8 -*-
from openerp import api, tools, SUPERUSER_ID
from openerp.osv import osv, fields, expression
import openerp.addons.decimal_precision as dp
from openerp.tools.translate import _

class category_convert(osv.osv):
    _name = "category.convert"
    _inherit = ['mail.thread']
    _description = "Category Convert"

    _columns = {
        'name': fields.char('Name', required=True, translate=True),
        'code': fields.char('Code', required=True, translate=True),
        'amount': fields.integer('Amount Converted'),
        'icsc_unique': fields.boolean('Is Unique'),
        'product_ids':fields.many2many('product.product','category_convert_product_rel','category_convert_id','product_id', 'Products', 
                            domain="[('config_ids','=',False)]"),
    }
    
    _sql_constraints = [
        ('number_uniq', 'unique(name)','Name must be unique!'),
        ('amount', 'CHECK (amount>=1)', 'Amount Converted must be greater than to 0!'),
    ] 
    
    _defaults = {
        'icsc_unique': False,
    }
    
    def write(self, cr, uid, ids, vals, context=None):
        if not context:
            context = dict(context)
        context.update({'convert':True})   
        for data in self.browse(cr, uid, ids, context=context):
            if vals.get('product_ids') and vals.get('product_ids')[0][2]:
                self.pool.get('product.product').write(cr, uid, vals.get('product_ids')[0][2], {'point_price': vals.get('amount',data.amount)}, context=context)
                pids = data.product_ids.ids                
                if pids: 
                    checkids = filter(lambda x: x not in vals.get('product_ids')[0][2] ,pids)
                    if checkids:
                        self.pool.get('product.product').write(cr, uid, checkids, {'point_price': 0}, context=context)
        res = super(category_convert, self).write(cr, uid, ids, vals, context=context)
        return res
    
    def unlink(self, cr, uid, ids, context=None):
        for data in self.browse(cr, uid, ids, context=context):
            if data.icsc_unique:
                raise osv.except_osv(_('Warning!'), _('Cannot Delete.'))
        return super(category_convert, self).unlink(cr, uid, ids, context=context)
    