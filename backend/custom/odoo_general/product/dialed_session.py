# -*- coding: utf-8 -*-

from openerp.osv import osv, fields
from datetime import datetime, timedelta
from dateutil import relativedelta
from openerp.tools.translate import _
from openerp.tools import DEFAULT_SERVER_DATETIME_FORMAT

class dialed_session(osv.osv):
    _name = 'dialed.session'
    _description = "Dialed Session"
    
    _columns = {
        'name': fields.char('Name'),
        'from_date': fields.date('From Date', required=True),
        'to_date': fields.date('To Date', required=True),
        'date': fields.date('Create Date', readonly=True),
        'user_id': fields.many2one('res.users','Create User', readonly=True),
        'detail_ids': fields.one2many('dialed.session.detail','report_id','Details'),
        'state': fields.selection([('draft','Draft'),('done','Done')],'Status'),
                } 
    
    def _get_date_start(self, cr, uid, context=None):
        return str(datetime.strptime(fields.datetime.now(), DEFAULT_SERVER_DATETIME_FORMAT) - timedelta(days=30))
    
    _defaults = {
        'date': datetime.now(),
        'user_id': lambda self, cr, uid, ctx={}:uid,
        'from_date': _get_date_start,
        'to_date': fields.datetime.now,
        'state': 'draft',
        'name': u'Phiên đã quay',
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
        return super(dialed_session, self).create(cr, uid, vals, context=context)
    
    def write(self, cr, uid, ids, vals, context=None):
        for data in self.browse(cr, uid, ids, context=context):
            from_date = 'from_date' in vals and vals.get('from_date') or data.from_date
            to_date = 'to_date' in vals and vals.get('to_date') or data.to_date
            if from_date > to_date:
                raise osv.except_osv(_('Error'), _("From Date can't larger than To Date !"))
        return super(dialed_session, self).write(cr, uid, ids, vals, context=context)
    
    def act_search(self, cr, uid, ids, context=None):
        detail_obj = self.pool.get('dialed.session.detail')
        session_obj = self.pool.get('product.session')
        for data in self.browse(cr, uid, ids, context=context):
            data.detail_ids.unlink()
            from_date = (datetime.strptime(data.from_date,'%Y-%m-%d') + timedelta(hours=7)).date()
            to_date = (datetime.strptime(data.to_date,'%Y-%m-%d') + timedelta(hours=7)).date()
            
            session_tmp_ids = session_obj.search(cr, uid, [], context=context)
            sessions = []
            for session in session_obj.browse(cr, uid, session_tmp_ids, context=context):
                if session.date_start:
                    date_start = datetime.strptime(session.date_start,'%d-%m-%Y %H:%M:%S.%f').date()
                    if date_start >= from_date and date_start <= to_date and session.is_dial:
                        sessions.append(session)
            for session in sessions:
                detail_obj.create(cr, uid, {
                                        'session_code': session.name,
                                        'date_start': session.date_start,
                                        'date_end': session.date_stop,
                                        'product_id': session.product_id and session.product_id.id or False,
                                        'report_id': data.id,
                                    }, context=context)
        return self.write(cr, uid, ids, {'state':'done'}, context=context)
    
class dialed_session_detail(osv.osv):
    _name = 'dialed.session.detail'
    _description = "Dial Session Report Detail"
    _columns = {
        'report_id': fields.many2one('dialed.session', 'Report ref'),
        'session_code': fields.char('Session code'),
        'date_start': fields.char('Start date'),
        'date_end': fields.char('End date'),
        'product_id': fields.many2one('product.product', 'Product', ondelete='restrict')
    }