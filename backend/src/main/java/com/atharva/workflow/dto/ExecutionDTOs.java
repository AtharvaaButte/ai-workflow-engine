package com.atharva.workflow.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class ExecutionDTOs {

    public record ExecutionSummaryResponse(
            UUID id,
            UUID workflowId,
            String workflowName,
            String status,
            LocalDateTime startedAt,
            LocalDateTime completedAt,
            Long durationMs
    ) {}

    public record ExecutionDetailResponse(
            UUID id,
            UUID workflowId,
            String workflowName,
            String status,
            LocalDateTime startedAt,
            LocalDateTime completedAt,
            Long durationMs,
            String errorMessage,
            List<NodeExecutionLogResponse> nodeLogs
    ) {}

    public record NodeExecutionLogResponse(
            UUID id,
            String nodeId,
            String nodeType,
            String status,
            String errorMessage,
            Long durationMs,
            LocalDateTime executedAt
    ) {}
}