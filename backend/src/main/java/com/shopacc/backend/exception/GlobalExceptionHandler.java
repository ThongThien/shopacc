package com.shopacc.backend.exception;

import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<?> handleResponseStatusException(
            ResponseStatusException ex
    ) {

        return ResponseEntity

                .status(ex.getStatusCode())

                .body(

                        Map.of(

                                "status",
                                ex.getStatusCode().value(),

                                "message",
                                ex.getReason()
                        )
                );
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<?> handleRuntimeException(
            RuntimeException ex
    ) {

        return ResponseEntity

                .badRequest()

                .body(

                        Map.of(

                                "status",
                                400,

                                "message",
                                ex.getMessage()
                        )
                );
    }
}