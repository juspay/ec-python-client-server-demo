var card_nums = ["Loading"];
var g_amount = 0;
var orderId = 0;
var mId = 0;
var bankError = '';

$loading = $('#loading').hide();
$(document)
	  .ajaxStart(function () {
	    $loading.show();
	  })
	  .ajaxStop(function () {
	    $loading.hide();
	  });

function jusPay(){
	Juspay.Setup({
	    	payment_form: "#payment_form",
		    success_handler: function(status) {
		    	if(status=="SUCCESS"){
		    		window.location.hash = "/success";
		    	}else{
		    		window.location.hash = "/failure";
		    	}		    	
		    },
		    error_handler: function(error_code, error_message, bank_error_code, 
		        bank_error_message, gateway_id) {
		    		window.location.hash = "/failure";
		    		bankError = bank_error_message;
		    }
		});
}

function updateForm(){
	$('.merchant_id').val(mId);
	$('.order_id').val(orderId);
}

var Success = React.createClass({
	render: function(){
		return (			
				<div className="alert alert-success">Your transaction is successful!<br/>
					<a href="#/shopping"><button className="btn btn-success">Shopping!</button></a>
				</div>
			)
	}
});

var Failure = React.createClass({
	render: function(){
		return (
				<div className="alert alert-danger">Error! {bankError}<br />
					<a href="#/shopping"><button className="btn btn-success">Shopping!</button></a>
				</div>				
			)
	}
});

var Pay = React.createClass({
	pay: function(){
	},
	render: function(){
		return (
			<div id="pay">
				<Tabs />
				<TabContent />
				
				
			</div>
			);
	}
});

var Tabs = React.createClass({
	render: function(){
		return(		
			<ul className="nav nav-tabs">
				<li className="active">
					<a href="#saved" aria-controls="saved" data-toggle="tab">
						<h3>Saved Cards</h3>
					</a>
				</li>
				<li>
					<a href="#new" aria-controls="new" data-toggle="tab">
						<h3>New Card</h3>
					</a>
				</li>
				<li>
					<a href="#net" aria-controls="net" data-toggle="tab">
						<h3>Net Banking</h3>
					</a>
				</li>
			</ul>
			);
	}
});


var CreditCardForm = React.createClass({
	componentDidMount: function(){		
		jusPay();
	},
	render: function(){
		return (
				<form className="juspay_inline_form" method="POST" id="payment_form" action="https://api.juspay.in/payment/handlePay">
				    <input type="hidden" className="merchant_id" value={mId} />
				    <input type="hidden" className="order_id" value={orderId}/>
				    <input type="text" className="form-control card_number" placeholder="Card number" />
				    <input type="text" className="form-control name_on_card" placeholder="Cardholder name" />
				    <input type="text" className="sm_inp card_exp_month" placeholder="MM" /> - <input type="text" className="sm_inp card_exp_year" placeholder="YYYY" />
				    <input type="text" className="sm_inp security_code" placeholder="CVV" />
				    <input type="checkbox"  className="juspay_locker_save" /> Save card information
				    <input type="hidden" className="redirect" value="true" />				    
				    <button type="submit" className="btn btn-success make_payment">Pay</button>			    
				</form>
			);

	}
});

var TabContent = React.createClass({
	render: function(){		
		return (
				<div className="tab-content">
					<div role="tabpanel" className="tab-pane active" id="saved">
						<ListCards />
					</div>
					<div role="tabpanel" className="tab-pane" id="new">
						<CreditCardForm />
					</div>
					<div role="tabpanel" className="tab-pane " id="net">
						
					</div>
				</div>
			);
	}
});

