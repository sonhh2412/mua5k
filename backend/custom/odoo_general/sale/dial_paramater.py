# -*- coding: utf-8 -*-

from openerp import api, tools, SUPERUSER_ID
from openerp.osv import osv, fields, expression

import openerp.addons.decimal_precision as dp

class dial_parameter(osv.osv):
    _name = "dial.parameter"
    _inherit = ['mail.thread']
    _description = "Dial Parameter"
    
    _columns = {
                'name': fields.char('Name'),
                'before': fields.float('Before'),
                'after': fields.float('After'),
                }
    
    _sql_constraints = [
        ('before', 'CHECK (before>=0.08 and after>=0.08)',  'The Before and After must be greater than 5 !'),
    ]