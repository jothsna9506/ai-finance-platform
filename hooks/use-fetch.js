//written using use keywords ,these are normal functions with extra react facilities
const {useState} = require("react");
const useFetch = (cb) => {
    const [data,setData] = useState(undefined);
    const [loading,setLoading] = useState(null);
    const [error,setError] = useState(null);


    //we call this function at the end to trigger an api
    const fn=async(...args)=>{
        setLoading(true);
        setError(null);

        try{
            const response = await cb(...args);
            setData(response);
            setError(null);
        }catch(err){
            setError(err);
            toast.error(error.message);
        }finally{
            setLoading(false);
        }

    }

    return {data,loading,error,fn ,setData};
};
export default useFetch;