var ListCards = React.createClass({
	getInitialState: function(){
		$.get('/init_payment',{ "auth_token": gAuthToken(), "amount":g_amount }, function(data){
			var data = JSON.parse(data);
			var cards = data.cards;
			var cardsList = cards.cards;
			card_nums.splice(0);			
			mId = data.cards.merchantId;
			orderId = data.order.order_id;
			cardsList.forEach(function(c){				
				card_nums.push({'ctoken':c.card_token,'cid':cards.customer_id,'cno':c.card_number});
			});
			updateForm();
			this.setState({card_nums:card_nums});
			this.forceUpdate();
		}.bind(this));
		return {
			cards : card_nums
			};
	},
	render: function(){
		var cards = [];
		this.state.cards.forEach(function(card){
			if(card!=="Loading")
				cards.push(<EachCard ctoken={card.ctoken} c={card.cno} id={card.cid}/>);
			else{
				cards = card_nums;
			}
		});
		return (
			<div>
				<h1>Card List</h1>
				<ul className="list-group">
					{cards}
				</ul>
			</div>
		);
	}
});

var StoredForm = React.createClass({
	componentDidMount: function(){
		jusPay();
	},
	render: function(){		
		return (
				<form className="juspay_inline_form" method="POST" id="payment_form" action="https://api.juspay.in/payment/handlePay">
					<input type="hidden" className="card_token" value={this.props.card_token} />
				    <input type="hidden" className="merchant_id" value={mId} />
				    <input type="hidden" className="order_id" value={orderId} />
					<input type="text" className="sm_inp security_code" placeholder="CVV" />
    				<button type="submit" className="btn btn-success make_payment">Pay</button>
				</form>
				);
	}
});

var EachCard = React.createClass({
	getInitialState: function() {
    	return { clas: '' , showPay:false};
  	},
	selectedCard: function(){
		if(this.state.showPay){
			this.setState({clas:'', showPay:false});	
		}else{
			this.setState({clas:'active', showPay:true});
		}		
	},
	render: function(){
		var pay = pay = <StoredForm card_token={this.props.ctoken} toShow={this.state.showPay} />;
		if (this.state.showPay){
			pay = <StoredForm card_token={this.props.ctoken} toShow={this.state.showPay} />;
		}else{
			pay = null;
		}
		return (
				<div>
					<li onClick={this.selectedCard} className={this.state.clas+" list-group-item"}>{this.props.c} 
	      				<span className="badge rem">X</span>
	      			</li>
	      			{pay}
      			</div>
			);
	}	
});

var Shopping = React.createClass({
	getInitialState: function(){
		return {amount:0};
	},
	amountChange: function(event){
		this.setState({amount:event.target.value});
	},
	submitAmount: function(){
		g_amount = this.state.amount;		
	},
	render: function(){
		return (
			<div className="shopping-form">
        		<div className="form-group">
        			<input className="form-control" placeholder="Amount" onChange={this.amountChange} />        			
        		</div>
        		<div className="form-group text-center">
	        		<a href="#/pay" onClick={this.submitAmount}>
		        		<button className="btn btn-success">
		        			submit
		        		</button>
	        		</a>
        		</div>
        	</div>
			);
	}
});

var LoginForm = React.createClass({
    render: function(){
        return (
        	<div className="login-form">
        		<div className="form-group">
        			<input className="form-control" placeholder="username" />
        			<input className="form-control" placeholder="password" />
        		</div>
        		<div className="form-group text-center">
	        		<a href="#/shopping">
		        		<button className="btn btn-success">
		        			submit
		        		</button>
	        		</a>
        		</div>        		
        	</div>
        	);
    }
});

var MainApp = React.createClass({
	render: function(){
		var partial;
		if((this.props.route === '' || this.props.route === '/') && (window.location.href.indexOf("payment_response") == -1)){
			partial = <LoginForm />;						
		} else if(this.props.route === '/shopping'){
			partial = <Shopping />
		}else if(this.props.route === '/pay'){
			partial = <Pay />
		}else if(this.props.route === '/success'){
			partial = <Success />
		}else if(this.props.route === '/failure'){
			partial = <Failure />
		}else{
			if(!(window.location.href.indexOf("CHARGED") == -1)){
				partial = <Success />
			}else{
				partial = <Failure />
			}
		}
		return (
				<div id="main" className="container-fluid">
					{partial}
				</div>
			);
	}
});

function render(){
	var route = window.location.hash.substr(1);
	React.render(
		<MainApp route={route} />,
		document.body
	); 

}

window.addEventListener('hashchange', render);
render();