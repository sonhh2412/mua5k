#!/bin/sh
`sh -c "pkill -9 -f /home/user/workspace/10k/backend/custom/odoo_queue_process/odoo_recieve_customer.py"`
`sh -c "python /home/user/workspace/10k/backend/custom/odoo_queue_process/odoo_recieve_customer.py"`
`sh -c "sync; echo 3 > /proc/sys/vm/drop_caches"`
`echo "ok" >> /home/user/text.txt`