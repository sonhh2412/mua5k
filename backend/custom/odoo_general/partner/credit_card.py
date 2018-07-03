# -*- coding: utf-8 -*-

from openerp.osv import osv, fields
from datetime import datetime
from openerp.tools.translate import _
import pytz

_STATE = [('draft','Draft'),('update','Update members'),('done','Done')]
_TYPE = [('addition','+'),('subtraction','-')]
class credit_card_member(osv.osv):
    _name = 'credit.card.member'
    _description = "Credit Card"
    _inherit = ['mail.thread']
    _order = 'name desc'

    _columns = {
        'name': fields.char('Name', track_visibility='onchange'),
        'user_id': fields.many2one('res.users', 'Creator', readonly=True),
        'date': fields.char('Create Date', readonly=True),
        'state': fields.selection(_STATE, 'State', track_visibility='onchange'),
        'detail_ids': fields.one2many('credit.card.member.detail', 'ref_id', 'Details'),
                }
    
    def get_create_date(self, cr, uid, context=None):
        datetmp = datetime.now()
        return datetime.strftime(datetmp, '%d-%m-%Y %H:%M:%S.%f')
    
    _defaults = {
        'user_id': lambda self, cr, uid, ctx={}: uid,
        'date': get_create_date,
        'create_date': datetime.now(),
        'state': 'draft',
                 }
    
    def act_update_credit(self, cr, uid, ids, context=None):
        exchange_obj = self.pool.get('res.partner.history.exchange')
        for data in self.browse(cr, uid, ids, context=context):
            if not data.detail_ids:
                raise osv.except_osv(_('Thông báo'), _("Vui lòng nhập ít nhất 1 dòng dữ liệu ở danh sách chi tiết nạp tiền!"))
            date_conver = datetime.strptime(data.date,'%d-%m-%Y %H:%M:%S.%f')
            local = pytz.timezone(context.get('tz') or 'UTC')
            local_dt = local.localize(date_conver, is_dst=None)
            utc_dt = local_dt.astimezone(pytz.utc)
            for line in data.detail_ids:
                exchange_obj.create(cr, uid, {
                                    'partner_id': line.partner_id.id,
                                    'date_exchange': date_conver,
                                    'type_exchange': line.type,
                                    'amount_exchange': line.amount,
                                    'millisecond': utc_dt.microsecond/1000,
                                        }, context=context)
        return self.write(cr, uid, ids, {'state':'done'}, context=context)
    
    def create(self, cr, uid, vals, context=None):
        if context is None:
            context = {}
        if vals.get('name', '/') == '/':
            vals['name'] = self.pool.get('ir.sequence').get(cr, uid, 'name.credit.card', context=context) or '/'
        new_id = super(credit_card_member, self).create(cr, uid, vals, context=context)
        return new_id
    
    def unlink(self, cr, uid, ids, context=None):
        for data in self.browse(cr, uid, ids, context):
            if data.state == 'done':
                raise osv.except_osv(_('Invalid Action'), _("You can not delete Credit Card with state id Done !"))
        return super(credit_card_member, self).unlink(cr, uid, ids, context=context)    

class credit_card_member_detail(osv.osv):
    _name = 'credit.card.member.detail'
    _description = "Credit Card Detail"
    
    _columns = {
        'ref_id': fields.many2one('credit.card.member', 'Ref id'),
        'stt': fields.integer('No'),
        'partner_id': fields.many2one('res.partner', 'Customers', domain = [('customer','=',True)], ondelete='restrict'),
        'type': fields.selection(_TYPE, 'Type'),
        'amount': fields.float('Amount'),
        'reason': fields.many2one('credit.card.reason', 'Reason')
    }
    
    def create(self, cr, uid, vals, context=None):
        if vals.get('ref_id'):
            self.pool.get('credit.card.member').write(cr, uid, vals.get('ref_id'), {'state' : 'update'}, context=context)
        return super(credit_card_member_detail, self).create(cr, uid, vals, context=context)
    
class credit_card_reason(osv.osv):
    _name = 'credit.card.reason'
    
    _columns = {
        'name' : fields.char('Reason')
                }