# -*- coding: utf-8 -*-

from openerp.osv import osv, fields
from datetime import datetime, date, timedelta
import calendar
import time
from openerp.tools import DEFAULT_SERVER_DATETIME_FORMAT
from openerp.tools.translate import _
from dateutil import relativedelta

class report_transaction_average(osv.osv):
    _name = 'report.transaction.average'
    _description = 'Transaction Average'
    _columns = {
        'name': fields.char('Name'),
        'from_date': fields.date('From Date', required=True),
        'to_date': fields.date('To Date', required=True),
        'date': fields.date('Create Date', readonly=True),
        'user_id': fields.many2one('res.users', 'Creator', readonly=True),
        'partner_ids': fields.many2many('res.partner', 'report_member_asscess_partner_rel', 'report_id', 'partner_id', 'Customers'),
        'state': fields.selection([('draft','Draft'),('done','Done')], 'Status'),
        'detail_ids': fields.one2many('report.transaction.average.detail', 'parent_id', 'Report Member Asscess Detail'),
        }
    
    def _get_date_start(self, cr, uid, context=None):
        return str(datetime.strptime(fields.datetime.now(), DEFAULT_SERVER_DATETIME_FORMAT) - timedelta(days=30))
    
    _defaults = {
        'name': u'Trung bình giao dịch',
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
        return super(report_transaction_average, self).create(cr, uid, vals, context=context)
    
    def write(self, cr, uid, ids, vals, context=None):
        for data in self.browse(cr, uid, ids, context=context):
            from_date = 'from_date' in vals and vals.get('from_date') or data.from_date
            to_date = 'to_date' in vals and vals.get('to_date') or data.to_date
            if from_date > to_date:
                raise osv.except_osv(_('Error'), _("From Date can't larger than To Date !"))
        return super(report_transaction_average, self).write(cr, uid, ids, vals, context=context)
    
    def act_search(self, cr, uid, ids, context=None):
        detail_pool = self.pool.get('report.transaction.average.detail')
        exchange_pool = self.pool.get('res.partner.history.exchange')
        partner_pool = self.pool.get('res.partner')
        for data in self.browse(cr, uid, ids, context):
            data.detail_ids.unlink()
            partner_ids = []
            if data.partner_ids:
                partner_ids = data.partner_ids.ids
            else:
                partner_ids = partner_pool.search(cr, uid, [('customer','=',True)], context=context)
            
            for partner_obj in partner_pool.browse(cr, uid, partner_ids, context):
                vals = []
                number_subt = 0
                number_add = 0
                amount_subt = 0.0
                amount_add = 0.0
                total_trans = 0
                total_amount = 0.0
                average = 0.0
                if partner_obj.history_exchange_ids:
                    for history in partner_obj.history_exchange_ids:
                        if history.date_exchange >= data.from_date and history.date_exchange <= data.to_date:
                            if history.type_exchange == 'addition':
                                number_add += 1
                                amount_add += history.amount_exchange
                            if history.type_exchange == 'subtraction':
                                number_subt += 1
                                amount_subt += history.amount_exchange
                            total_trans = number_add + number_subt
                            total_amount = amount_add + amount_subt
                            average = total_trans and total_amount/total_trans or 0.0
                            vals = {
                                    'partner_id': partner_obj.id,
                                    'number_subt': number_subt,
                                    'amount_k_subt': amount_subt,
                                    'number_add': number_add,
                                    'amount_k_add': amount_add,
                                    'total_trans': total_trans,
                                    'total_amount_k': total_amount,
                                    'avg_trans': average,
                                    'parent_id': data.id,
                                    }
                    detail_pool.create(cr, uid, vals, context=context)
        return self.write(cr, uid, ids, {'state': 'done'}, context=context)
    
class report_transaction_average_detail(osv.osv):
    _name = 'report.transaction.average.detail'
    _description = 'Transaction Average Detail'
    _columns = {
        'partner_id': fields.many2one('res.partner', 'Customer', ondelete='cascade'),
        'number_subt': fields.integer('Number Transaction (-)'),
        'amount_k_subt': fields.float('Number K Transaction (-)'),
        'number_add': fields.integer('Number Transaction (+)'),
        'amount_k_add': fields.float('Number K Transaction (+)'),
        'total_trans': fields.integer('Total Transaction'),
        'total_amount_k': fields.float('Total K Transaction'),
        'avg_trans': fields.float('Average Transaction'),
        'parent_id': fields.many2one('report.transaction.average', 'Report Member Asscess', ondelete='cascade')
    }
    
    