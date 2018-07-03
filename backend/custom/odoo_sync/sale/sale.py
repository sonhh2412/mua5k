# -*- coding: utf-8 -*-
# /home/user/git/lama/customize/lama_queue# python webiste_order_send.py
# :/home/user/git/lama/customize/lama_queue_process# python odoo_recieve_order.py
#!/usr/bin/env python
from openerp import tools
from openerp.osv import osv, fields
import pika
import sys
from openerp.addons.odoo_sync.rabbitmq import RabbitMQ
import json
from openerp import api, _
from openerp.tools import DEFAULT_SERVER_DATE_FORMAT, DEFAULT_SERVER_DATETIME_FORMAT
import datetime
import time
options = {'draft': 'Draft Quotation',
           'sent': 'Wait Confirm',
           'cancel': 'Cancelled',
           'waiting_date': 'Waiting Schedule',
           'progress': 'Sales Order',
           'manual': 'Sale to Invoice',
           'shipping_except': 'Shipping Exception',
           'invoice_except': 'Invoice Exception',
           'done': 'Done',
          }  

websiteoptions = {'confirm': 'Confirm',
           'ordered': 'Ordered',         
           'delivered': 'Delivered',
           'cancel': 'Cancel Delivered',          
           'done': 'Done',
          }  

selection_state = [('draft', 'Draft'),('confirm', 'Confirm'),('ordered', 'Ordered'),('delivered', 'Delivered'),('done', 'Done'),('cancel', 'Cancel Delivered')]

