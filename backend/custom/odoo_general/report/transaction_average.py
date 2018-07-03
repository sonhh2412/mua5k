# -*- coding: utf-8 -*-
import time
from openerp.report import report_sxw
from openerp import pooler
from datetime import date, datetime, timedelta
DATETIME_FORMAT = "%Y-%m-%d %H:%M:%S"
DATE_FORMAT = "%Y-%m-%d"


class Parser(report_sxw.rml_parse):
        
    def __init__(self, cr, uid, name, context):
        super(Parser, self).__init__(cr, uid, name, context=context)
        pool = pooler.get_pool(self.cr.dbname)
        self.total_number_subt = 0
        self.total_amount_k_subt = 0.0
        self.total_number_add = 0
        self.total_amount_k_add = 0.0
        self.total_total_trans = 0
        self.total_total_amount_k = 0.0
        self.total_avg_trans = 0.0
        self.localcontext.update({
                'get_date_after_format': self.get_date_after_format,
                'get_line': self.get_line,
                'get_total_number_subt': self.get_total_number_subt,
                'get_total_amount_k_subt': self.get_total_amount_k_subt,
                'get_total_number_add': self.get_total_number_add,
                'get_total_amount_k_add': self.get_total_amount_k_add,
                'get_total_total_trans': self.get_total_total_trans,
                'get_total_total_amount_k': self.get_total_total_amount_k,
                'get_total_avg_trans':self.get_total_avg_trans,
        })
    
    def get_date_after_format(self, date):
        text = ''
        if date:
            date_temp = datetime.strptime(date, DATE_FORMAT)
            text = "%s/%s/%s" % (str(date_temp.day).zfill(2), str(date_temp.month).zfill(2), str(date_temp.year).zfill(4))
        return text
    
    def get_line(self, obj):
        line = []
        number_subt_total = 0
        amount_k_subt_total = 0.0
        number_add_total = 0
        amount_k_add_total = 0.0
        total_trans_total = 0
        total_amount_k_total = 0.0
        for detail in obj.detail_ids:
            partner_name = detail.partner_id.name
            if detail.partner_id.login:
                partner_name += u'(' + detail.partner_id.login + u')'
            number_subt_total += detail.number_subt
            amount_k_subt_total += detail.amount_k_subt
            number_add_total += detail.number_add
            amount_k_add_total += detail.amount_k_add
            total_trans_total += detail.total_trans
            total_amount_k_total += detail.total_amount_k
            line.append({
                         'partner_name': partner_name,
                         'number_subt': detail.number_subt,
                         'amount_k_subt': detail.amount_k_subt,
                         'number_add': detail.number_add,
                         'amount_k_add': detail.amount_k_add,
                         'total_trans': detail.total_trans,
                         'total_amount_k': detail.total_amount_k,
                         'avg_trans': round(detail.avg_trans,2),
                         })
        self.total_number_subt = number_subt_total
        self.total_amount_k_subt = amount_k_subt_total
        self.total_number_add = number_add_total
        self.total_amount_k_add = amount_k_add_total
        self.total_total_trans = total_trans_total
        self.total_total_amount_k = total_amount_k_total
        self.total_avg_trans = round(total_amount_k_total / total_trans_total, 2)
        return line
    
    def get_total_number_subt(self):
        return self.total_number_subt
    
    def get_total_amount_k_subt(self):
        return self.total_amount_k_subt
    
    def get_total_number_add(self):
        return self.total_number_add
    
    def get_total_amount_k_add(self):
        return self.total_amount_k_add
    
    def get_total_total_trans(self):
        return self.total_total_trans
    
    def get_total_total_amount_k(self):
        return self.total_total_amount_k
    
    def get_total_avg_trans(self):
        return self.total_avg_trans
    
    