import { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
Box,
Typography,
TextField,
Button,
Card,
CardContent,
Divider
} from "@mui/material"

import assetAtlasLogo from "../assets/AssetAtlas.png"
import { loginUser } from "../services/authService"

function Login() {

const navigate = useNavigate()

const [email,setEmail] = useState("")
const [password,setPassword] = useState("")

const handleLogin = async () => {

  if (!email || !password) {
    alert("Please enter email and password");
    return;
  }

  try {
    const response = await loginUser(email, password);

    localStorage.setItem("token", response.access_token);
    localStorage.setItem("user", JSON.stringify(response.user || { email }));

    navigate("/dashboard");

  } catch (err) {
    alert("Invalid email or password");
  }
};

return(

<Box
 sx={{
  minHeight:"100vh",
  display:"flex",
  justifyContent:"center",
  alignItems:"center",
  background:"#F4F7F5"
 }}
>

<Card
 sx={{
  width:420,
  borderRadius:4,
  background:"#FFFFFF",
  border:"1px solid #E0E0E0",
  boxShadow:"0 12px 30px rgba(0,0,0,0.15)"
 }}
>

<CardContent sx={{p:5}}>

<Box
 component="img"
 src={assetAtlasLogo}
 alt="AssetAtlas"
 onClick={()=>navigate("/")}
 sx={{
  width:180,
  display:"block",
  margin:"0 auto 20px auto",
  cursor:"pointer"
 }}
/>

<Typography variant="h5" align="center" sx={{mb:3}}>
 AssetAtlas Login
</Typography>

<TextField
 label="Email"
 fullWidth
 margin="normal"
 value={email}
 onChange={(e)=>setEmail(e.target.value)}
/>

<TextField
 label="Password"
 type="password"
 fullWidth
 margin="normal"
 value={password}
 onChange={(e)=>setPassword(e.target.value)}
/>

<Button
 variant="contained"
 fullWidth
 sx={{
  mt:3,
  backgroundColor:"#14684D",
  "&:hover":{backgroundColor:"#0f4f3a"}
 }}
 onClick={handleLogin}
>
 Login
</Button>

<Divider sx={{ my: 2 }} />

<Typography
 variant="body2"
 align="center"
 sx={{ color:"#14684D", cursor:"pointer", "&:hover":{ textDecoration:"underline" } }}
 onClick={() => navigate("/forgot-password")}
>
 Forgot Password?
</Typography>

</CardContent>
</Card>

</Box>

)
}

export default Login