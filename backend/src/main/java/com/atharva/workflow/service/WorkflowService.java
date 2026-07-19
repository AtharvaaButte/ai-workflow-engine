package com.atharva.workflow.service;

import com.atharva.workflow.dto.CreateWorkflowRequest;
import com.atharva.workflow.entity.EdgeEntity;
import com.atharva.workflow.entity.Metadata;
import com.atharva.workflow.entity.NodeEntity;
import com.atharva.workflow.entity.WorkflowEntity;
import com.atharva.workflow.model.Edge;
import com.atharva.workflow.model.Node;
import com.atharva.workflow.model.Workflow;
import com.atharva.workflow.repository.WorkflowRepository;
import com.atharva.workflow.validator.WorkflowValidator;
import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class WorkflowService {

    @Getter
    private final WorkflowValidator workflowValidator;
    private final WorkflowRepository workflowRepository;

    @Transactional
    public WorkflowEntity createWorkflow(CreateWorkflowRequest request) {
        // Construct domain model for structural business logic validation
        Workflow workflow = new Workflow(
                UUID.randomUUID(),
                request.getMetadata(),
                request.getNodes(),
                request.getEdges()
        );

        workflowValidator.validate(workflow);

        // Map domain objects to JPA database entities
        WorkflowEntity workflowEntity = new WorkflowEntity();
        workflowEntity.setId(workflow.getId());

        // Map embedding metadata fields directly from request
        if (request.getMetadata() != null) {
            Metadata metadata = new Metadata();
            metadata.setName(request.getMetadata().getName());
            metadata.setVersion(request.getMetadata().getVersion());
            metadata.setDescription(request.getMetadata().getDescription());
            workflowEntity.setMetadata(metadata);
        }

        // Process children using isolated mapper methods
        workflowEntity.setNodes(mapToNodeEntities(workflow.getNodes(), workflowEntity));
        workflowEntity.setEdges(mapToEdgeEntities(workflow.getEdges(), workflowEntity));

        return workflowRepository.save(workflowEntity);
    }

    public Optional<WorkflowEntity> getWorkflow(UUID id) {
        return workflowRepository.findById(id);
    }

    // --- Helper Mappers ---

    private List<NodeEntity> mapToNodeEntities(List<Node> domainNodes, WorkflowEntity parent) {
        if (domainNodes == null) return Collections.emptyList();

        return domainNodes.stream().map(nodeModel -> {

            NodeEntity entity = new NodeEntity();
            entity.setId(nodeModel.getId());
            entity.setType(nodeModel.getType());

            // Convert flexible runtime Objects into persistent strings for DB cells
            if (nodeModel.getConfig() != null) {
                Map<String, String> stringifiedConfig = nodeModel.getConfig().entrySet().stream()
                        .collect(Collectors.toMap(
                                Map.Entry::getKey,
                                entry -> entry.getValue() != null ? entry.getValue().toString() : ""
                        ));
                entity.setConfig(stringifiedConfig);
            }

            entity.setWorkflow(parent);
            return entity;
        }).collect(Collectors.toList());
    }

    private List<EdgeEntity> mapToEdgeEntities(List<Edge> domainEdges, WorkflowEntity parent) {
        if (domainEdges == null) return Collections.emptyList();

        return domainEdges.stream().map(edgeModel -> {

            EdgeEntity entity = new EdgeEntity();
            entity.setSource(edgeModel.getSource());
            entity.setTarget(edgeModel.getTarget());
            entity.setCondition(edgeModel.getCondition());

            entity.setWorkflow(parent);
            return entity;
        }).collect(Collectors.toList());
    }
}