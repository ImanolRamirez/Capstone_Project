import {
 Box,
 Typography,
 Grid,
 Card,
 CardContent,
 Dialog,
 DialogTitle,
 DialogContent,
 DialogContentText
} from "@mui/material";

import {
 PieChart,
 Pie,
 Cell,
 Tooltip,
 ResponsiveContainer
} from "recharts";

import { useNavigate } from "react-router-dom";
import { useState } from "react";

import useAccounts from "../hooks/useAccounts";
import useTransactions from "../hooks/useTransactions";
import useDebts from "../hooks/useDebts";

import { calculateNetWorth } from "../utils/calculations";

function Dashboard(){

 const navigate = useNavigate();

 const [openNetWorth,setOpenNetWorth] = useState(false);

 const accounts = useAccounts();
 const transactions = useTransactions();
 const debts = useDebts();

 const totalBalance = accounts.reduce(
  (sum,a)=>sum+(a.balance || 0),0
 );

 const totalDebt = debts.reduce(
  (sum,d)=>sum+(d.balance || 0),0
 );

 const netWorth = calculateNetWorth(accounts,debts);

 const recentTransactions = transactions.slice(0,5);

 /* ACCOUNT DISTRIBUTION */

 const accountChart = accounts.map(a=>({
  name:a.type,
  value:a.balance
 }));

 /* DEBT BREAKDOWN */

 const debtChart = debts.map(d=>({
  name:d.type,
  value:d.balance
 }));

 /* SPENDING BY CATEGORY */

 const spending = {};

 transactions.forEach(t=>{

  if(t.amount < 0){

   if(!spending[t.category]){
    spending[t.category] = 0;
   }

   spending[t.category] += Math.abs(t.amount);

  }

 });

 const spendingChart = Object.keys(spending).map(key=>({
  name:key,
  value:spending[key]
 }));

 const colors = [
  "#14684D",
  "#1976D2",
  "#FF9800",
  "#D32F2F",
  "#9C27B0",
  "#009688"
 ];

 return(

  <Box>

   <Typography
    variant="h4"
    fontWeight="bold"
    sx={{ mb:4 }}
   >
    Financial Dashboard
   </Typography>

   {/* SUMMARY CARDS */}

   <Grid container spacing={4} sx={{ mb:5 }}>

    <Grid item xs={12} md={4}>

     <Card
      sx={{
       borderRadius:4,
       cursor:"pointer",
       transition:"0.2s",
       "&:hover":{
        transform:"translateY(-3px)",
        boxShadow:"0 10px 20px rgba(0,0,0,0.15)"
       }
      }}
      onClick={()=>navigate("/accounts")}
     >

      <CardContent>

       <Typography variant="h6">
        Total Balance
       </Typography>

       <Typography variant="h3" fontWeight="bold">
        ${totalBalance.toLocaleString()}
       </Typography>

      </CardContent>

     </Card>

    </Grid>

    <Grid item xs={12} md={4}>

     <Card
      sx={{
       borderRadius:4,
       cursor:"pointer",
       transition:"0.2s",
       "&:hover":{
        transform:"translateY(-3px)",
        boxShadow:"0 10px 20px rgba(0,0,0,0.15)"
       }
      }}
      onClick={()=>navigate("/debts")}
     >

      <CardContent>

       <Typography variant="h6">
        Total Debt
       </Typography>

       <Typography variant="h3" fontWeight="bold">
        ${totalDebt.toLocaleString()}
       </Typography>

      </CardContent>

     </Card>

    </Grid>

    <Grid item xs={12} md={4}>

     <Card
      sx={{
       borderRadius:4,
       cursor:"pointer",
       transition:"0.2s",
       "&:hover":{
        transform:"translateY(-3px)",
        boxShadow:"0 10px 20px rgba(0,0,0,0.15)"
       }
      }}
      onClick={()=>setOpenNetWorth(true)}
     >

      <CardContent>

       <Typography variant="h6">
        Net Worth
       </Typography>

       <Typography variant="h3" fontWeight="bold">
        ${netWorth.toLocaleString()}
       </Typography>

       <Typography
        variant="body2"
        color="text.secondary"
       >
        Click for calculation details
       </Typography>

      </CardContent>

     </Card>

    </Grid>

   </Grid>

   {/* FINANCIAL INSIGHTS */}

   <Box sx={{ mt:4 }}>

    <Typography
     variant="h5"
     fontWeight="bold"
     sx={{ mb:4 }}
    >
     Financial Insights
    </Typography>

    <Box
     sx={{
      display:"flex",
      justifyContent:"space-between",
      gap:4
     }}
    >

     {/* ACCOUNT DISTRIBUTION */}

     <Box sx={{ flex:1, textAlign:"center" }}>

      <Typography variant="h6" fontWeight="bold" sx={{ mb:2 }}>
       Account Distribution
      </Typography>

      <ResponsiveContainer width="100%" height={340}>

       <PieChart>

        <Pie
         data={accountChart}
         dataKey="value"
         nameKey="name"
         outerRadius={120}
        >

         {accountChart.map((entry,index)=>(
          <Cell key={index} fill={colors[index % colors.length]} />
         ))}

        </Pie>

        <Tooltip/>

       </PieChart>

      </ResponsiveContainer>

     </Box>


     {/* DEBT BREAKDOWN */}

     <Box sx={{ flex:1, textAlign:"center" }}>

      <Typography variant="h6" fontWeight="bold" sx={{ mb:2 }}>
       Debt Breakdown
      </Typography>

      <ResponsiveContainer width="100%" height={340}>

       <PieChart>

        <Pie
         data={debtChart}
         dataKey="value"
         nameKey="name"
         outerRadius={120}
        >

         {debtChart.map((entry,index)=>(
          <Cell key={index} fill={colors[index % colors.length]} />
         ))}

        </Pie>

        <Tooltip/>

       </PieChart>

      </ResponsiveContainer>

     </Box>


     {/* SPENDING */}

     <Box sx={{ flex:1, textAlign:"center" }}>

      <Typography variant="h6" fontWeight="bold" sx={{ mb:2 }}>
       Spending by Category
      </Typography>

      <ResponsiveContainer width="100%" height={340}>

       <PieChart>

        <Pie
         data={spendingChart}
         dataKey="value"
         nameKey="name"
         outerRadius={120}
        >

         {spendingChart.map((entry,index)=>(
          <Cell key={index} fill={colors[index % colors.length]} />
         ))}

        </Pie>

        <Tooltip/>

       </PieChart>

      </ResponsiveContainer>

     </Box>

    </Box>

   </Box>

   {/* RECENT TRANSACTIONS */}

   <Card sx={{ borderRadius:4, mt:6 }}>

    <CardContent>

     <Typography variant="h6" fontWeight="bold" sx={{ mb:2 }}>
      Recent Transactions
     </Typography>

     {recentTransactions.map((t)=>(
      
      <Box
       key={t.id}
       sx={{
        display:"flex",
        justifyContent:"space-between",
        borderBottom:"1px solid #eee",
        py:1
       }}
      >

       <Box>

        <Typography fontWeight="bold">
         {t.description}
        </Typography>

        <Typography
         variant="body2"
         color="text.secondary"
        >
         {t.date} • {t.category}
        </Typography>

       </Box>

       <Typography
        fontWeight="bold"
        sx={{
         color: t.amount > 0 ? "green" : "red"
        }}
       >

        {t.amount > 0
         ? `+$${t.amount}`
         : `-$${Math.abs(t.amount)}`}

       </Typography>

      </Box>

     ))}

    </CardContent>

   </Card>

   {/* NET WORTH INFO POPUP */}

   <Dialog
    open={openNetWorth}
    onClose={()=>setOpenNetWorth(false)}
   >

    <DialogTitle>
     Net Worth Calculation
    </DialogTitle>

    <DialogContent>

     <DialogContentText>

      Net worth represents the difference between what you own and what you owe.

      <br/><br/>

      <b>Net Worth = Total Assets − Total Debt</b>

      <br/><br/>

      Total assets include balances in your checking account,
      savings account, and high-yield savings account.

      <br/><br/>

      Total debt includes balances from loans, credit cards,
      and other liabilities.

     </DialogContentText>

    </DialogContent>

   </Dialog>

  </Box>

 );

}

export default Dashboard;