class sale_order(osv.osv):
    _inherit = "sale.order"  
    
    def _amount_data(self, cr, uid, ids, field_name, arg, context=None):
        res = {}
        for order in self.browse(cr, uid, ids, context=context):
            res[order.id] = {}
            group = order.procurement_group_id
            if group:
                shipped = all([proc.state in ['cancel', 'done'] for proc in group.procurement_ids])
            else:
                shipped = False
            state_order = 'draft' 
            if order.state in ('progress','manual'):
                state_order = 'confirm'
            if order.purchase_id:
                state_order = 'ordered'
            if shipped and order.state != 'cancel':
                state_order = 'delivered'
            if order.state == 'done':
                state_order ='done'
            if order.state == 'cancel':
                state_order = 'cancel'
            res[order.id]['state_order'] = state_order
            res[order.id]['state_payment'] = False
            res[order.id]['is_paid'] = True
        return res
    
    def _get_orders_procurements(self, cr, uid, ids, context=None):
        res = set()
        for proc in self.pool.get('procurement.order').browse(cr, uid, ids, context=context):
            if proc.state =='done' and proc.sale_line_id:
                res.add(proc.sale_line_id.order_id.id)
        return list(res)
     
    _columns = {
        'website_id': fields.char('Website ID'),
        'type_order': fields.selection([('cod', 'COD'),('wallet', 'PayDiamond')], 'Payment Method'),
        'is_payonline': fields.boolean('Paid Online'),
        'state_order': fields.function(_amount_data, type='selection', string='Status Order', selection = selection_state,
            store={
                'sale.order': (lambda self, cr, uid, ids, c={}: ids, [ 'state',  'order_line', 'purchase_id'], 10),
                'procurement.order': (_get_orders_procurements, ['state'], 10)
            },
            multi='sums', track_visibility='always'),
        'is_paid': fields.function(_amount_data, type='char', string='Status Payment',
            store={
                'sale.order': (lambda self, cr, uid, ids, c={}: ids, ['is_payonline', 'state', 'invoiced'], 10),
            },
            multi='sums', track_visibility='always'),
        'state_payment': fields.function(_amount_data, type='selection', string='Status Payment', selection = [('unpay', 'UnPayment'),('pay', 'Payment')],
            store={
                'sale.order': (lambda self, cr, uid, ids, c={}: ids, ['is_payonline','state', 'invoiced', 'order_line'], 10),
            },
            multi='sums', track_visibility='always'),
        'purchase_id': fields.many2one('purchase.order', 'Purchase'),
    }
    _defaults = {
        'type_order':'cod'
    }
    
    def onchange_is_payonline(self, cr, uid, ids, is_payonline, context=None):
        context = context or {}
        res = {'value': {'state_payment': 'unpay'}}
        if is_payonline:
            res = {'value':{'state_payment':'pay'}}
        return res
    
    def get_customer(self, cr, uid, vals):
        import pdb
        pdb.set_trace()
        
        results = {'customer': False,'ship':False}
        partner_pool = self.pool.get('res.partner')
        web_customer_id = vals.get('web_customer_id') or False
        partner_ids = partner_pool.search(cr, uid, [('website_id','=',web_customer_id),('website_id','!=',False)])
        if not partner_ids:
            partner_ids = partner_pool.search(cr, uid, [('login','=',vals.get('customer_account')),('login','!=',False)])            
            results['customer'] = partner_ids and partner_ids[0] or False
        else:
            results['customer'] = partner_ids[0]
        if not results.get('customer') and vals.get('customer_account'):
            # tao moi khach hang
            partner_vals = {
                     'name':vals.get('customer_account'),
                     'login':vals.get('customer_account'),
                     'website_id':vals.get('web_customer_id')                    
                    }  
            new_partner = partner_pool.create(cr, uid, partner_vals )
            results['customer'] = new_partner
        if vals.get('web_address_ship') == vals.get('web_customer_id'):
            results['ship'] = results.get('customer')
            return results
        ship_ids = []
        if vals.get('web_address_ship'):
            ship_ids = partner_pool.search(cr, uid, [('website_id','=',vals.get('web_address_ship')),('website_id','!=',False)])
        if ship_ids:
            results['ship'] = ship_ids[0]
        else:
            state_id = False
            state = vals.get('web_address_ship_state_id') or False
            if state:
                state_id = self.pool.get('res.country.state').search(cr, uid, [('id','=', state)])
                state_id = state_id and state_id[0] or False
            country_id = False
            country = vals.get('web_address_ship_country_id') or False
            if country:
                country_id = self.pool.get('res.country').search(cr, uid, [('id','=', country)])
                country_id = country_id and country_id[0] or False
            #tao moi dia chi
            ship_vals = {
                     'name':vals.get('web_address_ship_street'),
                     'street':vals.get('web_address_ship_street'),
                     'website_id':vals.get('web_address_ship'),
                     'country_id':country_id,
                     'state_id':state_id,
                     'parent_id': results.get('customer')             
                    }  
            new_ship = partner_pool.create(cr, uid, ship_vals )
            results['ship'] = new_ship
            return results
        return  results       
        
    def check_product(self, cr, uid, product_id):
        if self.pool.get('product.product').search(cr, uid, [('id','=',product_id)]):
            return True
        return False
    
    def get_product_ship(self, cr, uid):
        data = self.pool.get('product.product').search_read(cr, uid, [('name','in',('Ship','Phí Vận chuyển')),('type','=','service')], ['id'])
        if data:
            return data[0]['id']
        return self.pool.get('product.product').create(cr, uid, {'name':'Ship', 'type':'service'})
    
    @api.cr_uid_ids_context
    def action_set_order(self, cr, uid, vals, context=None):
        
        partner_lst = self.get_customer(cr, uid, vals)
        if partner_lst.get('customer'):
            partner = self.pool.get('res.partner').browse(cr, uid, partner_lst.get('customer') )
            lines = vals.get('lines') or False  
            if len(lines):
                line_lsts = []
                for line in lines:
                    if self.check_product(cr, uid, line.get('product_id')):
                        product = self.pool.get('product.product').browse(cr, uid,line.get('product_id') )
                        lns = {
                                'product_id': line.get('product_id'),
                                'product_uom_qty': line.get('qty'),
                                'product_uos_qty': line.get('qty'),
                                'product_uom': product.uom_id.id,
                                'price_unit': line.get('price'),
                                'name': product.name,
                                'delay': product.sale_delay,
                              }  
                        line_lsts.append((0,0,lns)) 
               
                dateorder = datetime.datetime.strptime(vals.get('order_date'), DEFAULT_SERVER_DATETIME_FORMAT)
                zonetime = dateorder - datetime.timedelta(hours=7)
                datestr = datetime.datetime.strftime(zonetime, DEFAULT_SERVER_DATETIME_FORMAT)               
                values = {
                           'partner_id': partner_lst.get('customer'),
                           'date_order':datestr,
                           'website_id':vals.get('order_id'),
                           'client_order_ref':vals.get('order_name'),
                           'note':vals.get('note'),
                           'pricelist_id': partner.property_product_pricelist and partner.property_product_pricelist.id or 1,
                           'order_line':line_lsts,
                           'partner_invoice_id': partner_lst.get('customer'),
                           'partner_shipping_id':partner_lst.get('ship'),
                           'type_order': vals.get('type_order') and vals.get('type_order') or 'cod',
                           'is_payonline': vals.get('paid') and vals.get('paid') or False                       
                          }
                sale_id = self.create(cr, uid, values )
                self.action_button_confirm(cr, uid, [sale_id], context=context)
                time.sleep(1)
        return True
    
    def action_wait_confirm(self, cr, uid, ids, context=None):
        return self.signal_workflow(cr, uid, ids, 'quotation_sent')
    
    def write(self, cr, uid, ids, vals, context=None):
        if isinstance(ids, (int, long)):
            ids = [ids]
        res = super(sale_order, self).write(cr, uid, ids, vals, context=context)
        sales = filter(lambda y: y.is_dial, map(lambda x: x, self.browse(cr, uid, ids)) )
        self.createRabbitMQ(cr, uid, sales, "updateOrder")
        return res
    
    #Dong bo don hang nguoc lai website
    
    def renderLine (self, obj):
        return {
            'name' : obj.name and obj.name.encode('utf8') or "",
            'product_id' : obj.product_id and obj.product_id.id or "",
            'quantity' : obj.product_uom_qty or 1,
            'price_unit' : obj.price_unit
        }
    
    def makeDataQueueDial(self, cr, uid, sale, types):
        lines = map(lambda x: self.renderLine(x), sale.order_line)
        state = websiteoptions[sale.state_order] 
        vals = {"id": sale.id,
                "name": sale.name or "",
                "description": sale.client_order_ref and sale.client_order_ref.encode('utf8') or "",
                "note": sale.note and sale.note.encode('utf8') or "",
                "partner_id":sale.partner_id.website_id or "",
                "state_string": state,
                'state': sale.state_order,
                "shipper_id":sale.partner_shipping_id and  sale.partner_shipping_id.website_id or sale.partner_id.website_id,
                'lines':lines
                }
       
        return json.dumps({'jdata': vals})
    
    def makeDataQueueWaitingSyncDial(self, cr, uid, datas, sync_id, types ):
        ids = map(lambda x: x.id, datas)
        max_recipients = 300
        chunks = [ids[x:x + max_recipients] for x in xrange(0, len(ids), max_recipients)]
        for chunk in chunks:
            values = {
                                    'list_ids': [(4, id) for id in chunk],
                                    'sync_id':sync_id,
                                    'name':chunk,
                     }
            check_exists = self.pool.get('general.saledial.queue').search(cr, uid, [('name','=',str(chunk)),('sync_id','=',sync_id)])
            if not check_exists:
                self.pool.get('general.saledial.queue').create(cr, uid, values)
        return True
    
    def createRabbitMQDial(self, cr, uid, sales, types):
        api = RabbitMQ()
        return api.createRabbitMQDial(cr, uid, sales, self, self.pool.get('general.synchronization'), 'odoo_order_dial', 'odoo_order_dial_logs', types)

    def create(self, cr, uid,  vals, context=None):
        res_id = super(sale_order, self).create(cr, uid, vals, context=context)
        if vals.get('is_dial', False):
            sale = self.browse(cr, uid, res_id)
            self.createRabbitMQDial(cr, uid, [sale], "createMQ")
        return res_id
    
    def createRabbitMQDialfO(self, cr, uid, sales, types):
        api = RabbitMQ()
        return api.createRabbitMQDialfO(cr, uid, sales, self, self.pool.get('general.synchronization'), 'odoo_order_dial', 'odoo_order_dial_logs', types)
    
    #ket thuc dong bo don hang
    
    #bat dau dong bo trang thai don hang
    def createRabbitMQfO(self, cr, uid, sales, types):
        api = RabbitMQ()
        return api.createRabbitMQfO(cr, uid, sales, self, self.pool.get('general.synchronization'), 'odoo_order_state', 'odoo_order_state_logs', types)
    
    def createRabbitMQ(self, cr, uid, sales, types):
        api = RabbitMQ()
        return api.createRabbitMQ(cr, uid, sales, self, self.pool.get('general.synchronization'), 'odoo_order_state', 'odoo_order_state_logs', types)
   
    def makeDataQueue(self, cr, uid, sale, types):
        if types=='updateOrder':       
            state = websiteoptions[sale.state_order]           
            vals = {"id": sale.id,
                    "name": sale.name,
                    "description":sale.client_order_ref,
                    "state_string": state,
                    'state': sale.state_order,
                    }
            return json.dumps({'jdata': vals})
        return json.dumps({'jdata': {}})
    
    def makeDataQueueWaitingSync(self, cr, uid, datas, sync_id, types ):
        ids = map(lambda x: x.id, datas)
        max_recipients = 300
        chunks = [ids[x:x + max_recipients] for x in xrange(0, len(ids), max_recipients)]
        for chunk in chunks:
            values = {
                                    'list_ids': [(4, id) for id in chunk],
                                    'sync_id':sync_id,
                                    'name':chunk,                                 
                     }
            check_exists = self.pool.get('general.sale.queue').search(cr, uid, [('name','=',str(chunk)),('sync_id','=',sync_id)])
            if not check_exists:
                self.pool.get('general.sale.queue').create(cr, uid, values)
        return True
sale_order()    