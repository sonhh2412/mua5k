# -*- coding: utf-8 -*-

from openerp.osv import osv, fields
from openerp.tools.translate import _
from datetime import datetime
PRODUCT_SESSION_TYPE = [('up_session', 'Up Sessions'), ('in_session', 'In Sessions')]
from openerp import SUPERUSER_ID

class product_template(osv.osv):
    _inherit = "product.template"
    
    def _fnct_code_number(self, cursor, user, ids, name, arg, context=None):
        res = {}
        for product in self.browse(cursor, user, ids, context=context):
            res[product.id] = product.product_variant_ids and product.product_variant_ids[0].code_number or 0   
        return res
    
#     def _get_amount_convert(self, cursor, user, ids, name, arg, context=None):
#         res = dict.fromkeys(ids, 0)
#         convert_pool = self.pool.get('category.convert')
#         convert_ids = convert_pool.search(cursor, user, [], context=context)
#         if convert_ids:
#             converts = convert_pool.browse(cursor, user, convert_ids, context=context)
#             for product in self.browse(cursor, user, ids, context=context):
#                 for convert in converts:
#                     if product.id in convert.product_ids.ids:                        
#                         res[product.id] = convert.amount
#                         break
#         return res
    
#     def _get_category_convert(self, cursor, user, ids, context=None):
#         result = {}
#         for line in self.pool.get('category.convert').browse(cursor, user, ids, context=context):
#             for product in line.product_ids:
#                 result[product.id] = True
#         return result.keys()
    
    _columns = {
        'session_ids': fields.one2many('product.session', 'product_tmpl_id', 'Session Sale List'),
        'code_number': fields.function(_fnct_code_number, string='Quantity of Code', type='integer'),
        'point_price': fields.integer('Point Price'),
        #'point_price': fields.function(_get_amount_convert, string='Point Price', type='integer', 
        #                    store = {
        #                        'product.template': (lambda self, cursor, user, ids, ctx={}:ids, [], 10),
        #                        'category.convert': (_get_category_convert, ['product_ids', 'amount'], 10),
        #                           }),
        'dial_immediately': fields.boolean('Dial Immediately'),
        'total_session': fields.related('product_variant_ids', 'total_session', type='float', string='Total Session'),
        'total_session_sale': fields.related('product_variant_ids', 'total_session_sale', type='float', string='Total Session on Sale'),
        'total_session_dial': fields.related('product_variant_ids', 'total_session_dial', type='float', string='Total Session Dial'),
        'type_with_session': fields.related('product_variant_ids', 'type_with_session', type='selection', selection=PRODUCT_SESSION_TYPE, string='Type'),
        'limited': fields.boolean('Limit'),
        'created_date': fields.date('Create Date', required=True),
        'description': fields.html('Description',
            help="A precise description of the Product, used only for internal information purposes."),
        }
    
    _defaults = {
        'type' : 'consu',
        'created_date': datetime.now(),
    }
    
    def write(self, cr, uid, ids, vals, context=None):
        if 'list_price' in vals:
            for data in self.browse(cr, uid, ids, context=context):
                if data.session_ids.ids and data.list_price != vals.get('list_price'):
                    raise osv.except_osv(_('Thông báo!'), _("Sản phẩm Không được thay đổi giá niêm yết khi tab Danh sách phiên bán hàng đã có dữ liệu!"))
        return super(product_template, self).write(cr, uid, ids, vals, context=context)
   
    
