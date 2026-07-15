package com.atharva.workflow.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(WorkflowValidationException.class)
    public ResponseEntity<String> handleWorkflowValidationException(WorkflowValidationException exception) {
        return ResponseEntity.badRequest().body(exception.getMessage());
    }

    @ExceptionHandler(WorkflowExecutionException.class)
    public ResponseEntity<Map<String, Object>> handleWorkflowExecutionException(WorkflowExecutionException exception){
        Map<String, Object> response = new HashMap<>();
        response.put("error", exception.getMessage());

        Throwable rootCause = exception.getCause();
        if (rootCause != null) {
            response.put("rootCauseType", rootCause.getClass().getSimpleName());
            response.put("rootCauseMessage", rootCause.getMessage());
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

    @ExceptionHandler(NodeHandlerNotFoundException.class)
    public ResponseEntity<String> handleNodeHandlerNotFoundException(NodeHandlerNotFoundException exception) {
        return ResponseEntity.badRequest().body(exception.getMessage());
    }

    @ExceptionHandler(NodeExecutionException.class)
    public ResponseEntity<String> handleNodeExecutionException(NodeExecutionException exception){
        return ResponseEntity.badRequest().body(exception.getMessage());
    }
}
