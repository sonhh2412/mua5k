# -*- coding: utf-8 -*-
import time
from openerp.report import report_sxw
from openerp import pooler
from datetime import date, datetime, timedelta
DATETIME_FORMAT = "%Y-%m-%d %H:%M:%S"
DATE_FORMAT = "%Y-%m-%d"
DATETIME_VN_FORMAT = "%d-%m-%Y %H:%M:%S"
DATE_VN_FORMAT = "%d-%m-%Y"

class Parser(report_sxw.rml_parse):
        
    def __init__(self, cr, uid, name, context):
        super(Parser, self).__init__(cr, uid, name, context=context)
        pool = pooler.get_pool(self.cr.dbname)
        self.localcontext.update({
                'get_vietnam_format': self.get_vietnam_format,
                'get_user': self.get_user,
                'get_product': self.get_product,
                'get_line': self.get_line,
                'context': context,
        })
        
    def get_vietnam_format(self, date):
        str_date = ''
        if date:
            date = datetime.strptime(date, DATETIME_FORMAT) + timedelta(hours=7)
            str_date = datetime.strftime(date, DATETIME_VN_FORMAT)
        return str_date
    
    def get_user(self, obj):
        name_tmp = self.pool.get('res.partner').name_get(self.cr, self.uid, obj.member_ids.ids, context=self.localcontext['context'])
        list_user = '; '.join(map(lambda x: x[1], [x for x in name_tmp]))
        return list_user
    
    def get_product(self, obj):
        name_tmp = self.pool.get('product.product').name_get(self.cr, self.uid, obj.product_ids.ids, context=self.localcontext['context'])
        list_product = '; '.join(map(lambda x: x[1], [x for x in name_tmp]))
        return list_product
    
    def get_line(self, obj):
        line = []
        for detail in obj.detail_ids:
            date_transaction = False
            if detail.date_transaction:
                date_tmp = datetime.strptime(detail.date_transaction, DATETIME_FORMAT) + timedelta(hours=7)
                date_transaction = "%s/%s/%s %s" % (str(date_tmp.day), str(date_tmp.month), str(date_tmp.year), str(date_tmp.time()))
            product_name = False
            if detail.product_id:
                product_name = self.pool.get('product.product').name_get(self.cr, self.uid, detail.product_id.id, context=self.localcontext['context'])[0][1]
            line.append({
                         'member_id': detail.member_id,
                         'member_nickname': detail.member_nickname,
                         'product_id': product_name,
                         'codes': detail.codes,
                         'amount_exchange': detail.amount_exchange,
                         'date_exchange': date_transaction,
                         'milisecond': detail.milisecond,
                         })
        return line
