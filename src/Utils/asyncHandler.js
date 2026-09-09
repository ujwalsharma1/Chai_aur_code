// we can write it in promise as well as async await

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