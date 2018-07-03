# -*- coding: utf-8 -*-
{
    'name': "Firebase Cloud Messaging",
    'version': "1.0",
    'summary': 'Push notification for mobile app',
    'description': """
Google Firebase Messaging Integration
=====================================
This module allows to send FCM push notification on registered mobiles
for every message in chatter.

**Configure your API keys from General Setting**
link account: https://console.firebase.google.com/

    """,
    'depends': ['mail','base'],
    'data': [
        'views/assets.xml',
        'views/res_config.xml',
        'views/res_partner.xml',
        'security/ir.model.access.csv'
    ],
    'installable': True,
    'application': True,
    'auto_install': True,
}
