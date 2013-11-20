
This app uses  ember.js version 1.1.2 and ember-data 1.0.
A couple of points:
1. Enter "For Whom" values in expenses seperated by space
2. The entry assumes payee is included in the expense.
   Eg if A pays when A,B and C are involved, no need to enter A in the whom field.



TBD
1. Validations:
   a)Expenses should only be entered for users in the group
   b)A user should not be deleted unless all accounts are settled
2. Filter records 
    Getting all the expenses that a particular user is unvolved in.
3. Provide ckeck box input for choosing users.
   Only space seperated entry is possible right now.
4. Non even split of expenses
5. Support 'All' entry in expenses.
6. Synchronizing editing of expenses with payments.
   Currently, editing expenses has no impact on payments.   
7. Support a practical payment resolution method.
   The system should not recommend a particular resolution plan.
   If set X is creditors and set Y is debtors, any mapping of payments from Y to X should be possible.
   Current application only shows final total payments.
