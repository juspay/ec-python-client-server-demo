import urllib3
import json


class ExpressCheckout:

	def __init__(self, ec_url, auth_key):
		self.http = urllib3.PoolManager()
		self.auth_headers = urllib3.util.make_headers(basic_auth=auth_key+':')
		self.url_prefix = ec_url
	
	def __call_juspay(self, method, path, params):
		resp = self.http.request("POST", self.url_prefix + path, headers=self.auth_headers,fields=params).data
		return json.loads(resp)	

	def order_create(self, order_id, amount, **kwargs):
		fields={'order_id': order_id,'amount': str(amount)}
		fields.update(kwargs)
		return self.__call_juspay('POST', '/order/create',fields)

	def order_status(self, order_id):
		return self.__call_juspay('GET', '/order/status', {'order_id':order_id})

	def order_refund(self, request_id, order_id, amount):
		return self.__call_juspay('POST','/order/refund', 
				{'request_id':request_id, 'order_id':order_id, 'amount':amount})

	def card_list(self, customer_id):
		return self.__call_juspay('GET', '/card/list', {'customer_id':customer_id})

	def card_add(self, customer_id, customer_email, card_num, exp_year, exp_month, name_on_card, nickname):
		return self.__call_juspay('POST', '/card/add', 
			{'customer_id':customer_id, 'customer_email':customer_email, 'card_number':card_num, 
			 'card_exp_year':exp_year, 'card_exp_month': exp_month, 'name_on_card':name_on_card, 'nickname':nickname})

	def card_delete(self, card_token):
		return self.__call_juspay('POST','/card/delete', {'card_token':card_token})
