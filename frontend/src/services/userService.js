export const getUser = async () => {

 let user = JSON.parse(localStorage.getItem("user"))

 if (!user) {

  user = {
   id:1,
   firstName:"Imanol",
   lastName:"Ramirez",
   email:"imanol@email.com",
   country:"United States"
  }

  localStorage.setItem("user",JSON.stringify(user))
 }

 return user
}


export const updateUser = async (userData) => {

 localStorage.setItem("user",JSON.stringify(userData))

 return userData
}