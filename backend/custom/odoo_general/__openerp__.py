# -*- coding: utf-8 -*-
{
    'name': '10K GENERAL',
    'version': '1.0',
    "sequence": 0,
    'category': 'Apps',
    'description': """
        1. San pham
        2. ...
    """,
    'author': 'info@icsc.vn',
    'website': 'www.icsc.vn',
    'depends': ["base","sale","product","account","account_voucher", "crm", "product_brand",
                'website_sale','stock',"purchase","report_aeroo","report_aeroo_controller","mail"],
    'data': [
             'security/general_security.xml',
             'security/ir.model.access.csv',
             'wizard/product_session_popup_view.xml',
             'wizard/wizard_select_product_view.xml',
             'data/category_conver_data.xml',
             'data/sequence.xml',
             'data/product_session_code_data.xml',
             'data/res_country_state.xml',
             'report/report_view.xml',
             'menu_view.xml',
             'product/category_convert_view.xml',
             'product/product_view.xml',
             'product/session_product_view.xml',
             'product/product_report_view.xml',
             'product/dialed_session_view.xml',
             'partner/partner_view.xml',
             'partner/number_k_view.xml',
             'partner/report_members_view.xml',
             'partner/buy_credit_k_view.xml',
             'partner/report_member_asscess_view.xml',
             'partner/report_transaction_average_view.xml',
             'partner/wizard/wizard_select_partner_view.xml',
             'partner/credit_card_view.xml',
             'partner/give_k_view.xml',
            
             'account/account_invoice_view.xml',
             'account/account_voucher_view.xml',

             'public_category/product_public_category.xml',
                 
             'purchase/list_of_transaction_view.xml',
             'purchase/purchase_order_view.xml',
             
             'sale/sale_order_view.xml',
             #'sale/wheel_of_fortune_view.xml',
             #'sale/dial_paramater_view.xml',
            'sale/list_of_winner_view.xml',
            'sale/sale_report_view.xml',
            'sale/sale_report_k_view.xml',
            'sale/sale_report_quantity_view.xml',
            
            'warehouse/stock_view.xml',
            
            'import_data/views/import_data_view.xml',
            'import_data/views/import_product_view.xml',
            
    ],
    'auto_install': True,
    'active': True,
    'application': True,  
}
# vim:expandtab:smartindent:tabstop=4:softtabstop=4:shiftwidth=4:
