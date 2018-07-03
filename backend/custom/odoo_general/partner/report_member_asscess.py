# -*- coding: utf-8 -*-

from openerp.osv import osv, fields
from datetime import datetime, date, timedelta
import calendar
import time
from openerp.tools import DEFAULT_SERVER_DATETIME_FORMAT
from openerp.tools.translate import _
from dateutil import relativedelta

class report_member_asscess(osv.osv):
    _name = 'report.member.asscess'
    _description = 'Report Member Asscess'
    _columns = {
        'name': fields.char('Name'),
        'from_date': fields.date('From Date', required=True),
        'to_date': fields.date('To Date', required=True),
        'date': fields.date('Create Date', readonly=True),
        'user_id': fields.many2one('res.users', 'Creator', readonly=True),
        'type': fields.selection([('day','Day'),('week','Week'),('month','Month')], 'Type', required=True),
        'partner_ids': fields.many2many('res.partner', 'report_member_asscess_partner_rel', 'report_id', 'partner_id', 'Customers'),
        'state': fields.selection([('draft','Draft'),('done','Done')], 'Status'),
        'detail_ids': fields.one2many('report.member.asscess.detail', 'parent_id', 'Report Member Asscess Detail'),
        }
    
    def _get_date_start(self, cr, uid, context=None):
        return str(datetime.strptime(fields.datetime.now(), DEFAULT_SERVER_DATETIME_FORMAT) - timedelta(days=30))
    
    _defaults = {
        'name': u'Tổng truy cập',
        'date': datetime.now(),
        'user_id': lambda self, cr, uid, context=None: uid,
        'from_date': _get_date_start,
        'to_date': fields.datetime.now,
        'type': 'month',
        'state': 'draft'
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
        return super(report_member_asscess, self).create(cr, uid, vals, context=context)
    
    def write(self, cr, uid, ids, vals, context=None):
        for data in self.browse(cr, uid, ids, context=context):
            from_date = 'from_date' in vals and vals.get('from_date') or data.from_date
            to_date = 'to_date' in vals and vals.get('to_date') or data.to_date
            if from_date > to_date:
                raise osv.except_osv(_('Error'), _("From Date can't larger than To Date !"))
        return super(report_member_asscess, self).write(cr, uid, ids, vals, context=context)
    
    def act_search(self, cr, uid, ids, context=None):
        detail_pool = self.pool.get('report.member.asscess.detail')
        login_pool = self.pool.get('res.partner.history.login')
        for data in self.browse(cr, uid, ids, context):
            data.detail_ids.unlink()
            _where = ''
            if len(data.partner_ids) == 0:
                _where = ''
            elif len(data.partner_ids) == 1:
                _where = 'and partner_id = %s' % str(data.partner_ids[0].id)
            else:
                part = tuple(data.partner_ids.ids)
                _where = 'and partner_id in %s' % str(part)
            
            cr.execute(''' Select count(id) as number, (date:: TIMESTAMP at time zone 'UTC') :: date as date_asscess, partner_id from res_partner_history_login where date >= %s and date <= %s ''' + _where + '''\
                            group by date_asscess, partner_id order by date_asscess''', (data.from_date, data.to_date))
            
            vals = []
            for item in cr.dictfetchall():
                vals = {
                        'date_asscess': item['date_asscess'],
                        'partner_id': item['partner_id'],
                        'number_asscess': item['number'],
                        'parent_id': data.id,
                        }
                detail_pool.create(cr, uid, vals, context)
        return self.write(cr, uid, ids, {'state': 'done'}, context=context)
    
class report_member_asscess_detail(osv.osv):
    _name = 'report.member.asscess.detail'
    _description = 'Report Member Asscess Detail'
    _columns = {
        'date_asscess': fields.date('Date'),
        'partner_id': fields.many2one('res.partner', 'Customer', ondelete='cascade'),
        'number_asscess': fields.integer('Number of Asscess'),
        'parent_id': fields.many2one('report.member.asscess', 'Report Member Asscess', ondelete='cascade')
        }
    
    