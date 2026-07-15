package com.atharva.workflow.exception;

public class WorkflowExecutionException extends RuntimeException {
    public WorkflowExecutionException(String message) {
        super(message);
    }

    public WorkflowExecutionException(String message, Throwable e) {
        super(message,e);
    }
}
