import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Avatar
} from "@mui/material";

import PersonIcon from "@mui/icons-material/Person";
import LockIcon from "@mui/icons-material/Lock";
import NotificationsIcon from "@mui/icons-material/Notifications";
import LanguageIcon from "@mui/icons-material/Language";
import HomeIcon from "@mui/icons-material/Home";

import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getMe } from "../services/userService";

function Profile() {

  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMe()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Typography>Loading...</Typography>;
  if (!user) return <Typography>Could not load profile.</Typography>;

  const sections = [
    {
      title: "Personal Details",
      description: "Manage your name and email address.",
      icon: <PersonIcon sx={{ fontSize: 40, color: "#14684D" }} />,
      path: "/profile/personal"
    },
    {
      title: "Login Preferences",
      description: "Update your password and security question.",
      icon: <LockIcon sx={{ fontSize: 40, color: "#14684D" }} />,
      path: "/profile/login"
    },
    {
      title: "Alerts & Notifications",
      description: "Control your account alerts and notifications.",
      icon: <NotificationsIcon sx={{ fontSize: 40, color: "#14684D" }} />,
      path: "/profile/alerts"
    },
    {
      title: "Language",
      description: "Choose your preferred language.",
      icon: <LanguageIcon sx={{ fontSize: 40, color: "#14684D" }} />,
      path: "/profile/language"
    },
    {
      title: "Address",
      description: "View and update your home address.",
      icon: <HomeIcon sx={{ fontSize: 40, color: "#14684D" }} />,
      path: "/profile/address"
    }
  ];

  return (

    <Box>

      <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
        Profile Settings
      </Typography>

      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4 }}>
        <Avatar sx={{ bgcolor: "#14684D", width: 56, height: 56, fontSize: 22 }}>
          {user.firstName?.[0]}{user.lastName?.[0]}
        </Avatar>
        <Box>
          <Typography variant="h6" fontWeight="bold">
            {user.firstName} {user.lastName}
          </Typography>
          <Typography color="text.secondary">{user.email}</Typography>
        </Box>
      </Box>

      <Grid container spacing={4}>
        {sections.map((section, index) => (
          <Grid item xs={12} md={6} key={index} sx={{ display: "flex" }}>
            <Card
              onClick={() => navigate(section.path)}
              sx={{
                flexGrow: 1,
                borderRadius: 4,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                transition: "0.25s",
                "&:hover": {
                  transform: "translateY(-6px)",
                  boxShadow: "0 14px 30px rgba(0,0,0,0.2)"
                }
              }}
            >
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
                  {section.icon}
                  <Typography variant="h6" fontWeight="bold">
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

  );
}

export default Profile;
