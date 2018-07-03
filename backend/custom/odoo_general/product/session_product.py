# -*- coding: utf-8 -*-

from openerp import api, tools, SUPERUSER_ID
from openerp.osv import osv, fields, expression
from openerp.tools.translate import _
import openerp.addons.decimal_precision as dp
from openerp.tools import DEFAULT_SERVER_DATE_FORMAT, DEFAULT_SERVER_DATETIME_FORMAT
from openerp.api import Environment

import pytz
import re
import time
from datetime import datetime
from datetime import timedelta
from dateutil.relativedelta import relativedelta
import threading
import logging
log = logging.getLogger(__name__)

class product_session_create(osv.osv):
    _name = "product.session.create"
    _inherit = ['mail.thread', 'ir.needaction_mixin']
    _description = "Product Session Create"
    _order = "id desc"
    _columns = {
        'name': fields.char('Code', required=True, select=False),
        'number_session': fields.integer('Number Session'),
        'product_ids': fields.many2many('product.product', 'session_create_product_rel', 'create_id', 'product_id', 'Products'),
        'date': fields.datetime('Create Date'),
        'user_id': fields.many2one('res.users', 'Create User'),
        'state': fields.selection([('draft', 'Draft'),('done', 'Done')], 'Status', readonly=True, copy=False),
        'sessions_created':fields.one2many('product.session', 'create_id', 'Session'),
    }

    _defaults = {
        'date': fields.datetime.now,
        'state': 'draft',
        'user_id': lambda obj, cr, uid, context: uid,
    }
    

    def create(self, cr, uid, vals, context=None):
        if context is None:
            context = {}
        vals['name'] = self.pool.get('ir.sequence').get(cr, uid, 'product.session.create', context=context) or '/'
        new_id = super(product_session_create, self).create(cr, uid, vals, context=context)
        return new_id

    def act_approval(self, cr, uid, ids, context=None):
        session_pool = self.pool.get('product.session')
        if context is None:
            context = {}
        for data in self.browse(cr, uid, ids, context=context):
            if not data.product_ids:
                raise osv.except_osv(_('Thông báo!'), _(u'Vui lòng chọn sản phẩm trước khi tạo phiên.'))
            number_session = data.number_session
            for product in data.product_ids:
                product_id = product.id
                number_code = product.code_number
                next_code = len(product.session_ids) + 1
                if number_session < 1:
                    raise osv.except_osv(_('Thông báo!'), _(u'Số phiên phải lớn hơn 0'))
                if number_code < 1:
                    continue
                if product.lst_price < 1:
                    continue
                for i in range(next_code, next_code + number_session):
                    name_session = str(i)
                    now = (datetime.utcnow() + relativedelta(hours=7)).strftime('%d-%m-%Y %H:%M:%S.%f')[:-3]
                    session_pool.create(cr, uid, {
                                                'name': name_session,
                                                'product_id': product_id,
                                                'number_code':number_code,
                                                'create_id': data.id,
                                                'date_start': now,
                                                }, context=context)
        return self.write(cr, uid, ids, {'state': 'done'}, context=context)
    
    def unlink(self, cr, uid, ids, context=None):
        for item in self.browse(cr, uid, ids, context=context):
            if item.state != 'draft':
                raise osv.except_osv(
                    _('Warning!'),
                    _('You can not remove the Create Session when status other Drafts')
                )
        return super(product_session_create, self).unlink(cr, uid, ids, context=context)
    
    
