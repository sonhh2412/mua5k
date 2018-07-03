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
        self.localcontext.update({
                'get_line': self.get_line,
                'get_date_after_format': self.get_date_after_format,
        })
    
    def get_date_after_format(self, date):
        text = ''
        if date:
            date_temp = datetime.strptime(date, DATE_FORMAT)
            text = "%s/%s/%s" % (str(date_temp.day).zfill(2), str(date_temp.month).zfill(2), str(date_temp.year).zfill(4))
        return text
    
    def get_line(self, obj):
        line = []
        for detail in obj.detail_ids:
            date_order = False
            partner_name = detail.partner_id.name
            if detail.partner_id.login:
                partner_name += u'(' + detail.partner_id.login + u')'
            if detail.date_order:
                date_tmp = datetime.strptime(detail.date_order, DATETIME_FORMAT) + timedelta(hours=7)
                date_order = "%s/%s/%s %s" % (str(date_tmp.day), str(date_tmp.month), str(date_tmp.year), str(date_tmp.time()))
            line.append({
                         'code': detail.code,
                         'partner_name': partner_name,
                         'number_win': detail.number_win,
                         'product_id': detail.product_id.name,
                         'date_order': date_order,
                         'so_id': detail.so_id.name,
                         })
        return line
