server {
        listen 80;
        server_name  erp.mua5k.com;
        location / {
                proxy_pass              http://127.0.0.1:8169;
                proxy_pass_header       Accept;
                proxy_pass_header       Server;
                proxy_http_version      1.1;
                keepalive_requests      1000;
                keepalive_timeout       360s;
                proxy_read_timeout      360s;
        }
}

