# -*- coding: utf-8 -*-
from openerp.osv import osv, fields
from datetime import date, datetime, timedelta
from dateutil import relativedelta
from openerp.tools import DEFAULT_SERVER_DATE_FORMAT, DEFAULT_SERVER_DATETIME_FORMAT
from openerp.tools.translate import _
import calendar

class sale_report_custom(osv.osv):
    _name = 'sale.report.custom'
    _description = 'Sale Report'
    _columns = {
        'name': fields.char('Name'),
        'from_date': fields.date('From Date', required=True),
        'to_date': fields.date('To Date', required=True),
        'partner_ids': fields.many2many('res.partner', 'sale_report_custom_partner_rel', 'sale_id', 'partner_id', 'Customer'),
        'user_id': fields.many2one('res.users', 'Create User', readonly=True),
        'state': fields.selection([('draft','Draft'),('done','Done')], 'State'),
        'detail_ids': fields.one2many('sale.report.custom.detail', 'parent_id', 'Sale Report Details'),
        }
    
    def _get_date_start(self, cr, uid, context=None):
        return str(datetime.strptime(fields.datetime.now(), DEFAULT_SERVER_DATETIME_FORMAT) - timedelta(days=30))
    
    _defaults = {
        'user_id': lambda self, cr, uid, context=None: uid,
        'state': 'draft',
        'name': u'Báo cáo bán hàng',
        'from_date': _get_date_start,
        'to_date': fields.datetime.now,
        }
    
    def onchange_date(self, cr, uid, ids, from_date, to_date, context=None):
        from_date = from_date and datetime.strptime(from_date, DEFAULT_SERVER_DATE_FORMAT) or False
        to_date = to_date and datetime.strptime(to_date, DEFAULT_SERVER_DATE_FORMAT) or False
        if to_date and from_date and from_date > to_date:
            return {'warning': {
                'title': _('Select date'),
                'message': _("From Date can't larger than To Date !"),
            }}
        return {}
    
    def create(self, cr, uid, vals, context=None):
        from_date = to_date = False
        if 'from_date' in vals and vals.get('from_date'):
            from_date = datetime.strptime(vals.get('from_date'), DEFAULT_SERVER_DATE_FORMAT)
        if 'to_date' in vals and vals.get('to_date'):
            to_date = datetime.strptime(vals.get('to_date'), DEFAULT_SERVER_DATE_FORMAT)
        if not (from_date and to_date):            
            raise osv.except_osv(_('Error'), _('Must have From Date and To Date for Report !'))
        if from_date > to_date:
            raise osv.except_osv(_('Error'), _("From Date can't larger than To Date !"))
        return super(sale_report_custom, self).create(cr, uid, vals, context=context)
    
    def write(self, cr, uid, ids, vals, context=None):
        for data in self.browse(cr, uid, ids, context=context):
            from_date = 'from_date' in vals and vals.get('from_date') or data.from_date
            to_date = 'to_date' in vals and vals.get('to_date') or data.to_date
            from_date = from_date and datetime.strptime(from_date, DEFAULT_SERVER_DATE_FORMAT) or False
            to_date = to_date and datetime.strptime(to_date, DEFAULT_SERVER_DATE_FORMAT) or False
            if not (from_date and to_date):            
                raise osv.except_osv(_('Error'), _('Must have From Date and To Date for Report !'))
            if from_date > to_date:
                raise osv.except_osv(_('Error'), _("From Date can't larger than To Date !"))
        return super(sale_report_custom, self).write(cr, uid, ids, vals, context=context)
    
    def act_search(self, cr, uid, ids, context=None):
        detail_pool = self.pool.get('sale.report.custom.detail')
        exchange_pool = self.pool.get('res.partner.history.exchange')
        for data in self.browse(cr, uid, ids, context):
            data.detail_ids.unlink()
            domain = [('date_exchange','>=',data.from_date),('date_exchange','<=',data.to_date)]
            partner_ids = []
            if data.partner_ids:
                partner_ids = data.partner_ids
            else:
                exchange_ids = exchange_pool.search(cr, uid, domain, context=context)
                for exchange_obj in exchange_pool.browse(cr, uid, exchange_ids, context):
                    if exchange_obj.partner_id not in partner_ids:
                        partner_ids.append(exchange_obj.partner_id)
            for partner_obj in partner_ids:
                vals = {}
                stt = 0
                total_k_recharge = 0.0
                total_k_purchase = 0.0
                total_k_balance = 0.0
                date_temp = False
                for history in partner_obj.history_exchange_ids:
                    if history.date_exchange >= data.from_date and history.date_exchange <= data.to_date:
                        if not date_temp or date_temp < history.date_exchange:
                            total_k_balance = history.balance
                            date_temp = history.date_exchange
                        if history.type_exchange == 'addition':
                            total_k_recharge += history.amount_exchange
                        if history.type_exchange == 'subtraction':
                            total_k_purchase += history.amount_exchange
                        
                        vals = {
                                'partner_id': partner_obj.id,
                                'total_k_recharge': total_k_recharge,
                                'total_k_purchase': total_k_purchase,
                                'total_k_balance': total_k_balance,
                                'parent_id': data.id,
                                }
                detail_pool.create(cr, uid, vals, context=context)
        return self.write(cr, uid, ids, {'state': 'done'}, context=context)
    
class sale_report_custom_detail(osv.osv):
    _name = 'sale.report.custom.detail'
    _description = 'Sale Report Detail'
    
    def _sumstt(self, cr, uid, ids, name=None, args=None, context=None):
        res={}
        count=0
        if context is None:
            context = {}
        for data in self.browse(cr, uid, ids, context):
            parent_id = data.parent_id
            if parent_id: 
                count += 1
            res[data.id]=count
        return res
    
    _columns = {
        'name': fields.char('Name'),
        'no': fields.function(_sumstt, type='integer',string='NO.'),
        'partner_id': fields.many2one('res.partner', 'User'),
        'total_k_recharge': fields.float('Total K Recharge'),
        'total_k_purchase': fields.float('Total K Purchase'),
        'total_k_balance': fields.float('Total K Balance'),
        'parent_id': fields.many2one('sale.report.custom', 'Sale Report'),
        }
    