# -*- coding: utf-8 -*-
import time
from openerp.report import report_sxw
from openerp import pooler
from datetime import datetime
DATETIME_FORMAT = "%Y-%m-%d %H:%M:%S"
DATE_FORMAT = "%Y-%m-%d"

class Parser(report_sxw.rml_parse):
        
    def __init__(self, cr, uid, name, context):
        super(Parser, self).__init__(cr, uid, name, context=context)
        pool = pooler.get_pool(self.cr.dbname)
        self.localcontext.update({
            'get_vietnam_date': self.get_vietnam_date,
            'get_name_get_product': self.get_name_get_product,
            'context': context,
        })
        
    def get_name_get_product(self, product_id):
        name_product = ''
        if product_id:
            name_product = self.pool.get('product.product').name_get(self.cr, self.uid, product_id, context=self.localcontext['context'])[0][1]
        return name_product
    
    def get_vietnam_date(self, date_value):
        str_date = ''
        if date_value:
            date_tmp = datetime.strptime(date_value,DATE_FORMAT)
            str_date = '%s/%s/%s' % (str(date_tmp.day).zfill(2), str(date_tmp.month).zfill(2), str(date_tmp.year).zfill(4))
        return str_date
