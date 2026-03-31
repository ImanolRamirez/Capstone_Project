import {
 Box,
 Typography,
 Table,
 TableHead,
 TableRow,
 TableCell,
 TableBody,
 Paper
} from "@mui/material";

import {
 PieChart,
 Pie,
 Cell,
 Tooltip,
 ResponsiveContainer
} from "recharts";

import useDebts from "../hooks/useDebts";

function Debts(){

 const debts = useDebts();

 const totalDebt = debts.reduce(
  (sum,d)=>sum+(d.balance || 0),0
 );

 const chartData = debts.map(d=>({
  name:d.type,
  value:d.balance
 }));

 const colors = [
  "#14684D",
  "#FF9800",
  "#D32F2F",
  "#1976D2",
  "#9C27B0"
 ];

 return(

  <Box>

   <Typography
    variant="h4"
    fontWeight="bold"
    sx={{ mb:3 }}
   >
    Debt Overview
   </Typography>

   <Typography
    variant="h3"
    fontWeight="bold"
    sx={{ mb:6 }}
   >
    Total Debt: ${totalDebt.toLocaleString()}
   </Typography>

   {/* CHART + SUMMARY */}

   <Box
    sx={{
     display:"flex",
     justifyContent:"space-between",
     alignItems:"flex-start",
     gap:6,
     mb:7
    }}
   >

    {/* LEFT SIDE PIE CHART */}

    <Box sx={{ flex:1 }}>

     <Typography
      variant="h6"
      fontWeight="bold"
      sx={{ mb:2 }}
     >
      Debt Distribution
     </Typography>

     <ResponsiveContainer width="100%" height={400}>

      <PieChart>

       <Pie
        data={chartData}
        dataKey="value"
        nameKey="name"
        outerRadius={160}
       >

        {chartData.map((entry,index)=>(
         <Cell
          key={index}
          fill={colors[index % colors.length]}
         />
        ))}

       </Pie>

       <Tooltip/>

      </PieChart>

     </ResponsiveContainer>

    </Box>

    {/* RIGHT SIDE SUMMARY */}

    <Box
     sx={{
      flex:1,
      display:"flex",
      flexDirection:"column",
      gap:3
     }}
    >

     <Typography
      variant="h6"
      fontWeight="bold"
      sx={{ mb:1 }}
     >
      Debt Summary
     </Typography>

     {debts.map((d)=>(
      
      <Box
       key={d.id}
       sx={{
        p:3,
        borderRadius:3,
        background:"#f7f7f7"
       }}
      >

       <Typography
        variant="h6"
        fontWeight="bold"
       >
        {d.type}
       </Typography>

       <Typography>
        Balance: ${d.balance.toLocaleString()}
       </Typography>

       <Typography>
        APR: {d.apr}%
       </Typography>

       <Typography>
        Payments Remaining: {d.paymentsRemaining}
       </Typography>

       <Typography>
        Lender: {d.lender}
       </Typography>

      </Box>

     ))}

    </Box>

   </Box>

   {/* DEBT TABLE */}

   <Typography
    variant="h6"
    fontWeight="bold"
    sx={{ mb:2 }}
   >
    Detailed Debt Information
   </Typography>

   <Paper sx={{ borderRadius:3 }}>

    <Table>

     <TableHead>

      <TableRow>

       <TableCell><b>Debt Type</b></TableCell>
       <TableCell><b>Lender</b></TableCell>
       <TableCell><b>Balance</b></TableCell>
       <TableCell><b>APR</b></TableCell>
       <TableCell><b>Payments Remaining</b></TableCell>

      </TableRow>

     </TableHead>

     <TableBody>

      {debts.map((d)=>(
       
       <TableRow key={d.id} hover>

        <TableCell>{d.type}</TableCell>
        <TableCell>{d.lender}</TableCell>
        <TableCell>${d.balance.toLocaleString()}</TableCell>
        <TableCell>{d.apr}%</TableCell>
        <TableCell>{d.paymentsRemaining}</TableCell>

       </TableRow>

      ))}

     </TableBody>

    </Table>

   </Paper>

  </Box>

 );

}

export default Debts;