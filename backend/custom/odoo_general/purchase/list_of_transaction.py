# -*- coding: utf-8 -*-

from openerp.osv import osv, fields
from datetime import datetime, timedelta
from openerp.tools import DEFAULT_SERVER_DATETIME_FORMAT
from openerp.tools.translate import _

class list_of_transaction(osv.osv):
    _name = 'list.of.transaction'
    _description = "List of Transaction"
    
    _columns = {
            'name': fields.char('Name'),
            'from_date': fields.datetime('From Date', required=True),
            'to_date': fields.datetime('To Date', required=True),
            'user_id': fields.many2one('res.users', 'Creator'),
            'member_ids': fields.many2many('res.partner', 'list_of_transaction_res_partner_rel', 'list_id', 'user_id', string='User'),
            'product_ids': fields.many2many('product.product', 'list_of_transaction_product_product_rel', 'list_id', 'product_id', 'Product'),
            'detail_ids': fields.one2many('list.of.transaction.detail', 'list_id', 'Detail List of Transaction'),
            'state': fields.selection([('draft','Draft'),('done','Done')], 'State'),
                }
    
    def _get_date_start(self, cr, uid, context=None):
        return str(datetime.strptime(fields.datetime.now(), DEFAULT_SERVER_DATETIME_FORMAT) - timedelta(days=30))
    
    _defaults = {
            'state': 'draft',
            'name': u'Danh sách giao dịch',
            'user_id': lambda self, cr, uid, ctx={}: uid,
            'from_date': _get_date_start,
            'to_date': fields.datetime.now,
                 }
    
    def onchange_date(self, cr, uid, ids, from_date, to_date, context=None):
        from_date = from_date and datetime.strptime(from_date, DEFAULT_SERVER_DATETIME_FORMAT) or False
        to_date = to_date and datetime.strptime(to_date, DEFAULT_SERVER_DATETIME_FORMAT) or False
        if to_date and from_date and from_date > to_date:
            return {'warning': {
                'title': _('Select date'),
                'message': _("From Date can't larger than To Date !"),
            }}
        return {}
    
    def create(self, cr, uid, vals, context=None):
        from_date = to_date = False
        if 'from_date' in vals and vals.get('from_date'):
            from_date = datetime.strptime(vals.get('from_date'), DEFAULT_SERVER_DATETIME_FORMAT)
        if 'to_date' in vals and vals.get('to_date'):
            to_date = datetime.strptime(vals.get('to_date'), DEFAULT_SERVER_DATETIME_FORMAT)
        if not (from_date and to_date):            
            raise osv.except_osv(_('Error'), _('Must have From Date and To Date for Report !'))
        if from_date > to_date:
            raise osv.except_osv(_('Error'), _("From Date can't larger than To Date !"))
        return super(list_of_transaction, self).create(cr, uid, vals, context=context)
    
    def write(self, cr, uid, ids, vals, context=None):
        for data in self.browse(cr, uid, ids, context=context):
            from_date = 'from_date' in vals and vals.get('from_date') or data.from_date
            to_date = 'to_date' in vals and vals.get('to_date') or data.to_date
            from_date = from_date and datetime.strptime(from_date, DEFAULT_SERVER_DATETIME_FORMAT) or False
            to_date = to_date and datetime.strptime(to_date, DEFAULT_SERVER_DATETIME_FORMAT) or False
            if not (from_date and to_date):            
                raise osv.except_osv(_('Error'), _('Must have From Date and To Date for Report !'))
            if from_date > to_date:
                raise osv.except_osv(_('Error'), _("From Date can't larger than To Date !"))
        return super(list_of_transaction, self).write(cr, uid, ids, vals, context=context)
    
    def act_search(self, cr, uid, ids, context=None):
        history_obj = self.pool.get('res.partner.history.exchange')
        detail_obj = self.pool.get('list.of.transaction.detail')
        for data in self.browse(cr, uid, ids, context=context):
            data.detail_ids.unlink()
            domain_search = [('date_exchange','>=',data.from_date),('date_exchange','<=',data.to_date)]
            domain_search += data.member_ids and [('partner_id','in',data.member_ids.ids)] or []
            domain_search += data.product_ids and [('product_id','in',data.product_ids.ids)] or []
            history_ids = history_obj.search(cr, uid, domain_search, context=context)
            print history_ids, domain_search
            for history in history_obj.browse(cr, uid, history_ids, context=context):
                vals_detail = {
                        'member_id': history.partner_id.identity,
                        'member_nickname': history.partner_id.login,
                        'date_transaction': history.date_exchange,
                        'millisecond': history.millisecond,
                        'list_id': data.id,
                               }
                if history.type_exchange == 'subtraction':
                    vals_detail.update({
                                'product_id': history.product_id and history.product_id.id or False,
#                                 'code_ids': [(6,0,history.codes.ids)],
                                'codes': history.codes,
                                'amount_exchange': history.amount_exchange,
                                       })
                detail_obj.create(cr, uid, vals_detail, context=context)
        return self.write(cr, uid, ids, {'state': 'done'}, context=context)
    
class list_of_transaction_detail(osv.osv):
    _name = 'list.of.transaction.detail'
    _description = "Detail List of Transaction"
    _columns = {
        'list_id': fields.many2one('list.of.transaction', 'List Id'),
        'member_id': fields.char('ID'),
        'member_nickname': fields.char('Nick name'),
        'product_id': fields.many2one('product.product', 'Product', ondelete='restrict'),
#         'code_ids': fields.many2many('product.session.code', 'list_of_transaction_detail_product_session_code', 'detail_id', 'code_id', 'Codes'),
        'codes': fields.text('Codes'),
        'amount_exchange': fields.float('Number K'),
        'date_transaction': fields.datetime('Date Transaction'),
        'milisecond': fields.integer('Milisecond'),
    }