import {
 Box,
 Typography,
 Card,
 CardContent,
 Collapse
} from "@mui/material";

import { useState } from "react";
import useAccounts from "../hooks/useAccounts";

import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import SavingsIcon from "@mui/icons-material/Savings";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

function Accounts(){

 const accounts = useAccounts();
 const [open,setOpen] = useState(null);

 const toggle = (id)=>{
  setOpen(open === id ? null : id);
 };

 const getIcon = (type) => {
  if(type === "Checking") return <AccountBalanceIcon sx={{fontSize:42,color:"#14684D"}}/>
  if(type === "Savings") return <SavingsIcon sx={{fontSize:42,color:"#14684D"}}/>
  if(type === "HYSA") return <TrendingUpIcon sx={{fontSize:42,color:"#14684D"}}/>
  return null
 }

 return(

  <Box sx={{ width:"100%" }}>

   <Typography
    variant="h2"
    fontWeight="bold"
    sx={{ mb:4 }}
   >
    Your Accounts
   </Typography>

   <Box
    sx={{
     display:"grid",
     gridTemplateColumns:"repeat(auto-fit,minmax(320px,1fr))",
     gap:4,
     width:"100%"
    }}
   >

    {accounts.map((account)=>(

     <Card
      key={account.id}
      onClick={()=>toggle(account.id)}
      sx={{
       width:"100%",
       minHeight:300,
       borderRadius:5,
       cursor:"pointer",
       transition:"0.25s",
       "&:hover":{
        transform:"translateY(-6px)",
        boxShadow:"0 14px 30px rgba(0,0,0,0.2)"
       }
      }}
     >

      <CardContent>

       <Box
        sx={{
         display:"flex",
         justifyContent:"space-between",
         alignItems:"center",
         mb:2
        }}
       >

        <Typography variant="h6" fontWeight="bold">
         {account.type}
        </Typography>

        {getIcon(account.type)}

       </Box>

       <Typography
        variant="h2"
        fontWeight="bold"
        sx={{ mb:1 }}
       >
        ${account.balance?.toLocaleString()}
       </Typography>

       {account.apy && (
        <Typography sx={{ color:"#14684D", fontWeight:"bold" }}>
         {account.apy}% APY
        </Typography>
       )}

       <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mb:2 }}
       >
        {account.description}
       </Typography>

       <Collapse in={open === account.id}>

        <Box sx={{ mt:2 }}>

         <Typography fontWeight="bold" sx={{ mb:1 }}>
          Account Insights
         </Typography>

         {account.insights?.map((i,index)=>(
          <Typography key={index} variant="body2">
           • {i}
          </Typography>
         ))}

        </Box>

       </Collapse>

      </CardContent>

     </Card>

    ))}

   </Box>

  </Box>

 );

}

export default Accounts;