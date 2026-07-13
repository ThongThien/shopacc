package com.shopacc.backend.exception;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;

@RestControllerAdvice
public class GlobalExceptionHandler {

        @ExceptionHandler(MethodArgumentNotValidException.class)
        public ResponseEntity<ApiErrorResponse> handleValidation(
                        MethodArgumentNotValidException ex,
                        HttpServletRequest request) {

                String message = ex.getBindingResult()
                                .getFieldErrors()
                                .stream()
                                .findFirst()
                                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                                .orElse("Dữ liệu không hợp lệ");

                return buildError(
                                HttpStatus.BAD_REQUEST,
                                message,
                                request);
        }

        @ExceptionHandler(ResponseStatusException.class)
        public ResponseEntity<ApiErrorResponse> handleResponseStatus(
                        ResponseStatusException ex,
                        HttpServletRequest request) {

                HttpStatus status = HttpStatus.valueOf(
                                ex.getStatusCode().value());

                return buildError(
                                status,
                                ex.getReason(),
                                request);
        }

        @ExceptionHandler(HttpMessageNotReadableException.class)
        public ResponseEntity<ApiErrorResponse> handleInvalidJson(
                        HttpMessageNotReadableException ex,
                        HttpServletRequest request) {

                return buildError(
                                HttpStatus.BAD_REQUEST,
                                "Invalid JSON request body",
                                request);
        }

        @ExceptionHandler(AccessDeniedException.class)
        public ResponseEntity<ApiErrorResponse> handleAccessDenied(
                        AccessDeniedException ex,
                        HttpServletRequest request) {

                return buildError(
                                HttpStatus.FORBIDDEN,
                                "Access denied",
                                request);
        }

        @ExceptionHandler(DataIntegrityViolationException.class)
        public ResponseEntity<ApiErrorResponse> handleDuplicate(
                        DataIntegrityViolationException ex,
                        HttpServletRequest request) {
                String msg = ex.getMessage() != null && ex.getMessage().contains("duplicate")
                                ? "Dữ liệu đã tồn tại, vui lòng kiểm tra lại."
                                : "Lỗi dữ liệu, vui lòng thử lại.";
                return buildError(HttpStatus.CONFLICT, msg, request);
        }

        @ExceptionHandler(RuntimeException.class)
        public ResponseEntity<ApiErrorResponse> handleRuntime(
                        RuntimeException ex,
                        HttpServletRequest request) {

                return buildError(
                                HttpStatus.INTERNAL_SERVER_ERROR,
                                "Lỗi hệ thống, vui lòng thử lại sau.",
                                request);
        }

        @ExceptionHandler(Exception.class)
        public ResponseEntity<ApiErrorResponse> handleException(
                        Exception ex,
                        HttpServletRequest request) {

                return buildError(
                                HttpStatus.INTERNAL_SERVER_ERROR,
                                "Lỗi hệ thống, vui lòng thử lại sau.",
                                request);
        }

        private ResponseEntity<ApiErrorResponse> buildError(
                        HttpStatus status,
                        String message,
                        HttpServletRequest request) {

                ApiErrorResponse response = ApiErrorResponse.builder()
                                .status(status.value())
                                .message(message)
                                .path(request.getRequestURI())
                                .timestamp(LocalDateTime.now())
                                .build();

                return ResponseEntity
                                .status(status)
                                .body(response);
        }
}