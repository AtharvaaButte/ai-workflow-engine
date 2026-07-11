package com.atharva.workflow.exception;

public class NodeHandlerNotFoundException extends RuntimeException {
    public NodeHandlerNotFoundException(String message) {
        super(message);
    }
}
