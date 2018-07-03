openerp.odoo_sync_notification = function (session){
    var QWeb = session.web.qweb;
    var _t = session.web._t;

    var mail = session.mail;

    mail.Widget.include({
        init: function (parent, action) {
            var self = this;
            this._super.apply(this, arguments);
            /* Auto Push New Messages to RabbitMQ */
            var context= new session.web.CompoundContext();
            var model = new session.web.DataSet(this, 'general.synchronization', context);
            this.auto_refresh(context, model);
        },
        auto_refresh: function(context, model){
			/* Auto Push New Messages to RabbitMQ */
            var auto_refresh = setInterval(function (){
                model.call("get_message_add_queue",[]).done(function(callback) {
                
                });
            },60000); 
        }
    });
}

