# -*- coding: utf-8 -*-
##############################################################################
#
#    OpenERP, Open Source Management Solution
#    Copyright (C) 2004-2009 Tiny SPRL (<http://tiny.be>).
#    Copyright (C) 2010-2014 OpenERP s.a. (<http://openerp.com>).
#
#    This program is free software: you can redistribute it and/or modify
#    it under the terms of the GNU Affero General Public License as
#    published by the Free Software Foundation, either version 3 of the
#    License, or (at your option) any later version.
#
#    This program is distributed in the hope that it will be useful,
#    but WITHOUT ANY WARRANTY; without even the implied warranty of
#    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#    GNU Affero General Public License for more details.
#
#    You should have received a copy of the GNU Affero General Public License
#    along with this program.  If not, see <http://www.gnu.org/licenses/>.
#    Terminal view queue: sudo rabbitmqctl list_queues
#
##############################################################################
# -------------
#!/usr/bin/env python
from openerp import tools
from openerp.osv import orm, osv, fields
import pika
import sys
from openerp.addons.odoo_sync.rabbitmq import RabbitMQ
import json
import openerp.addons.decimal_precision as dp
from openerp.tools.float_utils import float_round
import string
import re
try:
    import slugify as slugify_lib
except ImportError:
    slugify_lib = None
from openerp.tools import html_escape as escape, ustr, image_resize_and_sharpen, image_save_for_web    

import unicodedata

INTAB = "ạảãàáâậầấẩẫăắằặẳẵóòọõỏôộổỗồốơờớợởỡéèẻẹẽêếềệểễúùụủũưựữửừứíìịỉĩýỳỷỵỹđ"
INTAB = [ch.encode('utf8') for ch in unicode(INTAB, 'utf8')]

OUTTAB = "a"*17 + "o"*17 + "e"*11 + "u"*11 + "i"*5 + "y"*5 + "d"

r = re.compile("|".join(INTAB))
replaces_dict = dict(zip(INTAB, OUTTAB))
def khongdau(utf8_str):
    return r.sub(lambda m: replaces_dict[m.group(0)], utf8_str)

def slugify(s, max_length=None):
    """ Transform a string to a slug that can be used in a url path.

    This method will first try to do the job with python-slugify if present.
    Otherwise it will process string by stripping leading and ending spaces,
    converting unicode chars to ascii, lowering all chars and replacing spaces
    and underscore with hyphen "-".

    :param s: str
    :param max_length: int
    :rtype: str
    """
    s = ustr(s)
    if slugify_lib:
        # There are 2 different libraries only python-slugify is supported
        try:
            return slugify_lib.slugify(s, max_length=max_length)
        except TypeError:
            pass
    uni = unicodedata.normalize('NFKD', s).encode('ascii', 'ignore').decode('ascii')
    slug = re.sub('[\W_]', ' ', uni).strip().lower()
    slug = re.sub('[-\s]+', '-', slug)

    return slug[:max_length]

def slug(value):
    if isinstance(value, orm.browse_record):
        # [(id, name)] = value.name_get()
        id, name = value.id, value.display_name
    else:
        # assume name_search result tuple
        id, name = value
    name = khongdau(name.lower().encode('utf8')) 
    slugname = slugify(name or '').strip().strip('-')
    if not slugname:
        return str(id)
    return "%s-%d" % (slugname, id)
    

