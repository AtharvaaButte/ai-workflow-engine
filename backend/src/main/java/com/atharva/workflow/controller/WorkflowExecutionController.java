package com.atharva.workflow.controller;

import com.atharva.workflow.dto.ExecutionDTOs;
import com.atharva.workflow.entity.UserEntity;
import com.atharva.workflow.service.ExecutionService;
import com.atharva.workflow.service.WorkflowExecutionEngine;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class WorkflowExecutionController {

    private final WorkflowExecutionEngine executionEngine; // For running workouts
    private final ExecutionService executionService;       // For fetching logs

    @PostMapping("workflows/{id}/execute")
    public ResponseEntity<Map<String, Object>> executeWorkflow(
            @PathVariable String id,
            @RequestBody Map<String, Object> payload,
            @AuthenticationPrincipal UserEntity currentUser
    ) {

        Map<String, Object> result = executionEngine.executeWorkflowFromDb(id,payload, currentUser);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/executions")
    public ResponseEntity<List<ExecutionDTOs.ExecutionSummaryResponse>> getAllExecutions(@AuthenticationPrincipal UserEntity currentUser) {
        return ResponseEntity.ok(executionService.getAllExecutions(currentUser));
    }

    @GetMapping("/executions/{id}")
    public ResponseEntity<ExecutionDTOs.ExecutionDetailResponse> getExecutionById(@PathVariable UUID id,@AuthenticationPrincipal UserEntity currentUser) {
        return ResponseEntity.ok(executionService.getExecutionById(id,currentUser));
    }

}