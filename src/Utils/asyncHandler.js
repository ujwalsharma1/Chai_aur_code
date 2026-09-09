// we can write it in promise as well as async await
// this is a wrapper function , made to avoid writing try catch block in every controller function
//async await version
const asyncHandler = (fn) => async (req,res,next) => {

    try{
        await fn(req,res,next);
    }catch(error){
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Internal Server Error"
        })
    }


}

/* promise version
    const asyncHandler = (function) => {
        (req,res,next) => {
            Promise.resolve(function(req,res,next)).catch((error) => next(error))
    }
    }
*/



export default asyncHandler;