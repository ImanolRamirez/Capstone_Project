import {
 Box,
 Typography,
 Card,
 CardContent,
 Grid
} from "@mui/material"

import PersonIcon from "@mui/icons-material/Person"
import LockIcon from "@mui/icons-material/Lock"
import NotificationsIcon from "@mui/icons-material/Notifications"
import LanguageIcon from "@mui/icons-material/Language"

import useUser from "../hooks/useUser"

function Profile(){

const user = useUser()

if(!user){
 return <Typography>Loading...</Typography>
}

const sections = [

 {
  title:"Personal Details",
  description:"Manage your name, email, and personal information.",
  icon:<PersonIcon sx={{fontSize:40,color:"#14684D"}}/>
 },

 {
  title:"Log in Preferences",
  description:"Update password, security questions, and sign-in settings.",
  icon:<LockIcon sx={{fontSize:40,color:"#14684D"}}/>
 },

 {
  title:"Alerts and Notifications",
  description:"Control account alerts and activity notifications.",
  icon:<NotificationsIcon sx={{fontSize:40,color:"#14684D"}}/>
 },

 {
  title:"Language",
  description:"Choose your preferred language for the application.",
  icon:<LanguageIcon sx={{fontSize:40,color:"#14684D"}}/>
 }

]

return(

<Box sx={{height:"100%", width:"100%"}}>

<Typography
 variant="h4"
 fontWeight="bold"
 sx={{mb:4}}
>
 Profile Settings
</Typography>

<Grid
 container
 spacing={4}
 sx={{
  width:"100%",
  height:"calc(100vh - 200px)"
 }}
>

{sections.map((section,index)=>(

<Grid
 item
 xs={12}
 md={6}
 key={index}
 sx={{display:"flex"}}
>

<Card
 sx={{
  flexGrow:1,
  borderRadius:4,
  cursor:"pointer",
  display:"flex",
  alignItems:"center",
  transition:"0.25s",
  "&:hover":{
   transform:"translateY(-6px)",
   boxShadow:"0 14px 30px rgba(0,0,0,0.2)"
  }
 }}
>

<CardContent>

<Box sx={{display:"flex",alignItems:"center",gap:2,mb:2}}>
{section.icon}

<Typography variant="h5" fontWeight="bold">
{section.title}
</Typography>

</Box>

<Typography color="text.secondary">
{section.description}
</Typography>

</CardContent>

</Card>

</Grid>

))}

</Grid>

</Box>

)
}

export default Profile