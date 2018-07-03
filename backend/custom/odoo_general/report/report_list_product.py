# -*- coding: utf-8 -*-
import time
from openerp.report import report_sxw
from openerp import pooler

class Parser(report_sxw.rml_parse):
        
    def __init__(self, cr, uid, name, context):
        super(Parser, self).__init__(cr, uid, name, context=context)
        pool = pooler.get_pool(self.cr.dbname)
        self.localcontext.update({
            'get_selection_of_field': self.get_selection_of_field,
            '_get_name_get_product': self._get_name_get_product,
            'context': context,
        })
        
    def _get_name_get_product(self, obj):
        name_categ = ''
        if obj.categ_id:
            name_categ = self.pool.get('product.category').name_get(self.cr, self.uid, obj.categ_id.id, context=self.localcontext['context'])[0][1]
        return name_categ
    
    def get_selection_of_field(self, type_key, field):
        type_value = ''
        if type_key:
            dict_temp =  {}
            try:
                dict_temp = dict(self.pool.get('product.product').fields_get(self.cr, self.uid, field, context=self.localcontext['context'])[field]['selection'])
            except Exception:
                pass
            for i,x in enumerate(dict_temp.keys()):
                if x == type_key:
                    type_value = dict_temp.values()[i]
                    break
        return type_value
