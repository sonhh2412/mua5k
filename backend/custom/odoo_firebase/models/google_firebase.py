# -*- coding: utf-8 -*-
import json
import logging
import re
import time
import threading

import requests
from requests.exceptions import ConnectionError


FCM_MESSAGES_LIMIT = 1000
FCM_END_POINT = "https://fcm.googleapis.com/fcm/send"
FCM_RETRY_ATTEMPT = 2
_logger = logging.getLogger(__name__)
import html2text

def _fcm_prepare_payload():
    """Returns dictionary containing message information for mobile device. This info will be delivered
    to mobile device via Google Firebase Cloud Messaging(FCM). And it is having limit of 4000 bytes (4kb)
    """
    body = 'adfnasdf'
    body = re.sub(ur'<a(.*?)>', r'<a>', body) 
   
    payload = {
        "author_name":'Nguyen Thai Nam',
        "model":'mail.chanel',
        "res_id": 1,
        "db_id": '2ba3b9ba-b69b-11e6-a8fa-000c29f674d1',
        'subject': 'Nguyen Thai Nam',
        'body':html2text.html2text(body),
    }
   
    return payload

def _fcm_process_response(res, subscription_ids):
        response = res.json()
        errors = {}
        canonical = {}
        if response.get('canonical_ids') or response.get('failure'):
            results = response.get('results', [])
            for index, result in enumerate(results):
                error_type = result.get('error')
                if error_type:
                    if error_type not in errors.keys():
                        errors[error_type] = []
                    errors[error_type].append(subscription_ids[index])
                if result.get('registration_id'):
                    canonical[subscription_ids[index]] = result['registration_id']
        return {
            'errors': errors,
            'canonical': canonical
        }


fcm_api_key = 'AIzaSyBWsU-SaD3YCpYAX9WoDLBmX0c94iWAkJE'
headers = {
            "Content-Type": "application/json",
            "Authorization": "key=" + fcm_api_key,
        }
data = {
    'data': _fcm_prepare_payload(),
    'registration_ids': "e6TdeUfPtsg:APA91bEwb-YGsI-N0x3Si4k_8m4xdX0M5yY0pYsV3OXhW1sX6Mym-MnNoIuW-QQo5L6edvXVuxBEGBlCCORhB4cow2Tfm5Xk-t_96vHl3B2ejS4yCtZA7NQ-XOzjURfG3vfpPE2SVT4I"
}
res = {}
response = requests.post(FCM_END_POINT, headers=headers, data=json.dumps(data))
if response.status_code == 200:
    res = _fcm_process_response(response, 'aaf')
elif response.status_code == 401:
    _logger.warning("FCM Authentication: Provide valid FCM api key")
elif response.status_code == 400:
    _logger.warning("Invalid JSON: Invalid payload format")
else:
    _logger.warning("FCM service not available try after some time")
print res