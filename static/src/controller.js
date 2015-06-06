

var mainCards = [];
function gAuthToken(){
	return "123123123";
}
var controller = {	
	getCards : function(){	
		//$.get('/list_cards',)
		return mainCards;
	},
	listCards: function(){

	},
	initPayment : function(amount){
		$.get('/init_payment',{"auth_token": gAuthToken(), "amount": amount}, function(data){1
			var data = JSON.parse(data);			
			var cards = data.cards;
			var cardsList = cards.cards;		
			var card_nums = [];

			cardsList.forEach(function(c){
				card_nums.push(c.card_number);
				mainCards.push(c.card_number);
			});		
			return card_nums;
		});
	}
}
