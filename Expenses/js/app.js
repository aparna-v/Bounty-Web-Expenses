App = Ember.Application.create();

App.Router.map(function(){	

	this.resource("ledger");
	this.resource("people", function(){
		this.resource('userDetails', {path: ':user_id'});
		this.resource('newUser', {path: ':user_id/new'});
	});
	this.resource("expenses", function(){

		this.resource('expenseDetails', {path: ':expense_id'});
		this.resource('newExpense', {path: ':expense_id/new'});
	});
});

App.Store = DS.Store.extend({
	revision: 13,
	adapter: DS.FixtureAdapter.create()
});

App.People = DS.Model.extend({
	name: DS.attr( 'string' ),
	display: DS.attr( 'string' ),
	description: DS.attr('string'),
	imgsrc: DS.attr('string')
});

App.People.FIXTURES = [  { id: 0, name: "Sameer", display: "Sameer",description: "Founder", imgsrc: "sameer.png" },
                         { id: 1, name: "Kaushik",display: "Kaushik",description: "Web Engineer",imgsrc: "kaushik.jpg"},
                         { id:2,  name: "Shubham",display: "Shubham", description: "Android Engineer",imgsrc: "shubham.jpg"}
                         ];

App.PeopleRoute = Ember.Route.extend({

	model : function()
	{

		return this.get('store').find('People');
	},

	events: {

		createUser: function(count){
			var store = this.get('store');
			var newUserRec = store.createRecord('People',{
				id: count
			});
			this.transitionTo('newUser',newUserRec);
		}
	}
});


App.UserDetailsRoute = Ember.Route.extend({

	model : function(params)
	{
		return this.get('store').find('People',params.user_id);
	},
	events: {

		removeUser: function(id){
			console.log(id);
			this.get('store').find('People', id).then(function(rec){
				rec.deleteRecord();
				rec.save();
			});

			this.transitionTo('people');
		}
	}

});


App.NewUserRoute = Ember.Route.extend({

	model : function(params)
	{
		return people[params.user_id];
	},

	events: {

		save: function(){
			var newUser = this.modelFor('newUser');
			this.transitionTo('userDetails',newUser);
		}
	}
});

App.PeopleController = Ember.ObjectController.extend({

	usersCount: function(){
		return this.get('model.length');
	}.property('@each')

});

App.UserDetailsController = Ember.ObjectController.extend({
	isEditing: false,

	editUser: function() {
		this.set('isEditing', true);
	},


	doneEditingUser: function() {
		this.set('isEditing', false);
		this.get('store').commit();
	}
});

App.Expenses = DS.Model.extend({
	who: DS.attr( 'string' ),
	date: DS.attr( 'date' ),
	description: DS.attr('string'),
	amount: DS.attr('number'),
	whom: DS.attr('string')
});


App.Expenses.FIXTURES = [ ];

App.ExpensesRoute = Ember.Route.extend({

	model : function()
	{
		return this.get('store').find('Expenses');
	},

	events: {

		addExpense: function(count){
			var store = this.get('store');		
			var newUser = store.createRecord('Expenses',{
				id: count				
			});
			this.transitionTo('newExpense',newUser);
		}
	}
});

App.ExpensesController = Ember.ObjectController.extend({

	expensesCount: function(){
		return this.get('model.length');
	}.property('@each')

});

App.ExpenseDetailsRoute = Ember.Route.extend({

	model : function(params)
	{
		return this.get('store').find('Expenses',params.expense_id);
	},
	events: {

		removeExp: function(id){
			console.log(id);
			this.get('store').find('Expenses', id).then(function(rec){
				rec.deleteRecord();
				rec.save();
			});

			this.transitionTo('expenses');
		}
	}

});


App.NewExpenseRoute = Ember.Route.extend({

	model : function(params)
	{
		return expenses[params.expense_id];
	},

	
		events: {

			
			save: function(){

				var newExpense = this.modelFor('newExpense');
				var store = this.get('store');
				var who = newExpense.get('who');
				var amount = parseFloat(newExpense.get('amount'));
				var count=0;
				Ember.String.w(newExpense.get('whom')).forEach(function(key){

					count++;
				});
				console.log(count);

				if(store.getById('Ledger',who)!=null)
				{

					store.find('Ledger', who).then(function(rec){

						rec.set('spent',parseFloat(rec.get('spent')) + amount);
						rec.set('debit',parseFloat(rec.get('debit')) + parseFloat(((count/(count+1))*amount)).toFixed(2));
						if(parseFloat(rec.get('debit'))>parseFloat(rec.get('credit')))
							{
							rec.set('owed',(parseFloat(rec.get('debit'))-parseFloat(rec.get('credit'))).toFixed(2));
							rec.set('owes',0);
							}
						else
							{
							rec.set('owes',(parseFloat(rec.get('credit'))-parseFloat(rec.get('debit'))).toFixed(2));
							rec.set('owed',0);
							}
						rec.save();
					});
				}
				else{
					
					console.log(((count/(count+1))*amount).toFixed(2));
					store.createRecord('Ledger',{
						id: who,
						name: who,
						spent: amount,
						credit: 0,
						debit: ((count/(count+1))*amount).toFixed(2),
						owed: ((count/(count+1))*amount).toFixed(2)

					});
				}
				Ember.String.w(newExpense.get('whom')).forEach(function(key){

					
					if(store.getById('Ledger',key)!=null)
					{
						console.log("found");
							store.find('Ledger', key).then(function(rec){
								
								rec.set('credit',parseFloat(rec.get('credit')) + parseFloat((amount/(count+1)).toFixed(2)));
								if(parseFloat(rec.get('debit'))>parseFloat(rec.get('credit')))
									{
									rec.set('owed',(parseFloat(rec.get('debit'))-parseFloat(rec.get('credit'))).toFixed(2));
									rec.set('owes',0);
									}
								else
									{
									rec.set('owes',(parseFloat(rec.get('credit'))-parseFloat(rec.get('debit'))).toFixed(2));
									rec.set('owed',0);
									}
								rec.save();
							});
					}
				else{
					
					
					store.createRecord('Ledger',{
						id: key,
						name: key,
						spent:0,
						credit: (amount/(count+1)).toFixed(2),
						debit: 0,
						owes:(amount/(count+1)).toFixed(2)
						
					});
			    }
				});

				this.transitionTo('expenseDetails',newExpense);
			}
		}
});

App.ExpenseDetailsController = Ember.ObjectController.extend({
	isEditing: false,

	editExp: function() {
		this.set('isEditing', true);
	},

    
	doneEditingExp: function() {
		this.set('isEditing', false);
		this.get('store').commit();
	}
});

App.Ledger = DS.Model.extend({
	name: DS.attr( 'string' ),
	spent: DS.attr('number'),
	credit: DS.attr( 'number'),
	debit: DS.attr('number'),
	owes: DS.attr('number'),
	owed: DS.attr('number')
});

App.Ledger.FIXTURES =[];

App.LedgerRoute = Ember.Route.extend({

	model : function()
	{
		return this.get('store').find('Ledger');
	}
});

App.LedgerController = Ember.ObjectController.extend({

	ledgerCount: function(){
		return this.get('model.length');
	}.property('@each')
	
	
});

Ember.Handlebars.registerBoundHelper('format-date', function(date) {

	return moment(date).format('YYYY-MM-DD');
});

