# -*- coding: utf-8 -*-

from openerp.osv import osv, fields
from datetime import datetime, timedelta
import calendar
import time
from openerp.tools import DEFAULT_SERVER_DATETIME_FORMAT
from openerp.tools.translate import _
from dateutil import relativedelta

class buy_credit_k(osv.osv):
    _name = 'buy.credit.k'
    _description = 'Buy Credit K'
    _columns = {
            'name': fields.char('Name'),
            'user_id': fields.many2one('res.users', 'Creator', readonly=True),
            'date': fields.date('Create Date', readonly=True),
            'from_date': fields.date('From Date', required=True),
            'to_date': fields.date('To Date', required=True),
            'detail_ids': fields.one2many('buy.credit.k.detail', 'parent_id', 'By Credit K'),
            'state': fields.selection([('draft','Draft'),('done','Done')],'Status'),
            }
    
    def _get_date_start(self, cr, uid, context=None):
        return str(datetime.strptime(fields.datetime.now(), DEFAULT_SERVER_DATETIME_FORMAT) - timedelta(days=30))
    
    _defaults = {
            'name': u'Số K đã mua',
            'date': datetime.now(),
            'user_id': lambda self, cr, uid, context=None: uid,
            'state': 'draft',
            'from_date': _get_date_start,
            'to_date': fields.datetime.now,
            }
    
    def onchange_date(self, cr, uid, ids, from_date, to_date, context=None):
        if to_date and from_date and from_date > to_date:
            raise osv.except_osv(_('Error'), _("From Date can't larger than To Date !"))
        return True
    
    def create(self, cr, uid, vals, context=None):
        from_date = to_date = False
        if 'from_date' in vals and vals.get('from_date'):
            from_date = vals.get('from_date')
        if 'to_date' in vals and vals.get('to_date'):
            to_date = vals.get('to_date')
        if from_date > to_date:
            raise osv.except_osv(_('Error'), _("From Date can't larger than To Date !"))
        return super(buy_credit_k, self).create(cr, uid, vals, context=context)
    
    def write(self, cr, uid, ids, vals, context=None):
        for data in self.browse(cr, uid, ids, context=context):
            from_date = 'from_date' in vals and vals.get('from_date') or data.from_date
            to_date = 'to_date' in vals and vals.get('to_date') or data.to_date
            if from_date > to_date:
                raise osv.except_osv(_('Error'), _("From Date can't larger than To Date !"))
        return super(buy_credit_k, self).write(cr, uid, ids, vals, context=context)
    
    def act_search(self, cr, uid, ids, context=None):
        detail_pool = self.pool.get('buy.credit.k.detail')
        exchange_pool = self.pool.get('res.partner.history.exchange')
        for data in self.browse(cr, uid, ids, context):
            data.detail_ids.unlink()
            exchange_ids = exchange_pool.search(cr, uid, [('date_exchange','>=',data.from_date),('date_exchange','<=',data.to_date)], context=context)
            total_k = 0.0
            partner_ids = []
            vals = []
            if exchange_ids:
                for exchange_obj in exchange_pool.browse(cr, uid, exchange_ids, context):
                    partner_id = exchange_obj.partner_id and exchange_obj.partner_id.id or False
                    if exchange_obj.type_exchange == 'addition' and partner_id != False:
                        total_k += exchange_obj.amount_exchange
                        if partner_id not in partner_ids:
                            partner_ids.append(partner_id)
                number_user = len(partner_ids)
                avg = total_k and round(total_k/number_user,2) or 0.0
                vals = {
                        'total_k': total_k,
                        'number_user': number_user,
                        'avg_k_user': avg,
                        'parent_id': data.id,
                        }
                detail_pool.create(cr, uid, vals, context=context)
        return self.write(cr, uid, ids, {'state': 'done'}, context=context)
    
class buy_credit_k_detail(osv.osv):
    _name = 'buy.credit.k.detail'
    _description = 'Buy Credit K'
    _columns = {
            'total_k': fields.float('Total K'),
            'number_user': fields.integer('Number User'),
            'avg_k_user': fields.float('Average K/Number User'),
            'parent_id': fields.many2one('buy.credit.k', 'Buy Credit K')  
            }
    