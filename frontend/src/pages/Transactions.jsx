import {
 Box,
 Typography,
 Card,
 CardContent,
 Table,
 TableBody,
 TableCell,
 TableHead,
 TableRow,
 TextField,
 MenuItem
} from "@mui/material";

import { useState } from "react";
import useTransactions from "../hooks/useTransactions";

function Transactions(){

 const transactions = useTransactions();

 const [search,setSearch] = useState("");
 const [category,setCategory] = useState("");

 const filteredTransactions = transactions.filter(t => {

  const matchesSearch =
   t.description.toLowerCase().includes(search.toLowerCase());

  const matchesCategory =
   category === "" || t.category === category;

  return matchesSearch && matchesCategory;

 });

 return(

  <Box>

   <Typography
    variant="h4"
    fontWeight="bold"
    sx={{ mb:3 }}
   >
    Transaction History
   </Typography>

   <Box sx={{ display:"flex", gap:2, mb:3 }}>

    <TextField
     label="Search"
     value={search}
     onChange={(e)=>setSearch(e.target.value)}
     fullWidth
    />

    <TextField
     select
     label="Category"
     value={category}
     onChange={(e)=>setCategory(e.target.value)}
     sx={{ width:200 }}
    >

     <MenuItem value="">All</MenuItem>
     <MenuItem value="Income">Income</MenuItem>
     <MenuItem value="Food">Food</MenuItem>
     <MenuItem value="Shopping">Shopping</MenuItem>
     <MenuItem value="Utilities">Utilities</MenuItem>
     <MenuItem value="Transportation">Transportation</MenuItem>
     <MenuItem value="Bills">Bills</MenuItem>
     <MenuItem value="Subscriptions">Subscriptions</MenuItem>
     <MenuItem value="Membership">Membership</MenuItem>

    </TextField>

   </Box>

   <Card sx={{ borderRadius:4 }}>

    <CardContent>

     <Table>

      <TableHead>

       <TableRow>

        <TableCell><b>Date</b></TableCell>
        <TableCell><b>Description</b></TableCell>
        <TableCell><b>Category</b></TableCell>
        <TableCell align="right"><b>Amount</b></TableCell>

       </TableRow>

      </TableHead>

      <TableBody>

       {filteredTransactions.map((t)=>(

        <TableRow key={t.id} hover>

         <TableCell>{t.date}</TableCell>
         <TableCell>{t.description}</TableCell>
         <TableCell>{t.category}</TableCell>

         <TableCell
          align="right"
          sx={{
           fontWeight:"bold",
           color: t.amount > 0 ? "green" : "red"
          }}
         >

          {t.amount > 0
           ? `+$${t.amount}`
           : `-$${Math.abs(t.amount)}`}

         </TableCell>

        </TableRow>

       ))}

      </TableBody>

     </Table>

    </CardContent>

   </Card>

  </Box>

 );

}

export default Transactions;