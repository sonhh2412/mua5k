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
                'get_date_after_format': self.get_date_after_format,
        })
    
    def get_date_after_format(self, date):
        text = ''
        if date:
            date_temp = datetime.strptime(date, DATE_FORMAT)
            text = "%s/%s/%s" % (str(date_temp.day).zfill(2), str(date_temp.month).zfill(2), str(date_temp.year).zfill(4))
        return text
    
