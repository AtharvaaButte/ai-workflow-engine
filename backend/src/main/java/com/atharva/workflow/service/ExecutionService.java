package com.atharva.workflow.service;

import com.atharva.workflow.dto.ExecutionDTOs.*;
import com.atharva.workflow.entity.ExecutionEntity;
import com.atharva.workflow.entity.UserEntity;
import com.atharva.workflow.repository.ExecutionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ExecutionService {

    private final ExecutionRepository executionRepository;

    @Transactional(readOnly = true)
    public List<ExecutionSummaryResponse> getAllExecutions(UserEntity currentUser) {
        return executionRepository.findAllByUserOrderByStartedAtDesc(currentUser).stream()
                .map(e -> new ExecutionSummaryResponse(
                        e.getId(),
                        e.getWorkflowId(),
                        e.getWorkflowName(),
                        e.getStatus().name(),
                        e.getStartedAt(),
                        e.getCompletedAt(),
                        e.getDurationMs()
                ))
                .toList();
    }

    @Transactional(readOnly = true)
    public ExecutionDetailResponse getExecutionById(UUID id,UserEntity currentUser) {
        ExecutionEntity entity = executionRepository.findByIdAndUser(id,currentUser)
                .orElseThrow(() -> new RuntimeException("Execution not found: " + id));

        List<NodeExecutionLogResponse> logs = entity.getNodeLogs().stream()
                .map(l -> new NodeExecutionLogResponse(
                        l.getId(),
                        l.getNodeId(),
                        l.getNodeType(),
                        l.getStatus().name(),
                        l.getErrorMessage(),
                        l.getDurationMs(),
                        l.getExecutedAt()
                ))
                .toList();

        return new ExecutionDetailResponse(
                entity.getId(),
                entity.getWorkflowId(),
                entity.getWorkflowName(),
                entity.getStatus().name(),
                entity.getStartedAt(),
                entity.getCompletedAt(),
                entity.getDurationMs(),
                entity.getErrorMessage(),
                logs
        );
    }
}