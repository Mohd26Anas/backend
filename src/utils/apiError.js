class ApiError extends Error {
  constructor(
    statusCode,
    message = "Something went wrong",
    errors = [],
    stack = ""
  ) {
    super(message)
    this.message=message,
    this.stack=stack,
    this.errors=errors,
    this.statusCode=statusCode,
    this.data=null
    if (stack) {
        this.stack = stack
    } else{
        Error.captureStackTrace(this, this.constructor)
    }
  }
}

export {ApiError}
