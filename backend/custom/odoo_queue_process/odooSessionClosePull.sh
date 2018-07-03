#!/bin/sh
`sh -c "pkill -9 -f /home/user/workspace/10k/backend/custom/odoo_queue_process/odoo_session_close.py"`
`sh -c "python /home/user/workspace/10k/backend/custom/odoo_queue_process/odoo_session_close.py"`
`sh -c "sync; echo 3 > /proc/sys/vm/drop_caches"`
`echo "cok" >> /home/user/text.txt`
