# -*- coding: utf-8 -*-

from openerp import api, tools, SUPERUSER_ID
from openerp.osv import osv, fields, expression
from openerp.tools.translate import _
import json
from openerp.addons.odoo_sync.rabbitmq import RabbitMQ
from datetime import datetime

class product_session(osv.osv):
    _inherit = "product.session"
  
    
    def makeDataQueueforSessionProducts(self, cr, uid, data, types ):  
        #code_data = map(lambda x: self.renderCodeforSession(x), data.codes)
        #string = ",".join(",".join(str(i) for i in x) for x in code_data)
        vals = {
                "product_id": data.product_id.id,
                'session_id':data.id,
                'type':types,
                'total': data.number_code
                }  
        return json.dumps({'jdata': vals})
    
    def makeDataQueueforSessionProductsUnlink(self, cr, uid, datas, types ):
        vals = {
                'product_id': datas[0].product_id.id,
                "id": datas.ids,
                'type':types,
                }  
        return json.dumps({'jdata': vals})
   
    def renderCodeforSession(self, obj):
        return  obj.name, obj.id           
        
    
    def makeDataQueueWaitingSyncSessionProduct(self, cr, uid, datas, sync_id, types ):
        ids = map(lambda x: x.id, datas)
        max_recipients = 5
        chunks = [ids[x:x + max_recipients] for x in xrange(0, len(ids), max_recipients)]
        for chunk in chunks:
            values = {'sync_id':sync_id, 'name':chunk}
            check_exists = self.pool.get('general.session.product.queue').search(cr, uid, [('name','=',str(chunk)),('sync_id','=',sync_id)])
            if not check_exists:
                self.pool.get('general.session.product.queue').create(cr, uid, values)
        return True
    
    def createRabbitMQforSessionProducts(self, cr, uid, products, types):
        api = RabbitMQ()
        if types != 'deleteMQ':
            return api.createRabbitMQforSessionProducts(cr, uid, products, self, self.pool.get('general.synchronization'), 'product_session', 'product_session_logs', types)
        return api.createRabbitMQforSessionProductsUnlink(cr, uid, products, self, self.pool.get('general.synchronization'), 'product_session', 'product_session_logs', types)
    
    def create(self, cr, uid, vals, context=None):
        session_product_id = super(product_session, self).create(cr, uid, vals, context=context)
        #dong bo
        self.createRabbitMQforSessionProducts(cr, uid, [self.browse(cr, uid, session_product_id)], "createMQ")
        return session_product_id
    
    def unlink(self, cr, uid, ids, context=None):
        if isinstance(ids, (int, long)):
            ids = [ids]
        session = self.browse(cr, uid, ids, context=context)[0]
        search_ids = self.search(cr, uid, [('id','>=',session.id),('product_id','=',session.product_id.id)], order='name', context=context)
        unlink_ids = []
        raise_ids = []
        for obj in self.browse(cr, uid, search_ids, context=context):
            if not obj.order_ids.ids:
                unlink_ids.append(obj.id)
            else:
                raise_ids.append(obj.name)
        if raise_ids:
            raise osv.except_osv(
                _(u'Thông báo!'),_(u'Không được xóa phiên số %s. Phiên sản phẩm đã bán mã.' % ', '.join(raise_ids))
            )
        self.createRabbitMQforSessionProducts(cr, uid, self.browse(cr, uid, unlink_ids), "deleteMQ")
        result = super(product_session, self).unlink(cr, uid, unlink_ids, context=context)
        return result
    
    def write(self, cr, uid, ids, vals, context=None):

        session_product_id = super(product_session, self).write(cr, uid, ids, vals, context=context)
        #dong bo
        self.createRabbitMQforSessionProducts(cr, uid, [self.browse(cr, uid, ids)], "createMQ")
        return session_product_id
    
    @api.cr_uid_ids_context
    def action_create_multi_session(self, cr, uid, vals, context=None):
        try:
            product_ids = vals.get('product_id',False) and eval(vals.get('product_id',False) )  or []
        except:
            product_ids = vals.get('product_id',False) or []
        if product_ids:
            product_ids = self.pool.get('product.product').search(cr, uid, [('id','in',product_ids)])
            number = vals.get('number',0) or 0
            if number > 0:
                create_id = self.pool.get('product.session.create').create(cr, uid, {'number_session': number,'product_ids':[(6,0,product_ids)]})
                try:
                    self.pool.get('product.session.create').act_approval(cr, uid, create_id)
                except:
                    return True
        return True
    
    
    @api.cr_uid_ids_context
    def action_close_multi_session(self, cr, uid, vals, context=None):
        try:
            session_ids = vals.get('session_id',False) and eval(vals.get('session_id',False) )  or []
        except:
            session_ids = vals.get('session_id',False) or []
        if session_ids:
            #session_ids = self.search(cr, uid, [('id','in',session_ids)])
            now = datetime.utcnow().strftime('%d-%m-%Y %H:%M:%S.%f')[:-3]
            self.write(cr, uid, session_ids, {'date_start':vals.get('start',now),'date_stop':vals.get('end',now)})
                
        return True
    
    @api.cr_uid_ids_context
    def action_website_dial(self, cr, uid, vals, context=None):
        session_id = vals.get('session_id',False) or False
        if session_id:
            session_ids = self.search(cr, uid, [('id','=',session_id)])
            if session_ids:
                partner_id = False
                if vals.get('winner_id',False):
                    partner_id = self.pool.get('res.partner').search(cr, uid, [('website_id','=',vals.get('winner_id',False)),('website_id','!=',False)])
                values = {
                           'partner_id':partner_id and partner_id[0] or False,
                           'number_win':vals.get('number_win',False),
                           'address_id':partner_id and partner_id[0] or False,
                          }
                if vals.get('address_id',False):
                    address_id = self.pool.get('res.partner').search(cr, uid, [('website_id','=',vals.get('address_id',False)),('website_id','!=',False)])
                    if address_id:
                        values.update({
                                   'address_id':address_id[0]
                                   })
                # if vals.get('start',False):
                #     values.update({
                #                    'date_start':vals.get('start')
                # })
                if vals.get('end',False):
                    values.update({
                                   'date_stop':vals.get('end')
                                   })

                
                self.write(cr, uid, session_ids, values, context=context)
                self.action_dial(cr, uid, session_ids, context=context)
        return True
