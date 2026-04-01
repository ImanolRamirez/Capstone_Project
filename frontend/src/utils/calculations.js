export const calculateNetWorth = (accounts,debts)=>{

 const totalAssets = accounts.reduce(
  (sum,a)=>sum+a.balance,0
 );

 const totalDebt = debts.reduce(
  (sum,d)=>sum+d.balance,0
 );

 return totalAssets - totalDebt;

};

export const getTotalBalance = (accounts)=>{

 return accounts.reduce(
  (sum,a)=>sum+a.balance,0
 );

};

export const getSpendingByCategory = (transactions)=>{

 const categories={};

 transactions.forEach(t=>{

  if(t.amount<0){

   if(!categories[t.category]){
    categories[t.category]=0;
   }

   categories[t.category]+=Math.abs(t.amount);

  }

 });

 return categories;

};