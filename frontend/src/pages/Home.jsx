import {
 Typography,
 Grid,
 Card,
 CardContent,
 CardActionArea,
 Box
} from "@mui/material";

import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import SecurityIcon from "@mui/icons-material/Security";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import RequestQuoteIcon from "@mui/icons-material/RequestQuote";

function Home() {

 const resources = [
  {
   title: "Account Services",
   description: "Manage checking, savings, and account settings.",
   icon: <AccountBalanceIcon sx={{ fontSize: 50 }} />
  },
  {
   title: "Loans & Financing",
   description: "Explore personal, auto, and home loan options.",
   icon: <RequestQuoteIcon sx={{ fontSize: 50 }} />
  },

  {
   title: "Financial Planning",
   description: "Investment and financial growth tools.",
   icon: <TrendingUpIcon sx={{ fontSize: 50 }} />
  },
  {
   title: "Fraud Protection",
   description: "Security alerts and fraud prevention services.",
   icon: <SecurityIcon sx={{ fontSize: 50 }} />
  },
  {
   title: "Customer Support",
   description: "Contact Commerce Bank support services.",
   icon: <SupportAgentIcon sx={{ fontSize: 50 }} />
  }
 ];

 return (

  <Box>

   {/* HERO HEADER */}

   <Box
    sx={{
     textAlign: "center",
     mb: 6,
     p: 4,
     borderRadius: 3,
     background: "linear-gradient(135deg, #14684D 0%, #2E7D32 100%)",
     color: "white",
     boxShadow: "0 10px 25px rgba(0,0,0,0.15)"
    }}
   >

   <Typography
 variant="h3"
 fontWeight="bold"
 sx={{ mb: 2 }}
>
 AssetAtlas Financial Insights
</Typography>

<Typography
 variant="h6"
 sx={{ opacity: 0.9 }}
>
 Monitor all your financial accounts in one place — including
 bank accounts, investments, and debts — and gain insights
 into your overall financial health.
</Typography>

   </Box>

   {/* SERVICES GRID */}

   <Grid
    container
    spacing={4}
    justifyContent="center"
   >

    {resources.map((resource, index) => (

     <Grid
      item
      xs={12}
      sm={6}
      md={4}
      key={index}
     >

      <Card
       elevation={4}
       sx={{
        height: "100%",
        textAlign: "center",
        borderRadius: 3,
        transition: "all 0.25s ease",
        "&:hover": {
         transform: "translateY(-8px)",
         boxShadow: "0 12px 28px rgba(0,0,0,0.2)"
        }
       }}
      >

       <CardActionArea sx={{ height: "100%" }}>

        <CardContent sx={{ p: 4 }}>

         <Box
          sx={{
           mb: 2,
           color: "#14684D"
          }}
         >
          {resource.icon}
         </Box>

         <Typography
          variant="h6"
          fontWeight="bold"
          sx={{ mb: 1 }}
         >
          {resource.title}
         </Typography>

         <Typography
          variant="body2"
          color="text.secondary"
         >
          {resource.description}
         </Typography>

        </CardContent>

       </CardActionArea>

      </Card>

     </Grid>

    ))}

   </Grid>

  </Box>

 );

}

export default Home;