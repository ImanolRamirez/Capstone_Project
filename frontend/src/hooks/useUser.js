import { useState,useEffect } from "react"
import { getUser } from "../services/authService"

export default function useUser(){

  const [user,setUser] = useState(null)

  useEffect(()=>{
    const current = getUser()
    setUser(current)
  },[])

  return user
}