class product_session_code(osv.osv):
    _name = "product.session.code"
    _description = "Product Session Code"
    _columns = {
        'name': fields.char('Code', required=True, select=False),
        'sequence': fields.integer('Sequence', required=True),
    }
    
    _sql_constraints = [
        ('name_uniq', 'unique(name)', 'Code must be unique!'),
        ('sequence_len', 'CHECK (sequence>=10000000 and sequence<=99999999)',  'Code create by Data. You can not create code!'),
    ]
     
    def init_session_code(self, cr, uid, context=None):
        cr.execute('delete From product_session_code where sequence=0')
        codes = self.search(cr, uid, [], order='sequence desc')
        x = codes and len(codes) + 1 or 1
        if x == 89999999:
            return True
        thread_name = "%s_Thread-Create-Product-Session-Code" % (cr.dbname)
        exits = filter(lambda x: x.name == thread_name, threading.enumerate())
        if exits: 
            raise osv.except_osv(_('Warning!'), _('Thread create Session for this product is running. Please try again!'))
        threaded_calculation = threading.Thread(target=self.thread_init_session_code, args=(cr, uid, x, context))
        threaded_calculation.setName(thread_name)
        threaded_calculation.start()
        time.sleep(1)
        return True
    
    def thread_init_session_code(self, cr, uid, start_code, context=None):
        with Environment.manage():
            try:
                new_cr = self.pool.cursor()
                print start_code
                for x in range(start_code,89999999):  
                    code = 10000000 + x 
                    if self.search(new_cr, uid, [('name','=',code)]):
                        continue
                    new_cr.execute("INSERT INTO product_session_code(name, sequence) VALUES ('%s', %s);" % (code, code))
                    new_cr.commit()
            except Exception as e:
                new_cr.rollback()
                log.exception(e)
            finally:
                new_cr.close()
        return True
            
class product_session(osv.osv):
    _name = "product.session"
    _inherit = ['mail.thread']
    _description = "Product Session"
    _order = 'id desc'
    
    def _get_partner_id(self, cr, uid, ids, field_name, arg, context=None):
        result = {}
        code_obj = self.pool.get('product.session.code')
        for session in self.browse(cr, uid, ids, context=context):
            result[session.id] = {'code_win': False,
                                  'partner_id': False}
            if session.codes:
                code_ids = code_obj.search(cr, uid, [('is_win','=',True),('id','in',session.codes.ids)], limit=1, context=context)
                if code_ids:
                    code = code_obj.browse(cr, uid, code_ids[0])
                    result[session.id]['partner_id'] = code.partner_id and code.partner_id.id or False
                    result[session.id]['code_win'] = code.id
        return result

    def _get_code_id(self, cr, uid, ids, context=None):
        result = {}
        for code in self.pool.get('product.session.code').browse(cr, uid, ids, context):
            result[code.session_id.id] = True
        return result.keys()
    
    def _get_order(self, cr, uid, ids, context=None):
        result = {}
        for line in self.pool.get('product.session.order').browse(cr, uid, ids, context=context):
            result[line.session_id.id] = True
        return result.keys()

    def _get_state_func(self, cr, uid, ids, name, arg, context=None):
        res = {}
        for record in self.browse(cr, uid, ids, context=context):
            res[record.id] = 'unsold'
            if len(record.order_ids) > 0 and not record.is_dial:
                res[record.id] = 'sold'
            elif  record.is_dial:
                res[record.id] = 'dial'
        return res
    
    _columns = {
                'name': fields.char('Code', required=True, translate=True, select=False),
                'product_id': fields.many2one('product.product','Product'),
                'create_id': fields.many2one('product.session.create','Session Create ID'),
                #'codes':fields.many2many('product.session.code', 'product_session_code_rel', 'session_id', 'code_id', 'Codes'),
                'product_tmpl_id': fields.related('product_id', 'product_tmpl_id',  type='many2one', relation='product.template', string='Product', store=True),
                'date_start': fields.char('Start Date'),
                'date_stop': fields.char('End Date'),
                'active': fields.boolean('Active', help="If the active field is set to False, it will allow you to hide the product session without removing it."),
                'is_dial': fields.boolean('Dialed'),
                'order_ids':fields.one2many('product.session.order', 'session_id', 'Orders'),
                'dial_realtime': fields.integer('Kết quả XSKT'),
                'number_win': fields.char('Final result'),
                'partner_id': fields.many2one('res.partner', 'Final Winner', ondelete='restrict'),
                'address_id': fields.many2one('res.partner', 'Shipping Address', ondelete='restrict'),
                'state_func': fields.function(_get_state_func, type='selection', string='State',selection= [('unsold','Unsold'), ('sold', 'Sold'),('dial', 'Dial')], 
                      store={
                            'product.session': (lambda self, cr, uid, ids, c={}: ids,  ['date_start', 'date_stop','order_ids','dial_realtime','is_dial'], 10),
                            'product.session.order':  (_get_order,['partner_id','session_id','code_ids','date'], 10),
                    }, help="State", ),
                
                
                'sale_id': fields.many2one('sale.order','Sale Order'),
                'partner_order_id': fields.related('order_ids', 'partner_id', type='many2one', relation='res.partner', string='Partner Order'),
                'number_code':fields.integer('Số mã'),
               
                }
    _defaults = {
        'active': True,
    }
    
    def unlink(self, cr, uid, ids, context=None):
