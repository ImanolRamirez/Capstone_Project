import {
 Box,
 Typography,
 TextField,
 Button,
 MenuItem
} from "@mui/material";

import { useState } from "react";
import { useNavigate } from "react-router-dom";

import assetAtlasLogo from "../assets/AssetAtlas.png"
import { registerUser } from "../services/authService";

const countries = [
 "United States","Canada","Mexico","United Kingdom",
 "Germany","France","Spain","Italy","Brazil",
 "India","China","Japan","South Korea","Australia","South Africa"
];

function Register(){

 const navigate = useNavigate();

 const [formData,setFormData] = useState({
  firstName:"",
  lastName:"",
  email:"",
  password:"",
  confirmPassword:"",
  securityQuestion:"",
  securityAnswer:"",
  street1:"",
  street2:"",
  city:"",
  county:"",
  zip:"",
  country:"United States"
 });

 const securityQuestions=[
  "What city were you born in?",
  "What is the name of your favorite pet?",
  "Who is your favorite artist?",
  "What is the name of your best friend?"
 ];

 const handleChange=(e)=>{
  setFormData({
   ...formData,
   [e.target.name]:e.target.value
  });
 };

 const handleRegister = async (e) => {
  e.preventDefault();

  if (formData.password !== formData.confirmPassword) {
    alert("Passwords do not match");
    return;
  }

  try {
    await registerUser(formData);
    navigate("/login");
  } catch (err) {
    alert("Registration failed");
  }
};

 return(

<Box
 sx={{
  minHeight:"100vh",
  display:"flex",
  justifyContent:"center",
  alignItems:"center",
  background:"#F4F7F5",
  padding:4
 }}
>

<Box
 sx={{
  width:500,
  p:5,
  borderRadius:4,
  background:"#FFFFFF",
  border:"1px solid #E0E0E0",
  boxShadow:"0 12px 30px rgba(0,0,0,0.15)"
 }}
>

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

<Typography
 variant="h4"
 mb={3}
 fontWeight="bold"
 textAlign="center"
>
 Create Your AssetAtlas Account
</Typography>

<form onSubmit={handleRegister}>

<TextField
 name="firstName"
 label="First Name"
 fullWidth
 margin="normal"
 value={formData.firstName}
 onChange={handleChange}
/>

<TextField
 name="lastName"
 label="Last Name"
 fullWidth
 margin="normal"
 value={formData.lastName}
 onChange={handleChange}
/>

<TextField
 name="email"
 label="Email"
 fullWidth
 margin="normal"
 value={formData.email}
 onChange={handleChange}
/>

<TextField
 name="password"
 label="Password"
 type="password"
 fullWidth
 margin="normal"
 value={formData.password}
 onChange={handleChange}
/>

<TextField
 name="confirmPassword"
 label="Confirm Password"
 type="password"
 fullWidth
 margin="normal"
 value={formData.confirmPassword}
 onChange={handleChange}
/>

<TextField
 select
 name="securityQuestion"
 label="Security Question"
 fullWidth
 margin="normal"
 value={formData.securityQuestion}
 onChange={handleChange}
>
{securityQuestions.map((q)=>(
<MenuItem key={q} value={q}>{q}</MenuItem>
))}
</TextField>

<TextField
 name="securityAnswer"
 label="Security Answer"
 fullWidth
 margin="normal"
 value={formData.securityAnswer}
 onChange={handleChange}
/>

<Button
 type="submit"
 variant="contained"
 fullWidth
 sx={{mt:3}}
>
Create Account
</Button>

</form>

</Box>

</Box>

 )
}

export default Register