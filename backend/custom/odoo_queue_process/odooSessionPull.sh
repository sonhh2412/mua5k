#!/bin/sh
`sh -c "pkill -9 -f /home/user/workspace/10k/backend/custom/odoo_queue_process/odoo_session_add.py"`
`sh -c "python /home/user/workspace/10k/backend/custom/odoo_queue_process/odoo_session_add.py"`
`sh -c "sync; echo 3 > /proc/sys/vm/drop_caches"`
`echo "sok" >> /home/user/text.txt`
