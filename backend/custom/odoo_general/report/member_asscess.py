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
        self.total_asscess = 0
        self.localcontext.update({
                'get_date_after_format': self.get_date_after_format,
                'get_line': self.get_line,
                'get_selection_of_field': self.get_selection_of_field,
                'get_total_asscess': self.get_total_asscess,
                'context': context,
        })
    
    def get_date_after_format(self, date):
        text = ''
        if date:
            date_temp = datetime.strptime(date, DATE_FORMAT)
            text = "%s/%s/%s" % (str(date_temp.day).zfill(2), str(date_temp.month).zfill(2), str(date_temp.year).zfill(4))
        return text
    
    def get_selection_of_field(self, type_key, field):
        type_value = ''
        if type_key:
            dict_temp =  {}
            try:
                dict_temp = dict(self.pool.get('report.member.asscess').fields_get(self.cr, self.uid, field, context=self.localcontext['context'])[field]['selection'])
            except Exception:
                pass
            for i,x in enumerate(dict_temp.keys()):
                if x == type_key:
                    type_value = dict_temp.values()[i]
                    break
        return type_value
    
    def get_line(self, obj):
        line = []
        asscess_total = 0
        for detail in obj.detail_ids:
            date_asscess = False
            partner_name = detail.partner_id.name
            if detail.partner_id.login:
                partner_name += u'(' + detail.partner_id.login + u')'
            asscess_total += detail.number_asscess
            line.append({
                         'date_asscess': detail.date_asscess,
                         'partner_name': partner_name,
                         'number': detail.number_asscess,
                         })
        self.total_asscess = asscess_total
        return line
    
    def get_total_asscess(self):
        amount = self.total_asscess
        return amount
    