#         raise osv.except_osv(
#             _('Thông báo!'),
#             _('Không được xóa phiên vì đã đồng bộ dữ liệu lên website.')
#         )
        return super(product_session, self).unlink(cr, uid, ids, context=context)
    
    def create(self, cr, uid, vals, context=None):
        if context is None:
            context = {}
        session_product_id = super(product_session, self).create(cr, uid, vals, context=context)
        return session_product_id
    
    def action_dial(self, cr, uid, ids, context=None):
        sale_id = False
        so_pool =  self.pool.get('sale.order')
        for data in self.browse(cr, uid, ids):
            if data.partner_id and not data.sale_id:
                #create SO
                sale_id =so_pool.create(cr, uid, { 'partner_id':data.partner_id.id,
                                                   'client_order_ref':data.number_win,
                                                   'is_dial':True,
                                                   'order_line':[ (0, 0,{'product_id':data.product_id.id,
                                                                      'quantity':1,
                                                                      'price_unit':data.product_id.lst_price,
                                                                      'name':u'Trúng thưởng sản phẩm %s'%(data.product_id.name),
                                                                 })],
                                                   'product_session_id':data.id,
                                                   'partner_shipping_id': data.address_id and data.address_id.id or data.partner_id.id ,
                                                   })
                so_pool.action_button_confirm(cr, uid, [sale_id], context=context)
                #dong bo san pham hot
                category_ids = data.product_id.public_categ_ids and  data.product_id.public_categ_ids.ids or False
                if category_ids:
                    self.pool.get('general.hot.product.queue').create(cr, uid, { 'sync_id':1,'name':category_ids})
        return self.write(cr, uid, ids , {'is_dial':True,'sale_id':sale_id})
    
