package com.atharva.workflow.service;

import com.atharva.workflow.engine.WorkflowContext;
import com.atharva.workflow.engine.WorkflowEngine;
import com.atharva.workflow.entity.*;
import com.atharva.workflow.exception.WorkflowExecutionException;
import com.atharva.workflow.model.Edge;
import com.atharva.workflow.model.Metadata;
import com.atharva.workflow.model.Node;
import com.atharva.workflow.model.Workflow;
import com.atharva.workflow.repository.ExecutionRepository;
import com.atharva.workflow.repository.WorkflowRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@AllArgsConstructor
@Service
public class WorkflowExecutionEngine {
    private final WorkflowEngine workflowEngine;
    private final WorkflowRepository workflowRepository;
    private final ExecutionRepository executionRepository;

    public Map<String, Object> runWorkflow(String workflowId, Map<String, Object> inputPayload, UserEntity currentUser){
        long startTime = System.currentTimeMillis();
        System.out.println("Fetching workflow blueprint from DB: " + workflowId);

        WorkflowEntity entity = workflowRepository.findByIdAndUser(UUID.fromString(workflowId), currentUser)
                .orElseThrow(() -> new WorkflowExecutionException("Workflow not found with ID: " + workflowId));

        Workflow executionModel = new Workflow();

        executionModel.setId(entity.getId());

        executionModel.setMetadata(new Metadata
                (
                        entity.getMetadata().getName(),
                        entity.getMetadata().getVersion(),
                        entity.getMetadata().getDescription()
                )
        );

        executionModel.setNodes(mapToDomainNodes(entity.getNodes()));
        executionModel.setEdges(mapToDomainEdges(entity.getEdges()));

        // CREATE INITIAL RUNNING EXECUTION RECORD
        ExecutionEntity execution = ExecutionEntity.builder()
                .workflowId(entity.getId())
                .workflowName(entity.getMetadata().getName())
                .status(ExecutionEntity.ExecutionStatus.RUNNING)
                .startedAt(LocalDateTime.now())
                .build();

        execution = executionRepository.save(execution);

        WorkflowContext context = new WorkflowContext();
        if (inputPayload != null) {
            inputPayload.forEach(context::setVariable);
        }

        System.out.println("Launching workflow execution loop for: " + workflowId);

        try {
            workflowEngine.execute(executionModel, context);
            execution.setStatus(ExecutionEntity.ExecutionStatus.SUCCESS);
        } catch (Exception ex) {
            execution.setStatus(ExecutionEntity.ExecutionStatus.FAILED);
            execution.setErrorMessage(ex.getMessage());
            throw ex;
        } finally {
            execution.setCompletedAt(LocalDateTime.now());
            execution.setDurationMs(System.currentTimeMillis() - startTime);

            populateNodeLogsFromContext(execution, context);
            executionRepository.save(execution);

        }

        Object finalResponse = context.getVariable("FINAL_ENGINE_OUTPUT");

        if (finalResponse != null) {
            return Map.of("status", "SUCCESS", "output", finalResponse);
        }

        return Map.of("status", "SUCCESS", "message", "Workflow completed without a specific response node outcome.");
    }

    // --- Helper Mappers ---
    private List<Node> mapToDomainNodes(List<NodeEntity> nodeEntities) {
        if (nodeEntities == null) return Collections.emptyList();

        return nodeEntities.stream().map(nodeEntity -> {
            Node node = new Node();
            node.setId(nodeEntity.getId());
            node.setType(nodeEntity.getType());

            // Convert the database Map<String, String> back to a flexible Map<String, Object> for the engine
            if (nodeEntity.getConfig() != null) {
                Map<String, Object> domainConfig = nodeEntity.getConfig().entrySet().stream()
                        .collect(Collectors.toMap(
                                Map.Entry::getKey,
                                entry -> entry.getValue()
                        ));
                node.setConfig(domainConfig);
            } else {
                node.setConfig(Collections.emptyMap());
            }

            return node;
        }).collect(Collectors.toList());
    }

    private List<Edge> mapToDomainEdges(List<EdgeEntity> edgeEntities) {
        if (edgeEntities == null) return Collections.emptyList();

        return edgeEntities.stream().map(edgeEntity -> {
            Edge edge = new Edge();

            edge.setSource(edgeEntity.getSource());
            edge.setTarget(edgeEntity.getTarget());
            edge.setCondition(edgeEntity.getCondition());

            return edge;
        }).collect(Collectors.toList());
    }

    private void populateNodeLogsFromContext(ExecutionEntity execution, WorkflowContext context) {
        List<NodeExecutionLogEntity> logs = context.getExecutionLogs();
        if (logs != null && !logs.isEmpty()) {
            for (NodeExecutionLogEntity log : logs) {
                log.setExecution(execution);
                execution.getNodeLogs().add(log);
            }
        }
    }
}
