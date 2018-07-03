# -*- coding: utf-8 -*-

from openerp import api, tools, SUPERUSER_ID
from openerp.osv import osv, fields, expression
from openerp.tools.translate import _
import json
from openerp.addons.odoo_sync.rabbitmq import RabbitMQ
from datetime import datetime


class product_session_order(osv.osv):
    _inherit = "product.session.order"
  
    
    @api.cr_uid_ids_context
    def action_create_order_point(self, cr, uid, vals, context=None):
        data = []
        partner_pool = self.pool.get('res.partner')
        try:
            data = vals.get('data',False) and eval(vals.get('data',False) )  or []
        except:
            data = vals.get('data',False) or []
        if data:
            for order in data:
                partner_id = False
                partner_search = partner_pool.search(cr, uid, [('website_id','=',order[3][0]),('website_id','!=',False)])
                if not partner_search:
                    partner_search = partner_pool.search(cr, uid, [('login','=',order[3][1])])
                if not partner_search:
                    partner_id = partner_pool.create(cr, uid, {
                                                                       'login':order[3][1],
                                                                       'name':order[3][1],
                                                                       "customer":True,
                                                                       "website_id":order[3][0]
                                                                       })
                else:
                    partner_id = partner_search[0]
                if partner_id:
                    self.create(cr, uid, {
                                           'session_id':order[0],
                                           'code_ids':order[1],
                                           'date':order[2],
                                           'partner_id':partner_id
                                           }, context)
        return True
