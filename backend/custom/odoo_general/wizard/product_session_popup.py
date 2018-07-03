# -*- coding: utf-8 -*-

from openerp import api, tools, SUPERUSER_ID
from openerp.osv import osv, fields, expression
from openerp.tools.translate import _
import openerp.addons.decimal_precision as dp

from openerp.api import Environment
import time
from datetime import datetime
from dateutil.relativedelta import relativedelta
import threading
import logging
log = logging.getLogger(__name__)

class product_session_popup(osv.osv):
    _name = 'product.session.popup'
    _description = 'Product Session Popup'
    _columns = {
        'name': fields.char('Name Session'),
        'next_code': fields.integer('Next Code'),
        'number_session': fields.integer('Number Session'),
        'product_id': fields.many2one('product.product', 'Product', ondelete="cascade"),
    }
    
    def default_get(self, cr, uid, fields, context=None):
        if context is None:
            context = {}
        res = super(product_session_popup, self).default_get(cr, uid, fields, context=context)
        product_id = context.get('active_id', False)
        if context.get('active_model') == 'product.template':
            product =  self.pool.get('product.template').browse(cr, uid, product_id)
            product_id = product.product_variant_ids and product.product_variant_ids[0].id or 0   
        if 'product_id' in fields:
            res.update({'product_id': product_id})
        if 'next_code' in fields:
            product = self.pool.get('product.product').browse(cr, uid, product_id)
            next_code = len(product.session_ids) + 1
            res.update({'next_code': next_code})
        return res

    def act_approval(self, cr, uid, ids, context=None):
        if context is None:
            context = {}
        context_tmp = context.copy()
        context_tmp.update({'create_by_popup': True})
        for data in self.browse(cr, uid, ids, context=context):
            number_session = data.number_session
            product_id = data.product_id.id
            number_code = data.product_id.code_number
            next_code = data.next_code
            if number_session < 1:
                raise osv.except_osv(_('Warning!'), _('Number Session must be greater than to 0.'))
            if number_code < 1:
                raise osv.except_osv(_('Warning!'), _('Please add this product to Products in Category Convert and input public price.'))
            thread_name = "%s_Thread-Create-Session-Code-%s" % (cr.dbname,product_id)
            exits = filter(lambda x: x.name == thread_name, threading.enumerate())
            if exits: 
                raise osv.except_osv(_('Warning!'), _('Thread create Session for this product is running. Please try again!'))
            threaded_calculation = threading.Thread(target=self.thread_create_session_code, args=(cr, uid, next_code, number_session, number_code, product_id, context))
            threaded_calculation.setName(thread_name)
            threaded_calculation.start()
            time.sleep(1)
        return True
    
    def act_approval_delete(self, cr, uid, ids, context=None):
        session_pool = self.pool.get('product.session')
        if context is None:
            context = {}
        for data in self.browse(cr, uid, ids, context=context):
            number_session = data.number_session
            product_id = data.product_id.id
            session_ids = session_pool.search(cr, uid, [('name','=',str(number_session)),('product_id','=',product_id)], context=context)
            if session_ids:
                session_pool.unlink(cr, uid, session_ids, context=context)
            else:
                raise osv.except_osv(_('Warning!'), _('Session %s not found in system. Please check again!' % number_session))
        return True
    
    def thread_create_session_code(self, cr, uid, next_code, number_session, number_code, product_id, context=None):
        session_pool = self.pool.get('product.session')
        with Environment.manage():
            try:
                new_cr = self.pool.cursor()
                for i in range(next_code, next_code + number_session):
                    name_session = str(i)
                    now = (datetime.utcnow() + relativedelta(hours=7)).strftime('%d-%m-%Y %H:%M:%S.%f')[:-3]
                    session_pool.create(new_cr, uid, {
                                                'name': name_session,
                                                'product_id': product_id,
                                                'number_code': number_code,
                                                'date_start': now,
                                                    }, context=context)
                    new_cr.commit()
            except Exception as e:
                new_cr.rollback()
                log.exception(e)
            finally:
                new_cr.close()
        return True
            
            
            
            
            
            
            
            