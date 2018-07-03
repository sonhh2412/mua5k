# -*- coding: utf-8 -*-
import time
from openerp.report import report_sxw
from openerp import pooler

class Parser(report_sxw.rml_parse):
        
    def __init__(self, cr, uid, name, context):
        super(Parser, self).__init__(cr, uid, name, context=context)
        pool = pooler.get_pool(self.cr.dbname)
        self.localcontext.update({
            'get_birthday': self.get_birthday,
            'get_selection_of_field': self.get_selection_of_field,
            'get_address': self.get_address,
            'context': context,
        })
        
    
    def get_birthday(self, obj):
        year = obj.year_of_birth or False
        month = obj.month_of_birth or False
        day = obj.day_of_birth and obj.day_of_birth.name or False
        str_date = ''
        if day and month and year:
            str_date = '%s/%s/%s' % (day and str(day).zfill(2) or '  ',month and str(month).zfill(2) or '  ',year and str(year).zfill(4) or '    ')
        return str_date
    
    def get_address(self, obj):
        tmp_address = [obj.street, obj.street2, obj.city, obj.state_id and obj.state_id.name or False, obj.zip, obj.country_id and obj.country_id.name or False]
        temp_address = [u'%s'%x for x in tmp_address if x]
        return u', '.join(temp_address)
    
    def get_selection_of_field(self, type_key, field):
        type_value = ''
        if type_key:
            dict_temp =  {}
            try:
                dict_temp = dict(self.pool.get('res.partner').fields_get(self.cr, self.uid, field, context=self.localcontext['context'])[field]['selection'])
            except Exception:
                pass
            for i,x in enumerate(dict_temp.keys()):
                if x == type_key:
                    type_value = dict_temp.values()[i]
                    break
        return type_value
