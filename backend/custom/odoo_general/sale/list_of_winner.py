# -*- coding: utf-8 -*-
from openerp.osv import osv, fields
from datetime import datetime, timedelta
from openerp.tools import DEFAULT_SERVER_DATE_FORMAT, DEFAULT_SERVER_DATETIME_FORMAT
from openerp.tools.translate import _

class list_of_winner_report(osv.osv):
    _name = 'list.of.winner.report'
    _description = 'List of Winners'
    _columns = {
        'name': fields.char('Name'),
        'date_start': fields.date('From Date', required=True),
        'date_end': fields.date('To Date', required=True),
        'partner_ids': fields.many2many('res.partner', 'list_of_winner_report_partner_rel', 'report_id', 'partner_id', 'Customer'),
        'user_id': fields.many2one('res.users', 'Create User', readonly=True),
        'state': fields.selection([('draft','Draft'),('done','Done')], 'State'),
        'detail_ids': fields.one2many('list.of.winner.report.detail', 'parent_id', 'List of Winners Detail'),
        
        }
    
    def _get_date_start(self, cr, uid, context=None):
        return str(datetime.strptime(fields.datetime.now(), DEFAULT_SERVER_DATETIME_FORMAT) - timedelta(days=30))
    
    _defaults = {
        'user_id': lambda self, cr, uid, context=None: uid,
        'state': 'draft',
        'name': u'Danh sách người trúng thưởng',
        'date_start': _get_date_start,
        'date_end': fields.datetime.now,
        }
    
    def onchange_date(self, cr, uid, ids, date_start, date_end, context=None):
        date_start = date_start and datetime.strptime(date_start, DEFAULT_SERVER_DATE_FORMAT) or False
        date_end = date_end and datetime.strptime(date_end, DEFAULT_SERVER_DATE_FORMAT) or False
        if date_end and date_start and date_start > date_end:
            return {'warning': {
                'title': _('Select date'),
                'message': _("Date Start can't larger than Date End !"),
            }}
        return {}
    
    def create(self, cr, uid, vals, context=None):
        date_start = date_end = False
        if 'date_start' in vals and vals.get('date_start'):
            date_start = datetime.strptime(vals.get('date_start'), DEFAULT_SERVER_DATE_FORMAT)
        if 'date_end' in vals and vals.get('date_end'):
            date_end = datetime.strptime(vals.get('date_end'), DEFAULT_SERVER_DATE_FORMAT)
        if not (date_start and date_end):            
            raise osv.except_osv(_('Error'), _('Must have Date Start and Date End for Report !'))
        if date_start > date_end:
            raise osv.except_osv(_('Error'), _("Date Start can't larger than Date End !"))
        return super(list_of_winner_report, self).create(cr, uid, vals, context=context)
    
    def write(self, cr, uid, ids, vals, context=None):
        for data in self.browse(cr, uid, ids, context=context):
            date_start = 'date_start' in vals and vals.get('date_start') or data.date_start
            date_end = 'date_end' in vals and vals.get('date_end') or data.date_end
            date_start = date_start and datetime.strptime(date_start, DEFAULT_SERVER_DATE_FORMAT) or False
            date_end = date_end and datetime.strptime(date_end, DEFAULT_SERVER_DATE_FORMAT) or False
            if not (date_start and date_end):            
                raise osv.except_osv(_('Error'), _('Must have Date Start and Date End for Report !'))
            if date_start > date_end:
                raise osv.except_osv(_('Error'), _("Date Start can't larger than Date End !"))
        return super(list_of_winner_report, self).write(cr, uid, ids, vals, context=context)
    
    def act_search(self, cr, uid, ids, context=None):
        order_pool = self.pool.get('sale.order')
        detail_pool = self.pool.get('list.of.winner.report.detail')
        for data in self.browse(cr, uid, ids, context):
            domain = [('date_order','>=',data.date_start),('date_order','<=',data.date_end),('number_win','!=',False)]
            if data.partner_ids:
                domain += [('partner_id','in',data.partner_ids.ids)]
            so_ids = order_pool.search(cr, uid, domain, context=context)
            if so_ids:
                for so_obj in order_pool.browse(cr, uid, so_ids, context):
                    for line in so_obj.order_line:
                        vals = {
                                 'code': so_obj.id,
                                 'partner_id': so_obj.partner_id.id,
                                 'number_win': so_obj.number_win,
                                 'product_id': line.product_id.id,
                                 'date_order': so_obj.date_order,
                                 'so_id': so_obj.id,
                                 'parent_id': data.id,
                                 }
                        detail_pool.create(cr, uid, vals, context=context)
        return self.write(cr, uid, ids, {'state': 'done'}, context=context)
    
class list_of_winner_report_detail(osv.osv):
    _name = 'list.of.winner.report.detail'
    _description = 'List of Winners Detail'
    _columns = {
        'code': fields.char('ID'),
        'partner_id': fields.many2one('res.partner', 'User', ondelete='cascade'),
        'so_id': fields.many2one('sale.order', 'SO Win'),
        'number_win': fields.char('Number Win'),
        'product_id': fields.many2one('product.product', 'Product'),
        'date_order': fields.datetime('Time'),
        'parent_id': fields.many2one('list.of.winner.report', 'List of Winners'),
    }
    