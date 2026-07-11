package com.atharva.workflow.exception;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(WorkflowValidationException.class)
    public ResponseEntity<String> handleWorkflowValidationException(WorkflowValidationException exception) {
        return ResponseEntity.badRequest().body(exception.getMessage());
    }

    @ExceptionHandler(WorkflowExecutionException.class)
    public ResponseEntity<String> handleWorkflowExecutionException(WorkflowExecutionException exception){
        return ResponseEntity.badRequest().body(exception.getMessage());
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
