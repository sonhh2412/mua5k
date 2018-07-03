# -*- coding: utf-8 -*-

from openerp.osv import osv, fields

class wizard_select_products(osv.osv_memory):
    _name = 'wizard.select.products'
    _description = "Selection Products"
    
    _columns = {
        'product_ids': fields.many2many('product.product', 'select_products_rel', 'select_id', 'product_id', 'Products'),
        'convert_id': fields.many2one('category.convert', 'Ref id'),
                }
    
    def default_get(self, cr, uid, fields, context=None):
        if context is None:
            context = {}
        res = super(wizard_select_products, self).default_get(cr, uid, fields, context=context)
        if context.get('active_model','') == 'category.convert':
            res.update({'convert_id': context.get('active_id',False)})
        return res
    
    def onchange_product_ids(self, cr, uid, ids, product_ids, context=None):
        convert_pool = self.pool.get('category.convert')
        if not product_ids:
            return {}
        convert_ids = convert_pool.search(cr, uid, [], context=context)
        product_temp_ids = []
        if convert_ids:
            for convert_obj in convert_pool.browse(cr, uid, convert_ids, context):
                if convert_obj.product_ids:
                    for product in convert_obj.product_ids:
                        product_temp_ids.append(product.id)
        return {'domain': {'product_ids':  [('id','not in',product_temp_ids)]}}
    
    def act_select(self, cr, uid, ids, context=None):
        convert_obj = self.pool.get('category.convert')
        for data in self.browse(cr, uid, ids, context):
            vals = []
            if data.convert_id.product_ids:
                for line in data.convert_id.product_ids:
                    vals.append(line.id)
            if data.product_ids:
                for line_new in data.product_ids:
                    vals.append(line_new.id)
            convert_obj.write(cr, uid, data.convert_id.id, {'product_ids': [(6,0,vals)]}, context=context)
        return True
    
    