class product_product(osv.osv):
    _inherit = "product.product"
   
    _columns = {
                'image_ids':fields.one2many('product.product.image','product_id','Image Link'),
                }
    
    _defaults = {
            'image_ids': [(0,0,{'name':'http://tophinhanhdep.net/wp-content/uploads/2016/01/hinh-anh-hoa-mai-dep-10.jpg',
                                'link_href':'http://tophinhanhdep.net/wp-content/uploads/2016/01/hinh-anh-hoa-mai-dep-10.jpg'
                                }
                        )]
                 }

    def renderImage (self, obj, id):
        return {
            'image' : obj.name,
            # 'sequence' : obj.sequence,
            'imageZoom' : obj.link_href,
            'product_id' : id
        }
        
    def makeIdsCategory(self , public_categ_ids):
        categIds = []
        for category in public_categ_ids:
            catTmp = None
            catTmp = category.parent_id
            categIds.append(category.id)
            while catTmp:
                categIds.append(catTmp.id)
                catTmp = catTmp.parent_id
                if not catTmp:
                    break
        return sorted(map(lambda y: y , set(map(lambda x: x , categIds)))) if len(categIds) > 0 else []

    def makeObjBrand(self, product_brand_id):
        if not product_brand_id:
            return []
        return {
            'id' : product_brand_id.id,
            'name' : product_brand_id.name.lower().encode('utf8'),
            'image' : product_brand_id.src_image,
            'slug': slug(product_brand_id)
        }

    def makeDataQueue(self, cr, uid, product, types):
        if types!='deleteMQ':
            images = map(lambda x: self.renderImage(x,product.id), product.image_ids.sorted(lambda x: x.sequence))
            #main_images = map(lambda l: l.name, filter(lambda x: x.is_main,product.image_ids.sorted(lambda x: x.sequence)))
            vals = {"id": product.id,
                    "slug" : slug(product),
                    "name": product.name_template.title().encode('utf8') or "",
                    "price": product.list_price or product.standard_price,
                    "description": product.description and product.description.encode('utf8') or "",
                    "type": types,
                    'published':product.website_published or False,
                    'sequence':product.website_sequence or 0,
                    # "descriptionSale": product.description_sale and product.description_sale.encode('utf8') or "",
                    # 'ean13':product.ean13 or "",
                    'default_code':product.default_code or "",
                    "images": images,
                    #"main_images" : main_images and main_images[0] or [],
                    'category': self.makeIdsCategory(product.public_categ_ids),
                    "brand": self.makeObjBrand(product.product_brand_id),
                    "limited":product.limited or False,
                    "created_date":product.created_date or ""
                    }
        else:
            vals = {
                    "id": [product.id],
                    'type':types,
                    }
        return json.dumps({'jdata': vals})
    
    def makeDataQueueforUnlink(self, cr, uid, datas, types ):  
        vals = {
                "id": datas.ids,
                'type':types,
                }  
        return json.dumps({'jdata': vals})
    
    
    def makeDataQueueWaitingSync(self, cr, uid, datas, sync_id, types ):
        ids = map(lambda x: x.id, datas)
        max_recipients = 300
        chunks = [ids[x:x + max_recipients] for x in xrange(0, len(ids), max_recipients)]
        is_delete = True if types=="deleteMQ" else False
        for chunk in chunks:
            values = {
                                    'list_ids': [(4, id) for id in chunk],
                                    'sync_id':sync_id,
                                    'name':chunk,
                                    'is_delete': is_delete,
                     }
            check_exists = self.pool.get('general.product.queue').search(cr, uid, [('name','=',str(chunk)),('sync_id','=',sync_id),('is_delete','=',is_delete)])
            if not check_exists:
                self.pool.get('general.product.queue').create(cr, uid, values)
        return True

   
    # function nay dung re-sync cho cac case fail
    def createRabbitMQfO(self, cr, uid, products, types):
        api = RabbitMQ()
        return api.createRabbitMQfO(cr, uid, products, self, self.pool.get('general.synchronization'), 'product_product', 'product_product_logs', types)

    def createRabbitMQ(self, cr, uid, products, types):
        api = RabbitMQ()
        if types != 'deleteMQ':
            return api.createRabbitMQ(cr, uid, products, self, self.pool.get('general.synchronization'), 'product_product', 'product_product_logs', types)
        return api.createRabbitMQforUnlink(cr, uid, products, self, self.pool.get('general.synchronization'), 'product_product', 'product_product_logs', types)

    def write(self, cr, uid, ids, vals, context=None):
        if isinstance(ids, (int, long)):
            ids = [ids]
        res = super(product_product, self).write(cr, uid, ids, vals, context=context)
        if context.get('convert'):
            return res
        products = self.browse(cr, uid, ids)
        self.createRabbitMQ(cr, uid, products, "updateMQ")
        return res

    def create(self, cr, uid,  vals, context=None):
        res_id = super(product_product, self).create(cr, uid, vals, context=context)
        if context.get('convert'):
            return res_id
        product = self.browse(cr, uid, res_id)
        self.createRabbitMQ(cr, uid, [product], "createMQ")
        return res_id

    def unlink(self, cr, uid, ids, context=None):
        if isinstance(ids, (int, long)):
            ids = [ids]
        products = self.browse(cr, uid, ids)
        self.createRabbitMQ(cr, uid, products, "deleteMQ")
        res = super(product_product, self).unlink(cr, uid, ids,  context=context)
        return res

product_product()
