package com.atharva.workflow.service;

import com.atharva.workflow.dto.CreateWorkflowRequest;
import com.atharva.workflow.dto.UpdateWorkflowRequest;
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

    public Optional<Workflow> getWorkflow(UUID id) {
        return workflowRepository.findById(id)
                .map(this::mapToWorkflow);
    }

    @Transactional(readOnly = true)
    public List<Workflow> getWorkflows() {
        return workflowRepository.findAll()
                .stream()
                .map(this::mapToWorkflow)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public boolean deleteWorkflow(UUID id) {
        if (workflowRepository.existsById(id)){
            workflowRepository.deleteById(id);
            return true;
        }
        return false;
    }

    @Transactional
    public Optional<Workflow> updateWorkflow(UUID id, UpdateWorkflowRequest request) {
        return workflowRepository.findById(id).map(existingEntity->{
            Workflow updatedWorkflowDomain = new Workflow(
                    id,
                    request.getMetadata(),
                    request.getNodes(),
                    request.getEdges()
            );

            // 2. Validate updated structure
            workflowValidator.validate(updatedWorkflowDomain);

            // 3. Update Metadata
            if (request.getMetadata() != null) {
                com.atharva.workflow.entity.Metadata metadata = new com.atharva.workflow.entity.Metadata();
                metadata.setName(request.getMetadata().getName());
                metadata.setVersion(request.getMetadata().getVersion());
                metadata.setDescription(request.getMetadata().getDescription());
                existingEntity.setMetadata(metadata);
            }

            existingEntity.getNodes().clear();
            if (request.getNodes() != null) {
                existingEntity.getNodes().addAll(mapToNodeEntities(request.getNodes(), existingEntity));
            }

            existingEntity.getEdges().clear();
            if (request.getEdges() != null) {
                existingEntity.getEdges().addAll(mapToEdgeEntities(request.getEdges(), existingEntity));
            }

            WorkflowEntity savedEntity = workflowRepository.save(existingEntity);
            return mapToWorkflow(savedEntity);
        });

    }
    //--- Mapping Functions ---
    private Workflow mapToWorkflow(WorkflowEntity entity) {
        if (entity == null) return null;

        // Map Metadata
        com.atharva.workflow.model.Metadata domainMetadata = null;

        if (entity.getMetadata() != null) {
            domainMetadata = com.atharva.workflow.model.Metadata.builder()
                    .name(entity.getMetadata().getName())
                    .version(entity.getMetadata().getVersion())
                    .description(entity.getMetadata().getDescription())
                    .build();
        }

        // Map Nodes (NodeEntity -> Node)
        List<Node> domainNodes = Collections.emptyList();
        if (entity.getNodes() != null) {
            domainNodes = entity.getNodes().stream().map(nodeEntity -> {
                Node node = new Node();
                node.setId(nodeEntity.getId());
                node.setType(nodeEntity.getType());

                // Convert Map<String, String> back to Map<String, Object>
                if (nodeEntity.getConfig() != null) {
                    Map<String, Object> configMap = new HashMap<>(nodeEntity.getConfig());
                    node.setConfig(configMap);
                }
                return node;
            }).collect(Collectors.toList());
        }

        // Map Edges (EdgeEntity -> Edge)
        List<Edge> domainEdges = Collections.emptyList();
        if (entity.getEdges() != null) {
            domainEdges = entity.getEdges().stream().map(edgeEntity -> {
                Edge edge = new Edge();
                edge.setSource(edgeEntity.getSource());
                edge.setTarget(edgeEntity.getTarget());
                edge.setCondition(edgeEntity.getCondition());
                return edge;
            }).collect(Collectors.toList());
        }

        return new Workflow(entity.getId(), domainMetadata, domainNodes, domainEdges);
    }

    private WorkflowEntity mapToWorkflowEntity(Workflow workflow) {
        if (workflow == null) return null;

        WorkflowEntity workflowEntity = new WorkflowEntity();
        workflowEntity.setId(workflow.getId());

        // Map Metadata
        if (workflow.getMetadata() != null) {
            Metadata metadata = new Metadata();
            metadata.setName(workflow.getMetadata().getName());
            metadata.setVersion(workflow.getMetadata().getVersion());
            metadata.setDescription(workflow.getMetadata().getDescription());
            workflowEntity.setMetadata(metadata);
        }

        // Map Child Collections
        workflowEntity.setNodes(mapToNodeEntities(workflow.getNodes(), workflowEntity));
        workflowEntity.setEdges(mapToEdgeEntities(workflow.getEdges(), workflowEntity));

        return workflowEntity;
    }

    private List<NodeEntity> mapToNodeEntities(List<Node> domainNodes, WorkflowEntity parent) {
        if (domainNodes == null) return Collections.emptyList();

        return domainNodes.stream().map(nodeModel -> {
            NodeEntity entity = new NodeEntity();
            entity.setId(nodeModel.getId());
            entity.setType(nodeModel.getType());

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