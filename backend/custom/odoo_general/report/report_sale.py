# -*- coding: utf-8 -*-
from openerp.report import report_sxw
from openerp import pooler
from datetime import date, datetime, timedelta
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
            partner_name = detail.partner_id.name
            if detail.partner_id.login:
                partner_name += u'(' + detail.partner_id.login + u')'
            line.append({
                         'stt': detail.no,
                         'partner_name': partner_name,
                         'total_k_recharge': detail.total_k_recharge,
                         'total_k_purchase': detail.total_k_purchase,
                         'total_k_balance': detail.total_k_balance,
                         })
        return line
