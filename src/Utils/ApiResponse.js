// custom response class to send response in a standard format

class ApiResponse {
    constructor(statusCode, message="Success", data) {
        this.statusCode = statusCode;
        this.message = message;
        this.data = data;
        this.success = statusCode < 400;
    }
}

export default ApiResponse;