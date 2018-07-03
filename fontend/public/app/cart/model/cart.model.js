'use strict'; function ShoppingCart(cartName, $rootScope) {this.cartName = cartName; this.clearCart = false; this.checkoutParameters = {}; this.items = []; this.idArray = []; this.loadItems(); this.$rootScope = $rootScope; } function CartItem(product_id, name, slug, price, quantity, image, id_ck, status) {this.product_id = product_id; this.name = name; this.slug = slug; this.image = image; this.price = price; this.quantity = quantity; this.id_ck = id_ck, this.status = status, this.time = Date.now(); } function checkoutParameters(serviceName, merchantID, options) {this.serviceName = serviceName; this.merchantID = merchantID; this.options = options; } ; ShoppingCart.prototype.removeItem = function(item) {var items = localStorage !== null ? localStorage[this.cartName + '_items'] : null; items = JSON.parse(items); var itemsTmp = []; items.map(function(obj, index) {if (obj.product_id !== item.product_id) {itemsTmp.push(obj); } }).filter(isFinite); this.clearItems(); localStorage[this.cartName + '_items'] = JSON.stringify(itemsTmp); this.loadItems(); this.$rootScope.countCart = this.idArray.length; }; ShoppingCart.prototype.changeQtyItem = function(qty, product) {if (qty === 0) {qty = 1; } if (qty !== null) {var itemsTmp = []; var items = localStorage !== null ? localStorage[this.cartName + '_items'] : null; items = JSON.parse(items); items.map(function(obj, index) {if (obj.product_id === product.product_id) {obj.quantity = qty; } itemsTmp.push(obj); }).filter(isFinite); this.clearItems(); localStorage[this.cartName + '_items'] = JSON.stringify(itemsTmp); this.loadItems(); } } ; ShoppingCart.prototype.loadItems = function() {var items = localStorage !== null ? localStorage[this.cartName + '_items'] : null; if (items !== null && JSON !== null) {try {items = JSON.parse(items); items = items.sort(function(a, b) {if (a.time < b.time) return 1; if (a.time > b.time) return -1; return 0; }); for (var i = 0; i < items.length; i++) {var item = items[i]; if (item.product_id !== null && item.name !== null && item.status !== false) {item = new CartItem(item.product_id, item.name, item.slug, item.price, item.quantity, item.image, item.id_ck, item.status); this.items.push(item); this.idArray.push(item.product_id); } } } catch (err) {} } }; ShoppingCart.prototype.saveItems = function() {if (localStorage !== null && JSON !== null) {this.items = this.items.sort(function(a, b) {if (a.time < b.time) return 1; if (a.time > b.time) return -1; return 0; }); localStorage[this.cartName + '_items'] = JSON.stringify(this.items); } }; ShoppingCart.prototype.addItem = function(product, quantity, amount) {quantity = this.toNumber(quantity); if (quantity !== 0) {var found = false; for (var i = 0; i < this.items.length && !found; i++) {var item = this.items[i]; if (item.product_id === product._id) {found = true; item.quantity = this.toNumber(this.toNumber(item.quantity) + quantity); item.time = Date.now(); if (item.quantity <= 0) {this.items.splice(i, 1); this.idArray.splice(i, 1); } } } if (!found) {var product_id = product._id, name = product.name, slug = product.slug, quantity = quantity, price = amount, id_ck = product.id, image = _.size(product.images) > 0 ? product.images[0].image : '/assets/images/themes/10k.png', itm = new CartItem(product_id, name, slug, price, quantity, image, id_ck, 1); this.items.push(itm); this.idArray.push(itm.product_id); } this.saveItems(); } }; ShoppingCart.prototype.getTotalPrice = function(product_id) {var total = 0; for (var i = 0; i < this.items.length; i++) {var item = this.items[i]; if (product_id === undefined || item.product_id === product_id) {total += this.toNumber(item.quantity * item.price); } } return total; }; ShoppingCart.prototype.getTotalPriceAfterShipping = function() {var total = 0; total = this.getTotalPrice(); if (total < 500) {total += 20; } return total; }; ShoppingCart.prototype.getTotalCount = function(product_id) {var count = 0; for (var i = 0; i < this.items.length; i++) {var item = this.items[i]; if (product_id === undefined || item.product_id === product_id) {count += this.toNumber(item.quantity); } } return count; }; ShoppingCart.prototype.clearItems = function() {this.items = []; this.idArray = []; this.saveItems(); }; ShoppingCart.prototype.toNumber = function(value) {value = value * 1; return isNaN(value) ? 0 : value; }; ShoppingCart.prototype.addCheckoutParameters = function(serviceName, merchantID, options) {if (serviceName != "PayPal" && serviceName != "Google" && serviceName != "Stripe" && serviceName != "COD") {throw "serviceName must be 'PayPal' or 'Google' or 'Stripe' or 'Cash On Delivery'."; } if (merchantID == null) {throw "A merchantID is required in order to checkout."; } this.checkoutParameters[serviceName] = new checkoutParameters(serviceName, merchantID, options); } ; ShoppingCart.prototype.checkout = function(serviceName, clearCart) {this.addCheckoutParameters(serviceName.name, serviceName.email, serviceName.options); if (serviceName.name == null) {var p = this.checkoutParameters[Object.keys(this.checkoutParameters)[0]]; serviceName = p.serviceName; } if (serviceName.name == null) {throw "Use the 'addCheckoutParameters' method to define at least one checkout service."; } var parms = this.checkoutParameters[serviceName.name]; if (parms == null) {throw "Cannot get checkout parameters for '" + serviceName.name + "'."; } switch (parms.serviceName) {case "PayPal": this.checkoutPayPal(parms, clearCart); break; case "Google": this.checkoutGoogle(parms, clearCart); break; case "Stripe": this.checkoutStripe(parms, clearCart); break; case "COD": this.checkoutCOD(parms, clearCart); break; default: throw "Unknown checkout service: " + parms.serviceName; } }; ShoppingCart.prototype.checkoutPayPal = function(parms, clearCart) {var data = {cmd: "_cart", business: parms.merchantID, upload: "1", rm: "2", charset: "utf-8"}; for (var i = 0; i < this.items.length; i++) {var item = this.items[i]; var ctr = i + 1; data["item_number_" + ctr] = item.product_id; data["item_name_" + ctr] = item.name; data["quantity_" + ctr] = item.quantity; data["amount_" + ctr] = item.ori_price.toFixed(2); } var form = $('<form/></form>'); form.attr("action", "https://www.paypal.com/cgi-bin/webscr"); form.attr("method", "POST"); form.attr("style", "display:none;"); this.addFormFields(form, data); if (!parms.options) { parms.options = {}; } this.addFormFields(form, parms.options); $("body").append(form); this.clearCart = clearCart == null || clearCart; form.submit(); form.remove(); }  ; ShoppingCart.prototype.checkoutGoogle = function(parms, clearCart) {var data = {}; for (var i = 0; i < this.items.length; i++) {var item = this.items[i]; var ctr = i + 1; data["item_name_" + ctr] = item.product_id; data["item_description_" + ctr] = item.name; data["item_price_" + ctr] = item.ori_price.toFixed(2); data["item_quantity_" + ctr] = item.quantity; data["item_merchant_id_" + ctr] = parms.merchantID; } var form = $('<form/></form>'); form.attr("action", "https://sandbox.google.com/checkout/api/checkout/v2/checkoutForm/Merchant/" + parms.merchantID); form.attr("method", "POST"); form.attr("style", "display:none;"); this.addFormFields(form, data); if (!parms.options) { parms.options = {}; } this.addFormFields(form, parms.options); $("body").append(form); this.clearCart = clearCart == null || clearCart; form.submit(); form.remove(); } ; ShoppingCart.prototype.checkoutCOD = function(parms, clearCart) {var data = {}; for (var i = 0; i < this.items.length; i++) {var item = this.items[i]; var ctr = i + 1; data["item_description_" + ctr] = item.name; } var form = $('<form/></form>'); form.attr("action", "/order"); form.attr("method", "GET"); form.attr("style", "display:none;"); this.addFormFields(form, data); if (!parms.options) { parms.options = {}; } this.addFormFields(form, parms.options); $("body").append(form); this.clearCart = clearCart == null || clearCart; form.submit(); form.remove(); } ; ShoppingCart.prototype.checkoutStripe = function(parms, clearCart) {var data = {}; for (var i = 0; i < this.items.length; i++) {var item = this.items[i]; var ctr = i + 1; data["item_name_" + ctr] = item.product_id; data["item_description_" + ctr] = item.name; data["item_price_" + ctr] = item.ori_price.toFixed(2); data["item_quantity_" + ctr] = item.quantity; } var form = $('.form-stripe'); form.empty(); form.attr("action", parms.options['chargeurl']); form.attr("method", "POST"); form.attr("style", "display:none;"); this.addFormFields(form, data); if (!parms.options) { parms.options = {}; } this.addFormFields(form, parms.options); $("body").append(form); var token = function(res) {var $input = $('<input type=hidden name=stripeToken />').val(res.id); $.blockUI({ message: 'Processing order...' }); form.append($input).submit(); this.clearCart = clearCart == null || clearCart; form.submit(); }; StripeCheckout.open({key: parms.merchantID, address: false, amount: this.getTotalPrice() * 100, currency: 'usd', name: 'Purchase', description: 'Description', panelLabel: 'Checkout', token: token }); } ; ShoppingCart.prototype.addFormFields = function(form, data) {if (data !== null) {$.each(data, function(name, value) {if (value !== null) {var input = $('<input></input>').attr('type', 'hidden').attr('name', name).val(value); form.append(input); } }); } };