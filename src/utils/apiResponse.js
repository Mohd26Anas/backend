class ApiResponse {
  constructor(statusCode, message = "Success", data, total = undefined) {
    (this.statusCode = statusCode),
      (this.message = message),
      (this.data = data),
      (this.success = statusCode < 400),
      (this.total = total);
  }
}

export { ApiResponse };
