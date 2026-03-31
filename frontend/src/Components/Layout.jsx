import { Box, Button } from "@mui/material";
import { Outlet, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import assetAtlasLogo from "../assets/AssetAtlas.png";

function Layout() {

 const navigate = useNavigate();

 return (

  <Box>

   <Navbar />

   <Box sx={{ display: "flex" }}>

    {/* LEFT NAVIGATION */}

    <Box
     sx={{
      width: 240,
      minHeight: "100vh",
      borderRight: "1px solid #E0E0E0",
      display: "flex",
      flexDirection: "column",
      p: 2
     }}
    >

     {/* LOGO */}

     <Box
      sx={{
       display: "flex",
       justifyContent: "center",
       mb: 4
      }}
     >
      <Box
       component="img"
       src={assetAtlasLogo}
       alt="AssetAtlas"
       sx={{
        width: 160,
        height: "auto"
       }}
      />
     </Box>

     {/* NAV BUTTONS */}

     <Button onClick={() => navigate("/home")} sx={{ justifyContent: "flex-start", mb: 1 }}>
      Home
     </Button>

     <Button onClick={() => navigate("/dashboard")} sx={{ justifyContent: "flex-start", mb: 1 }}>
      Dashboard
     </Button>

     <Button onClick={() => navigate("/accounts")} sx={{ justifyContent: "flex-start", mb: 1 }}>
      Accounts
     </Button>

     <Button onClick={() => navigate("/transactions")} sx={{ justifyContent: "flex-start", mb: 1 }}>
      Transactions
     </Button>

     <Button onClick={() => navigate("/debts")} sx={{ justifyContent: "flex-start", mb: 1 }}>
      Debts
     </Button>

     <Button onClick={() => navigate("/transfer")} sx={{ justifyContent: "flex-start", mb: 1 }}>
      Transfer
     </Button>

    </Box>


    {/* PAGE CONTENT */}

    <Box
     sx={{
      flexGrow: 1,
      p: 4
     }}
    >
     <Outlet />
    </Box>

   </Box>

  </Box>

 );

}

export default Layout;