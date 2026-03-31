import { useEffect, useState } from "react";
import { getDebts } from "../services/debtService";

export default function useDebts(){

 const [debts, setDebts] = useState([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState(null);

 useEffect(()=>{
  getDebts()
   .then(setDebts)
   .catch((err) => setError(err.message))
   .finally(() => setLoading(false));
 },[]);

 return { debts, loading, error };

}
