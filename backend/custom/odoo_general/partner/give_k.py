# -*- coding: utf-8 -*-
from openerp import tools
from openerp.osv import fields, osv
from datetime import datetime
from openerp.tools import DEFAULT_SERVER_DATETIME_FORMAT
from openerp.tools.translate import _

class give_k(osv.osv):
    _name = 'give.k'
    _description = 'Tang K'
    
    _columns = {
        'name': fields.char('Name'),
        'date_start': fields.datetime('Start Date'),
        'date_end': fields.datetime('End Date'),
        'number_k': fields.integer('Number K Give'),
        'is_active': fields.boolean('Active'),
        'log_ids': fields.one2many('give.k.history', 'ref_id', 'Logs Changed'),
                }
    
    _defaults = {
        'name': u'Tặng K',
        'is_active': False,
#         'number_k': 0
                 }
    
    def get_active_id(self, cr, uid, context=None):
        ids = self.search(cr, uid, [], order='create_date desc', limit=1, context=context)
        return {
                "name": _("Give K"),
                "type": "ir.actions.act_window",
                "view_type": "form",
                "view_mode": "form",
                "res_model": self._name,
                "res_id": ids and ids[0] or None,
            }
        
    def onchange_number_k(self, cr, uid, ids, number_k, context=None):
        if int(number_k) < 0:
            return {'warning': {
                'title': _('Input number K'),
                'message': _("Number K must be > 0 !"),
            }}
        return {}
    
    def onchange_date(self, cr, uid, ids, date_start, date_end, context=None):
        date_start = date_start and datetime.strptime(date_start, DEFAULT_SERVER_DATETIME_FORMAT) or False
        date_end = date_end and datetime.strptime(date_end, DEFAULT_SERVER_DATETIME_FORMAT) or False
        if date_end and date_start and date_start > date_end:
            return {'warning': {
                'title': _('Select date'),
                'message': _("Start Date can't larger than End Date !"),
            }}
        return {}
        
    def create(self, cr, uid, vals, context=None):
        date_start = date_end = False
        number_k = 0
        if 'number_k' in vals and vals.get('number_k'):
            number_k = vals.get('number_k')
        if 'date_start' in vals and vals.get('date_start'):
            date_start = datetime.strptime(vals.get('date_start'), DEFAULT_SERVER_DATETIME_FORMAT)
        if 'date_end' in vals and vals.get('date_end'):
            date_end = datetime.strptime(vals.get('date_end'), DEFAULT_SERVER_DATETIME_FORMAT)
        if number_k <= 0:
            raise osv.except_osv(_('Error'), _('Number K must be > 0 !'))
        if not (date_start and date_end and number_k):            
            raise osv.except_osv(_('Error'), _('Must have Start Date and End Date and Number K !'))
        if date_start > date_end:
            raise osv.except_osv(_('Error'), _("Start Date can't larger than End Date !"))
        give_id = super(give_k, self).create(cr, uid, vals, context=context)
        vals_tmp = vals.copy()
        vals_tmp.update({ 'ref_id': give_id })
        self.pool.get('give.k.history').create(cr, uid, vals_tmp, context=context)
        return give_id
    
    def write(self, cr, uid, ids, vals, context=None):
        give_logs = self.pool.get('give.k.history')
        for givek in self.browse(cr, uid, ids, context=context):
            number_k = givek.number_k
            is_active = givek.is_active
            if 'is_active' in vals:
                is_active = vals.get('is_active',False)
            if 'number_k' in vals:
                number_k = vals.get('number_k', 0)
            if number_k <= 0:
                raise osv.except_osv(_('Error'), _('Number K must be > 0 !'))
            date_start = 'date_start' in vals and vals.get('date_start') or givek.date_start
            date_end = 'date_end' in vals and vals.get('date_end') or givek.date_end
            date_start = date_start and datetime.strptime(date_start, DEFAULT_SERVER_DATETIME_FORMAT) or False
            date_end = date_end and datetime.strptime(date_end, DEFAULT_SERVER_DATETIME_FORMAT) or False
            if not (date_start and date_end and number_k):            
                raise osv.except_osv(_('Error'), _('Must have Start Date and End Date and Number K !'))
            if date_start > date_end:
                raise osv.except_osv(_('Error'), _("From Date can't larger than To Date !"))
            vals_tmp = {
                'ref_id': givek.id,
                'name': 'name' in vals and vals.get('name',False) or givek.name,
                'date_start': 'date_start' in vals and vals.get('date_start',False) or givek.date_start,
                'date_end': 'date_end' in vals and vals.get('date_end',False) or givek.date_end,
                'number_k': number_k,
                'is_active': is_active,
                        }
            give_logs.create(cr, uid, vals_tmp, context=context)
        return super(give_k, self).write(cr, uid, ids, vals, context=None)

class give_k_history(osv.osv):
    _name = 'give.k.history'
    _description = 'Lich Su Thay Doi Tang K'
    _order = 'id desc'
    
    _columns = {
        'name': fields.char('Name'),
        'ref_id': fields.many2one('give.k', 'Give K Reference'), 
        'date_start': fields.datetime('Start Date'),
        'date_end': fields.datetime('End Date'),
        'number_k': fields.integer('Number K Give'),
        'is_active': fields.boolean('Active'),
                }

