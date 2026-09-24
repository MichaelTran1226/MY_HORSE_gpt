import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { Request, Response } from "express";

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : null;

    let message = "Internal server error";
    let errorCode = "INTERNAL_ERROR";
    const databaseCode = (exception as { code?: string })?.code;
    if (databaseCode === "P2002") {
      status = 409;
      message = "This identifier or assignment already exists";
      errorCode = "CONFLICT";
    }
    if (databaseCode === "P2025") {
      status = 404;
      message = "Record not found";
      errorCode = "NOT_FOUND";
    }
    if (databaseCode === "P2003") {
      status = 400;
      message = "A referenced record does not exist";
      errorCode = "INVALID_REFERENCE";
    }

    if (typeof exceptionResponse === "string") {
      message = exceptionResponse;
    } else if (
      exceptionResponse &&
      typeof exceptionResponse === "object" &&
      "message" in exceptionResponse
    ) {
      const resMsg = (exceptionResponse as any).message;
      message = Array.isArray(resMsg) ? resMsg.join(", ") : resMsg;
      errorCode = (exceptionResponse as any).error || errorCode;
    }

    response.status(status).json({
      success: false,
      errorCode,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
