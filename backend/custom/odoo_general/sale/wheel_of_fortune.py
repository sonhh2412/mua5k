# -*- coding: utf-8 -*-

from openerp import api, tools, SUPERUSER_ID
from openerp.osv import osv, fields, expression
from datetime import datetime
from dateutil.relativedelta import relativedelta
import time
import openerp.addons.decimal_precision as dp


class wheel_of_fortune(osv.osv):
    _name = "wheel.of.fortune"
    _inherit = ['mail.thread']
    _description = "Wheel of Fortune"
    
    def _get_order_lines(self, cr, uid, ids, field_name, arg, context=None):
        res = {}
        for lucky in self.browse(cr, uid, ids, context=context):
            if lucky.session_id:
                res[lucky.id] = self.pool.get('sale.order.line').search(cr,uid,[('session_id', '=', lucky.session_id.id),('order_id', '!=', 'cancel')], limit=100, order='time_sale desc', context=context)
       
        return res
    
    _columns = {
        'name': fields.char('Name', translate=True, select=False),
        'product_id': fields.many2one('product.product','Product'),
        'amount_total': fields.float('Total'),
        'number_of_participants': fields.integer('Number of Participants'),
        'number_winning': fields.integer('Number Winning'),
        'lottery_results': fields.integer('Lottery Results'),
        'session_ids': fields.many2many('product.session', 'wheel_of_fortune_session_rel', 'fortune_id', 'session_id', 'Session'),
        'order_lines': fields.function(_get_order_lines, type="one2many", obj='sale.order.line', string="Order Lines"),
        'state': fields.selection([('draft', 'Draft'),('cancel', 'Cancelled'),('progress', 'Dialing'),('done', 'Done')], 'Status', readonly=True, copy=False),
    }
    
    _defaults = {
        'state': 'draft',
    }
    
    def create(self, cr, uid, vals, context=None):
        if context is None:
            context = {}
        vals['name'] = self.pool.get('ir.sequence').get(cr, uid, 'wheel.of.fortune', context=context) or '/'
        new_id = super(wheel_of_fortune, self).create(cr, uid, vals, context=context)
        return new_id
    
    def get_session(self, cr, uid, ids, context=None): 
        for data in self.browse(cr, uid, ids, context=context):
            pramater = self.pool.get('ir.model.data').get_object(cr, uid, 'odoo_general', 'dial_parameter_default')
            before = pramater.before
            date_time_now = datetime.strptime(time.strftime('%Y-%m-%d 17:00:00'),'%Y-%m-%d %H:%M:%S') 
            date_time_now = date_time_now - relativedelta(hours=before)
            session_ids = []
            query = """select ps.id, date_stop, date_start, dial_immediately, to_timestamp(date_stop, 'DD-MM-YYYY hh24:mi:ss.MS')  
                        from product_session ps
                        inner join product_product pp on ps.product_id = pp.id
                        inner join product_template pt on pt.id = pp.product_tmpl_id
                        where dial_immediately = True and date_stop is not null and date_start is not null and is_dial = False 
                        and to_timestamp(date_stop, 'DD-MM-YYYY hh24:mi:ss.MS')  < TIMESTAMP '"""+str(date_time_now)+"""'
                        """
            cr.execute(query)
            for item in cr.dictfetchall():
                session_ids.append(item['id'])    
            vals = {'session_ids' :[(6,0,session_ids)],'state': 'progress'}
            self.write(cr, uid, data.id, vals)
        return True
                
    def act_dial(self, cr, uid, ids, context=None): 
        self.get_session(cr, uid, ids, context)
        for data in self.browse(cr, uid, ids, context=context):
            if data.session_ids:
                data.session_ids.write({'dial_realtime': data.lottery_results})
                time.sleep(3)
                data.session_ids.action_dial()
        return self.write(cr, uid, data.id, {'state': 'done'})
             