class product_product(osv.osv):
    _inherit = "product.product"
    
    def _fnct_code_number(self, cursor, user, ids, name, arg, context=None):
        res = {}
        for product in self.browse(cursor, user, ids, context=context):
            res[product.id] = 0
            if product.config_ids:
                number =  product.list_price%product.config_ids[0].amount>0 and product.list_price/product.config_ids[0].amount + 1 or product.list_price/product.config_ids[0].amount
                res[product.id] = number
        return res
    
    def _get_expense_id(self, cr, uid, context=None):
        if context is None:
            context = {}
        name = ["Make To Order","Buy"]
        res = self.pool.get('stock.location.route').search(cr, uid, [('name', 'in', name )])
        result = map(lambda x: x, res)
        return [(6,0,result)]
    
    def _get_total(self, cr, uid, ids, field_name, arg, context=None):
        res = {}
        for product in self.browse(cr, uid, ids, context=context):
            res[product.id] = {
                'total_session': 0.0,
                'total_session_sale': 0.0,
                'total_session_dial': 0.0,
                'type_with_session': False,
            }
            val = 0
            val2= 0
            for session in product.session_ids:
                if len(session.order_ids):
                    val += 1
                if session.is_dial:
                    val2 +=1
           
            if val == 0:
                type_s = 'in_session'
            elif len(product.session_ids) == 0:
                type_s = False
            else:
                type_s = 'up_session'
            res[product.id]['total_session'] = len(product.session_ids)
            res[product.id]['total_session_sale'] = val
            res[product.id]['total_session_dial'] = val2
            res[product.id]['type_with_session'] = type_s
        return res
    
    def _get_product(self, cr, uid, ids, context=None):
        result = {}
        for line in self.pool.get('product.session').browse(cr, uid, ids, context=context):
            result[line.product_id.id] = True
        return result.keys()
    
    _columns = {
                'session_ids': fields.one2many('product.session', 'product_id', 'Session Sale List'),
                'config_ids':fields.many2many('category.convert','category_convert_product_rel','product_id','category_convert_id','Convert'),
                'code_number': fields.function(_fnct_code_number, string='Quantity of Code', type='integer'),
                'session_active_ids': fields.one2many('product.session', 'product_id', 'Session Sale List', domain=[('date_start','=',False),('date_stop','=',False),('active','=',True)]),
                'total_session': fields.function(_get_total, string='Total Session', type='integer', 
                                    store = {
                                            'product.product': (lambda self, cursor, user, ids, ctx={}:ids, ['session_ids'], 10),
                                            'product.session': (_get_product, ['order_ids', 'product_id'], 10),
                                            },  multi='sums'),
                'total_session_sale': fields.function(_get_total, string='Total Session on Sale', type='integer', 
                                    store = {
                                            'product.product': (lambda self, cursor, user, ids, ctx={}:ids, ['session_ids'], 10),
                                            'product.session': (_get_product, ['order_ids', 'product_id'], 10),
                                            },  multi='sums'),
                'total_session_dial': fields.function(_get_total, string='Total Session Dial', type='integer', 
                                    store = {
                                            'product.product': (lambda self, cursor, user, ids, ctx={}:ids, ['session_ids'], 10),
                                            'product.session': (_get_product, ['order_ids','is_dial','dial_realtime', 'product_id'], 10),
                                            },  multi='sums'),
                
                'type_with_session': fields.function(_get_total, string='Type', type='selection', selection=PRODUCT_SESSION_TYPE,
                                    store = {
                                            'product.product': (lambda self, cursor, user, ids, ctx={}:ids, ['session_ids'], 10),
                                            'product.session': (_get_product, ['order_ids','is_dial','dial_realtime', 'product_id'], 10),
                                            },  multi='sums'),
                }
    
    _defaults = {
                 'type' : 'consu',
                 'route_ids': _get_expense_id,
                 'dial_immediately':True
                 }

    def create(self, cr, uid, vals, context=None):
        if not vals.get('seller_ids'):
            raise osv.except_osv(_('Thông báo!'), _("Sản phẩm Không lưu kho phải chọn 1 nhà cung cấp!"))
        return super(product_product, self).create(cr, uid, vals, context=context)
            
    def write(self, cr, uid, ids, vals, context=None):
        if 'seller_ids' in vals:
            if not vals.get('seller_ids',False):
                raise osv.except_osv(_('Thông báo!'), _("Sản phẩm Không lưu kho phải chọn 1 nhà cung cấp!"))
        for data in self.browse(cr, uid, ids, context=context):
            if 'lst_price' in vals:
                if data.session_ids.ids and data.lst_price != vals.get('lst_price'):
                    raise osv.except_osv(_('Thông báo!'), _("Sản phẩm Không được thay đổi giá niêm yết khi tab Danh sách phiên bán hàng đã có dữ liệu!"))
            if not vals.get('website_published') is None and not vals.get('website_published'):
                for session in data.session_ids:
                    if session.state_func == 'sold':
                        vals['website_published'] = True
                        raise osv.except_osv(_(u'Thông báo!'), _(u"Sản phẩm đang có phiên bán trên web!"))
        return super(product_product, self).write(cr, uid, ids, vals, context=context)
    
    def name_get(self, cr, user, ids, context=None):
        if context is None:
            context = {}
        if isinstance(ids, (int, long)):
            ids = [ids]
        if not len(ids):
            return []

        def _name_get(d):
            name = d.get('name','')
            return (d['id'], name)

        partner_id = context.get('partner_id', False)
        if partner_id:
            partner_ids = [partner_id, self.pool['res.partner'].browse(cr, user, partner_id, context=context).commercial_partner_id.id]
        else:
            partner_ids = []

        # all user don't have access to seller and partner
        # check access and use superuser
        self.check_access_rights(cr, user, "read")
        self.check_access_rule(cr, user, ids, "read", context=context)

        result = []
        for product in self.browse(cr, SUPERUSER_ID, ids, context=context):
            variant = ", ".join([v.name for v in product.attribute_value_ids])
            name = variant and "%s (%s)" % (product.name_template, variant) or product.name_template
            sellers = []
            if partner_ids:
                sellers = filter(lambda x: x.name.id in partner_ids, product.seller_ids)
            if sellers:
                for s in sellers:
                    seller_variant = s.product_name and (
                        variant and "%s (%s)" % (s.product_name, variant) or s.product_name
                        ) or False
                    mydict = {
                              'id': product.id,
                              'name': seller_variant or name,
                              'default_code': s.product_code or product.default_code,
                              }
                    result.append(_name_get(mydict))
            else:
                mydict = {
                          'id': product.id,
                          'name': name,
                          'default_code': product.default_code,
                          }
                result.append(_name_get(mydict))
        return result
    
    