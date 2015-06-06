from flask import Flask, render_template, request
import os
import json
import juspay
import random

app = Flask(__name__)
app.config['DEBUG'] = True

#add api key
juspay_api = juspay.ExpressCheckout('https://api.juspay.in', 'api_key')

@app.route("/")
def home():
	return render_template('layout.html')

def validate_auth(auth_token): 
	return "C1892777" # Hard coding. Rather, should be figured out from auth_token

## Step1: Client authenticates with merchant server to initiate
#         Merchant server, creates order with Juspay server & retreives card list 
# may have to change the get request to post
@app.route("/init_payment")
def payment_start():
	auth_token = request.args.get('auth_token')
	amount = request.args.get('amount')
	order_id = "O" + str(random.randint(1000000,2000000))
	cust_id = validate_auth(auth_token)	
	order = juspay_api.order_create(order_id, amount)  
	cards = juspay_api.card_list(cust_id)
	return json.dumps({'order': order, 'cards':cards})

## Step5 - Client redirects to merchant return URL
@app.route("/payment_response")  
def payment_status():
	order_id = request.args.get('order_id')
	status = request.args.get('status')
	status_id = request.args.get('status_id')
	## Step6 - merchant server validates payment status with server-server call. (**** IMPORTANT ****)
	order_status = juspay_api.order_status(order_id)

	return render_template('layout.html', 
	 		payment_status = {'order_id': order_status['order_id']})


@app.route("/list_cards")
def list_card():
	auth_token = request.args.get('auth_token')
	cust_id = validate_auth(auth_token)
	cards = juspay_api.card_list(cust_id)
	return json.dumps({'cards':cards})

@app.route('/delete_cards')
def delete_card():
	auth_token = request.args.get('auth_token')
	card_token = request.args.get('card_token')
	cust_id = validate_auth(auth_token)
	card_deleted = juspay_api.card_delete(card_token)
	return json.dumps({'card':card_deleted})


@app.route("/testcase")
def testcase():
	cust_id = "C"+ str(random.randint(1000000,2000000)) 
	order_id = "O" + str(random.randint(1000000,2000000))
	amount = int(random.random() * 100)
	outs = []
	outs += [('order_create' ,  juspay_api.order_create(order_id, amount))]
	outs += [('card_add' , juspay_api.card_add(cust_id, 'test@test.com', '4242424242424242', '2018','09','John Kite','JK'))]
	outs += [('card_list' , juspay_api.card_list(cust_id))]
	outs += [('order_status' , juspay_api.order_status(order_id))]
	return render_template('show_api_calls.html', api_outputs = outs)

port = int(os.environ.get('PORT', 5000))
if __name__ == "__main__":
    app.run(port=port)
