# -*- coding: utf-8 -*-
from openerp import SUPERUSER_ID
from openerp.osv import osv, fields
from openerp.tools import DEFAULT_SERVER_DATE_FORMAT, DEFAULT_SERVER_DATETIME_FORMAT
from openerp.tools.translate import _
import openerp.addons.decimal_precision as dp
import time

class purchase_order(osv.osv):
    _inherit = "purchase.order"
    
    def _check_is_purchaser(self, cr, uid, ids, field_name, arg, context):
        res = {}
        for data in self.browse(cr, uid, ids, context):
            group_purchase_id = self.pool.get('ir.model.data').get_object_reference(cr, uid, 'purchase', 'group_purchase_user')[1]
            user = self.pool.get('res.users').browse(cr, uid, uid, context)
            if group_purchase_id in user.groups_id.ids or uid == SUPERUSER_ID:
                res[data.id] = True
            else:
                res[data.id] = False
        return res
    
    _columns = {
        'is_purchaser': fields.function(_check_is_purchaser, type='boolean', string='Is Purchaser'),       
        }
    
    _defaults = {
        'is_purchaser': True,
                 }
    
   
    
    
