# -*- coding: utf-8 -*-

from openerp.osv import osv, fields
from datetime import datetime, date
import calendar
import time
from openerp.tools import DEFAULT_SERVER_DATETIME_FORMAT
from openerp.tools.translate import _

class report_members(osv.osv):
    _name = 'report.members'
    _description = 'Report Members'
    _columns = {
            'name': fields.char('Name'),
            'user_id': fields.many2one('res.users', 'Creator', readonly=True),
            'date': fields.date('Create Date', readonly=True),
            'month': fields.selection([('01','January'),('02','February'),('03','March'),('04','April'),
                                       ('05','May'),('06','June'),('07','July'),('08','August'),
                                       ('09','September'),('10','October'),('11','November'),('12','December')], 'Month', required=True),
            'year': fields.selection([(num, str(num)) for num in range(1900, (datetime.now().year)+1 )], 'Year'),
            'detail_ids': fields.one2many('report.members.detail', 'parent_id', 'Report Member Detail'),
            'state': fields.selection([('draft','Draft'),('done','Done')],'Status'),
            }
    
    _defaults = {
            'name': u'Báo cáo khách hàng',
            'date': datetime.now(),
            'user_id': lambda self, cr, uid, context=None: uid,
            'month': lambda *a: str(time.strftime('%m')),
            'year': lambda *a: int(time.strftime('%Y')),
            'state': 'draft',
            }
    
    def act_search(self, cr, uid, ids, context=None):
        member_pool = self.pool.get('res.partner')
        detail_pool = self.pool.get('report.members.detail')
        vals = []
        for data in self.browse(cr, uid, ids, context):
            data.detail_ids.unlink()
            month = int(data.month)
            year = int(data.year)
            start_date = datetime.strftime(date(year, month, 1),'%Y-%m-%d')
            end_date  = datetime.strftime(date(year, month, calendar.monthrange(year, month)[1]),'%Y-%m-%d')
            total_member_ids = member_pool.search(cr, uid, [('customer','=',True)], context=context)
            register_member_ids = member_pool.search(cr, uid, [('customer','=',True), ('register_date','>=',start_date), ('register_date','<=',end_date)], context=context)
            if total_member_ids or register_member_ids:
                vals = {
                        'total_member': len(total_member_ids),
                        'member_register': len(register_member_ids),
                        'parent_id': data.id,
                        }
                detail_pool.create(cr, uid, vals, context=context)
        return self.write(cr, uid, ids, {'state': 'done'}, context=context)
    
class report_members_detail(osv.osv):
    _name = 'report.members.detail'
    _description = 'Report Member Detail'
    _columns = {
            'total_member': fields.integer('Total Members'),
            'member_register': fields.integer('Members Register'),
            'parent_id': fields.many2one('report.members', 'Report Members')  
            }
    