class product_session_order(osv.osv):
    _name = "product.session.order"
    _description = "Product Session Order"
    _order = "id desc"
    
    def get_count_id(self, cr, uid, ids, name=None, args=None, context=None):
        res={}
        count=1
        if context is None:
            context = {}
        for data in self.browse(cr, uid, ids, context):
            if data.session_id: 
                query="""select count(s.*) as count from product_session_order s where s.session_id= """+str(data.session_id.id)+""" and to_timestamp(s.date, 'DD-MM-YYYY hh24:mi:ss.MS') >=  TIMESTAMP '"""+str(data.date)+"""' and s.id !=%s"""%data.id 
                cr.execute(query)
                for item in cr.dictfetchall():
                    count = '%%0%sd'  % 3 % item['count']         
            res[data.id]=count
        return res
    
    def _dial_all(self, cr, uid, ids, field_name, arg, context=None):
        res = {}
      
        for order in self.browse(cr, uid, ids, context=context):
            res[order.id] = {
                'number': 0,
                'number_date':False,
                'date_order': False,
                'month_order': False,
            }
            tmp = order.date.strip()[11:]
            number_date = tmp.replace(':',"").replace('.',"")
            
            date_conver = datetime.strptime(order.date,'%Y-%m-%d %H:%M:%S.%f')
            local = pytz.timezone(context.get('tz') or 'UTC')
            local_dt = local.localize(date_conver, is_dst=None)
            utc_dt = local_dt.astimezone(pytz.utc)
            date_order = utc_dt
            number = 0
            if order.code_ids:
                number = len(order.code_ids.split(';'))
            res[order.id]['number']="%s%s"%(number,u"Mã số")
            res[order.id]['number_date']=number_date
            res[order.id]['date_order']=date_order.strftime('%Y-%m-%d')
            res[order.id]['month_order']= date_order.strftime('%m')
        return res
    
    def _get_session(self, cr, uid, ids, context=None):
        result = {}
        for session in self.pool.get('product.session').browse(cr, uid, ids, context=context):
            for line in session.order_ids: 
                result[line.id] = True
        return result.keys()
    
    _columns = {
        'name': fields.char('Order Reference', copy=False, select=False),
        'partner_id': fields.many2one('res.partner', 'Partner', ondelete='restrict'),
        'session_id': fields.many2one('product.session','Session'),
        'product_id': fields.related('session_id','product_id',type="many2one",relation='product.product',string='Product',store=True),
        'is_win': fields.boolean('Win'),
        'code_ids': fields.text('Codes' ),
        'date': fields.char('Date'),
        'no': fields.function(get_count_id,type='char', string='No.',),  
        'number': fields.function(_dial_all,  type="char", string='Code Numbers',
            store={
                'product.session.order': (lambda self, cr, uid, ids, c={}: ids, ['partner_id','session_id','code_ids','date'], 10),
                'product.session':  (_get_session, ['date_start', 'date_stop','order_ids'], 10),
            }, multi="all", help="Code Numbers", track_visibility='always'),  
        
        'number_date': fields.function(_dial_all, type="char", string='Value Dial',
            store={
                'product.session.order': (lambda self, cr, uid, ids, c={}: ids, ['partner_id','session_id','code_ids','date'], 10),
                'product.session':  (_get_session, ['date_start', 'date_stop','order_ids'], 10),
            }, multi="all", help="Value Dial", track_visibility='always'),  
        
        'date_order': fields.function(_dial_all, type="date", string='Date Order',
            store={
                'product.session.order': (lambda self, cr, uid, ids, c={}: ids, ['partner_id','session_id','code_ids','date'], 10),
                'product.session':  (_get_session, ['date_start', 'date_stop','order_ids'], 10),
            }, multi="all", help="Date Order", track_visibility='always'),  
        'month_order': fields.function(_dial_all, type="char", string='Date Order',
            store={
                'product.session.order': (lambda self, cr, uid, ids, c={}: ids, ['partner_id','session_id','code_ids','date'], 10),
                'product.session':  (_get_session, ['date_start', 'date_stop','order_ids'], 10),
            }, multi="all", help="Date Order", track_visibility='always'),
    }
    
    _defaults = {
        'is_win': False,
        'name': lambda obj, cr, uid, context: '/',
    }
    
    def create(self, cr, uid, vals, context=None):
        
        his_pool = self.pool.get('res.partner.history.exchange')
        if vals.get('name', '/') == '/':
            vals['name'] = self.pool.get('ir.sequence').get(cr, uid, 'product.session.order', context=context) or '/'
        res = super(product_session_order, self).create(cr, uid, vals, context=context)
        
        session_id = vals.get('session_id', False)
        session_obj = self.pool.get('product.session').browse(cr, uid, session_id, context=context)
        code_ids = vals.get('code_ids', "")  
        number_code = code_ids.split(';')
        point_price = 10000
        # print '--------------------------------------------------------------------------------------------'
        # import pdb
        # pdb.set_trace()
        # if session_obj.product_id.point_price > 0:
            # diamon = session_obj.product_id.lst_price / session_obj.product_id.point_price
            # diamon = 
        # else:
            # diamon = session_obj.product_id.lst_price / point_price
        date_conver = datetime.strptime(vals.get('date'),'%Y-%m-%d %H:%M:%S.%f')
        dateorder = datetime.strptime(date_conver.strftime(DEFAULT_SERVER_DATETIME_FORMAT), DEFAULT_SERVER_DATETIME_FORMAT)
        zonetime = dateorder - timedelta(hours=7)
        if vals.get('partner_id', False):
            his_pool.create(cr, uid, { 'partner_id': vals.get('partner_id'),
                                        'date_exchange': zonetime,
                                        'type_exchange': 'subtraction',
                                        'amount_exchange': session_obj.product_id.point_price * len(number_code) / 1000,
                                        'millisecond': date_conver.microsecond/1000,
                                        'product_id': session_obj.product_id.id,
                                        'codes':code_ids,
                                       })
        return res
