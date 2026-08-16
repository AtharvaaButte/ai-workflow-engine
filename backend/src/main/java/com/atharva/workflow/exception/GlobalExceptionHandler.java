package com.atharva.workflow.exception;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.security.SignatureException;
import jakarta.servlet.http.HttpServletRequest;
import org.postgresql.util.PSQLException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {

    // 1. WORKFLOW & ENGINE DOMAIN EXCEPTIONS

    @ExceptionHandler(WorkflowValidationException.class)
    public ResponseEntity<Map<String, Object>> handleWorkflowValidationException(WorkflowValidationException exception, HttpServletRequest request) {
        return buildResponse(HttpStatus.BAD_REQUEST, exception.getMessage(), request.getRequestURI(), null);
    }

    @ExceptionHandler(WorkflowExecutionException.class)
    public ResponseEntity<Map<String, Object>> handleWorkflowExecutionException(WorkflowExecutionException exception, HttpServletRequest request) {
        String message = exception.getMessage();
        Throwable rootCause = exception.getCause();
        if (rootCause != null && rootCause.getMessage() != null && !rootCause.getMessage().isBlank()) {
            message = rootCause.getMessage();
        }
        return buildResponse(HttpStatus.INTERNAL_SERVER_ERROR, message, request.getRequestURI(), null);
    }

    @ExceptionHandler(NodeHandlerNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleNodeHandlerNotFoundException(NodeHandlerNotFoundException exception, HttpServletRequest request) {
        return buildResponse(HttpStatus.BAD_REQUEST, exception.getMessage(), request.getRequestURI(), null);
    }

    @ExceptionHandler(NodeExecutionException.class)
    public ResponseEntity<Map<String, Object>> handleNodeExecutionException(NodeExecutionException exception, HttpServletRequest request) {
        return buildResponse(HttpStatus.BAD_REQUEST, exception.getMessage(), request.getRequestURI(), null);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgumentException(IllegalArgumentException exception, HttpServletRequest request) {
        return buildResponse(HttpStatus.BAD_REQUEST, exception.getMessage(), request.getRequestURI(), null);
    }

    // 2. DATABASE & CONSTRAINT VIOLATIONS

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, Object>> handleDataIntegrityViolationException(DataIntegrityViolationException ex, HttpServletRequest request) {
        String detailMessage = "Database constraint violation";
        if (ex.getCause() instanceof org.hibernate.exception.ConstraintViolationException cve && cve.getSQLException() != null) {
            detailMessage = cve.getSQLException().getMessage();
        } else if (ex.getMostSpecificCause() != null) {
            detailMessage = ex.getMostSpecificCause().getMessage();
        }
        return buildResponse(HttpStatus.CONFLICT, detailMessage, request.getRequestURI(), null);
    }

    @ExceptionHandler(PSQLException.class)
    public ResponseEntity<Map<String, Object>> handlePSQLException(PSQLException ex, HttpServletRequest request) {
        return buildResponse(HttpStatus.BAD_REQUEST, "Database operation failed: " + ex.getMessage(), request.getRequestURI(), null);
    }

    // 3. JWT & SECURITY EXCEPTIONS

    @ExceptionHandler(SignatureException.class)
    public ResponseEntity<Map<String, Object>> handleJwtSignatureException(SignatureException ex, HttpServletRequest request) {
        return buildResponse(HttpStatus.UNAUTHORIZED, "Invalid JWT signature: token was signed by another key or modified.", request.getRequestURI(), null);
    }

    @ExceptionHandler(ExpiredJwtException.class)
    public ResponseEntity<Map<String, Object>> handleExpiredJwtException(ExpiredJwtException ex, HttpServletRequest request) {
        return buildResponse(HttpStatus.UNAUTHORIZED, "JWT token has expired. Please refresh your token.", request.getRequestURI(), null);
    }

    @ExceptionHandler(MalformedJwtException.class)
    public ResponseEntity<Map<String, Object>> handleMalformedJwtException(MalformedJwtException ex, HttpServletRequest request) {
        return buildResponse(HttpStatus.UNAUTHORIZED, "Malformed JWT token structure.", request.getRequestURI(), null);
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<Map<String, Object>> handleBadCredentialsException(BadCredentialsException ex, HttpServletRequest request) {
        return buildResponse(HttpStatus.UNAUTHORIZED, "Invalid email or password.", request.getRequestURI(), null);
    }

    @ExceptionHandler(UsernameNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleUsernameNotFoundException(UsernameNotFoundException ex, HttpServletRequest request) {
        return buildResponse(HttpStatus.NOT_FOUND, ex.getMessage(), request.getRequestURI(), null);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, Object>> handleAccessDeniedException(AccessDeniedException ex, HttpServletRequest request) {
        return buildResponse(HttpStatus.FORBIDDEN, "Access denied: you do not have permission to perform this action.", request.getRequestURI(), null);
    }

    // 4. DTO VALIDATION & GENERAL FALLBACKS

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationExceptions(MethodArgumentNotValidException ex, HttpServletRequest request) {
        Map<String, String> fieldErrors = new HashMap<>();

        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            fieldErrors.put(fieldName, errorMessage);
        });

        return buildResponse(HttpStatus.BAD_REQUEST, "Validation failed for request body", request.getRequestURI(), fieldErrors);
    }

    @ExceptionHandler(NullPointerException.class)
    public ResponseEntity<Map<String, Object>> handleNullPointerException(NullPointerException ex, HttpServletRequest request) {
        String details = ex.getMessage() != null ? ex.getMessage() : "Object reference not set to an instance";
        return buildResponse(HttpStatus.INTERNAL_SERVER_ERROR, "Null reference encountered: " + details, request.getRequestURI(), null);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGlobalException(Exception ex, HttpServletRequest request) {
        String details = ex.getMessage() != null ? ex.getMessage() : ex.getClass().getSimpleName();
        return buildResponse(HttpStatus.INTERNAL_SERVER_ERROR, "An unexpected internal error occurred: " + details, request.getRequestURI(), null);
    }

    // 5. HELPER METHOD: STANDARDIZED API ERROR RESPONSE BUILDER

    private ResponseEntity<Map<String, Object>> buildResponse(HttpStatus status, String message, String path, Map<String, String> errors) {
        Map<String, Object> body = new HashMap<>();
        body.put("status", status.value());
        body.put("message", message);
        body.put("timestamp", Instant.now().toString());
        body.put("path", path);

        if (errors != null && !errors.isEmpty()) {
            body.put("errors", errors);
        }

        return ResponseEntity.status(status).body(body);
    }
}