# -*- coding: utf-8 -*-
from openerp import tools
from openerp.osv import osv, fields
from openerp.addons.odoo_sync.rabbitmq import RabbitMQ
from openerp.addons.website.models.website import slug
import openerp.addons.decimal_precision as dp
from openerp.tools.translate import _

import base64
import errno
import logging
import os
class product_product_image(osv.osv):
    _name = "product.product.image"
    _order="sequence"
    _columns = {
        'name':fields.char('Image Link'),
        'sequence':fields.integer('Sequence'),
        'link_href' : fields.char('Image Zoom'),
        'product_id':fields.many2one('product.product', 'Product', ondelete='cascade'),
        'product_tmpl_id': fields.many2one('product.template', 'Product'),
        'is_main':fields.boolean('Image Main'),
        'file_import': fields.binary('File select'),
        'file_name': fields.char('File name', size=255),
    }
    _defaults = {
        'sequence':1,
        'is_main':False
    }
    
    def save_image(self, cr, uid, type_path, file_data,  image):
        file_path = type_path + "/image%s"%(image)
        if not os.path.exists(type_path):
            os.mkdir(type_path)
        new_file = open(file_path, mode="w")
        new_file.write(base64.decodestring(file_data))                
        new_file.close()
        return True

    def create(self, cr, uid, vals, context=None):
        product_id = super(product_product_image, self).create(cr, uid, vals, context=context)
        related_vals = {}
        if vals.get('file_import'):
            related_vals['file_import'] = vals['file_import']             
            self.write(cr, uid, product_id, related_vals, context=context)
        return product_id
             
    def write(self, cr, uid, ids, vals, context=None):
        if isinstance(ids, (int, long)):
            ids = [ids]
        
        dir_data = self.pool.get('ir.config_parameter').get_param(cr, uid, 'image.link_server')
        folder_save = dir_data.split('/')[-1]
        for data in self.browse(cr, uid, ids, context=context):
            full_path = "%s/%s"%(dir_data, data.product_id.id)
            if vals.get('file_import'):
                file_name = vals.get('file_name', data.file_name)
                if not os.path.exists(dir_data):
                    try:
                        os.mkdir(dir_data)
                    except Exception as e:
                        raise osv.except_osv(_('Wrong Permission!'), _('Please set permission for %s!' % dir_data))
                file_import= vals.get('file_import')
                tmp = file_name.split('.')
                ext = tmp[len(tmp)-1]
                if ext not in ('jpeg','png','jpg'):
                    raise osv.except_osv(_('Wrong Type!'), _('Image file must be jpeg, png, jpg!'))
                try:
                    image_small = tools.image_resize_image(file_import, size=(400, 400))
                    image_big = tools.image_resize_image(file_import, size=(800, 800))
                except Exception as e:
                    raise osv.except_osv(_('Wrong Type!'), _('Please check image file!'))
                
                if not os.path.exists(full_path):
                        os.mkdir(full_path)
                
                file_path = full_path + "/" + str(file_name)
                new_file = open(file_path, mode="w")
                new_file.write(base64.decodestring(image_small))  
                new_file.close()          
                vals['name'] = folder_save + "/%s/%s" % (data.product_id.id, str(file_name))
                file_path_big = full_path + "/zoom_" + str(file_name) 
                new_file2 = open(file_path_big, mode="w")
                new_file2.write(base64.decodestring(image_big))     
                vals['link_href'] = folder_save + "/%s/zoom_%s" % (data.product_id.id, str(file_name))
                new_file2.close()
        return super(product_product_image, self).write(cr, uid, ids, vals, context=context)

class product_template(osv.osv):
    _inherit = "product.template"
    _columns = {
        'image_ids':fields.one2many('product.product.image','product_tmpl_id','Image Link'),
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

    def renderImage (self, obj):
        return {
            'images' : obj.name,
            'sequence' : obj.sequence,
            'href' : obj.link_href
        }

product_template()
