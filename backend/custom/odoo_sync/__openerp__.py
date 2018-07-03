# -*- coding: utf-8 -*-
{
    'name' : 'Odoo and RabbitMQ',
    'version' : '1.1',
    'author' : 'oanhle@icsc.vn',
    "summary": "Odoo Push Message to RabbitMQ",
    'description': """ Sync between Odoo with Website through RabbitMQ using Pika 1.1.0 Python""",
    'category' : 'Queue',
    'website': 'http://www.icsc.vn',
    'depends': ['base','website_sale','sale','product_brand','product','odoo_general','purchase'],
    'data': [
              'security/base_security.xml',
              'security/ir.model.access.csv',
              'data/cron_data.xml',
              'general/general_view.xml',
              'public_category/product_public_category.xml',
              'product/product_view.xml',
              'sale/sale_view.xml',
              'partner/location_view.xml',
              'partner/res_partner_view.xml',
             'partner/notify_to_customers_view.xml',
            ],
    'installable': True,
    'auto_install': False,
    'application': True,
    'sequence': 0,
}
# vim:expandtab:smartindent:tabstop=4:softtabstop=4:shiftwidth=4:
