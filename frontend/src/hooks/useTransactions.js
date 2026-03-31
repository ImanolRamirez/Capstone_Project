import { useEffect, useState } from "react";
import { getTransactions } from "../services/transactionService";

export default function useTransactions(){

 const [transactions, setTransactions] = useState([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState(null);

 useEffect(()=>{
  getTransactions()
   .then(setTransactions)
   .catch((err) => setError(err.message))
   .finally(() => setLoading(false));
 },[]);

 return { transactions, loading, error };

}
