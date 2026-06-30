package com.atharva.workflow.exception;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(WorkflowValidationException.class)
    public ResponseEntity<String> handleWorkflowValidationException(WorkflowValidationException ex) {
        return ResponseEntity.badRequest().body(ex.getMessage());
    }
}
