# -*- coding: utf-8 -*-

from openerp.osv import osv, fields
from datetime import datetime, timedelta
from openerp.tools import DEFAULT_SERVER_DATETIME_FORMAT
from openerp.tools.translate import _

class sale_report_quantity(osv.osv):
    _name = 'sale.report.quantity'
    _description = "Sale Report Quantity"
    
    _columns = {
        'name': fields.char('Name'),
        'from_date': fields.datetime('From Date', required=True),
        'to_date': fields.datetime('To Date', required=True),
        'type': fields.selection([('larger','Larger'),('smaller','Smaller'),('equal','Equal'),('about','About')],'Type'),
        'number_code': fields.integer('Number Code'),
        'from_number': fields.integer('From Number'),
        'to_number': fields.integer('To Number'),
        'user_id': fields.many2one('res.users', 'Creator'),
        'detail_ids': fields.one2many('sale.report.quantity.detail', 'report_id', 'List Detail Report'),
        'state': fields.selection([('draft','Draft'),('done','Done')], 'State'),
                }
    
    def _get_date_start(self, cr, uid, context=None):
        return str(datetime.strptime(fields.datetime.now(), DEFAULT_SERVER_DATETIME_FORMAT) - timedelta(days=30))
    
    _defaults = {
        'user_id': lambda self, cr, uid, ctx={}: uid,
        'state': 'draft',
        'name': u'Báo cáo bán hàng (Số lượng mã)',
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
        return super(sale_report_quantity, self).create(cr, uid, vals, context=context)
    
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
        return super(sale_report_quantity, self).write(cr, uid, ids, vals, context=context)
    
    def act_search(self, cr, uid, ids, context=None):
        session_obj = self.pool.get('product.session')
        product_obj = self.pool.get('product.product')
        category_obj = self.pool.get('category.convert')
        detail_obj = self.pool.get('sale.report.quantity.detail')
        for data in self.browse(cr, uid, ids, context=context):
            data.detail_ids.unlink()
            from_date = datetime.strptime(data.from_date,'%Y-%m-%d %H:%M:%S') + timedelta(hours=7)
            to_date = datetime.strptime(data.to_date,'%Y-%m-%d %H:%M:%S') + timedelta(hours=7)
            
            product_ids = product_obj.search(cr, uid, [], context=context)
            domain = [('product_id','in',product_ids)]
            products = product_obj.browse(cr, uid, product_ids, context)
            session_tmp_ids = session_obj.search(cr, uid, domain, context=context)
            session_ids = []
            for session in session_obj.browse(cr, uid, session_tmp_ids, context=context):
                if session.date_start:
                    date_start = datetime.strptime(session.date_start,'%d-%m-%Y %H:%M:%S.%f')
                    if date_start >= from_date and date_start <= to_date:
                        session_ids.append(session.id)
            category_ids = category_obj.search(cr, uid, [], context=context)
            converts = category_obj.browse(cr, uid, category_ids, context=context)
            for product in products:
                category_id = False
                number_code = 0
                for convert in converts:
                    if product.id in convert.product_ids.ids:
                        category_id = convert.id
                        break
                session_c_ids = session_obj.search(cr, uid, [('id','in',session_ids),('product_id','=',product.id)], context=context)
                for session in session_obj.browse(cr, uid, session_c_ids, context=context):
                    for order in session.order_ids:
                        number_code += len(order.code_ids.split(';'))
                if not data.type \
                    or (data.type == 'larger' and data.number_code < number_code) \
                    or (data.type == 'smaller' and data.number_code > number_code) \
                    or (data.type == 'equal' and data.number_code == number_code) \
                    or (data.type == 'about' and data.to_number >= number_code and data.from_number <= number_code):
                    vals_detail = {
                        'report_id': data.id,
                        'product_id': product.id,
                        'category_id': category_id,
                        'number_code': number_code,
                                      }
                    detail_obj.create(cr, uid, vals_detail, context=context)
        return self.write(cr, uid, ids, {'state': 'done'}, context=context)
    
class sale_report_quantity_detail(osv.osv):
    _name = 'sale.report.quantity.detail'
    _description = "Sale Report Detail Quantity"
    _columns = {
        'report_id': fields.many2one('sale.report.quantity', 'Report Id'),
        'product_id': fields.many2one('product.product', 'Product', ondelete='restrict'),
        'category_id': fields.many2one('category.convert','Category Convert', ondelete='restrict'),
        'number_code': fields.integer('Number Code Sold'),
    }