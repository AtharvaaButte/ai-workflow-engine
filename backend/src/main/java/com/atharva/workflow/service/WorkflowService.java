package com.atharva.workflow.service;

import com.atharva.workflow.dto.CreateWorkflowRequest;
import com.atharva.workflow.model.Workflow;
import com.atharva.workflow.validator.WorkflowValidator;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@AllArgsConstructor
public class WorkflowService {
    private List<Workflow> workflows = new ArrayList<>();
    private final WorkflowValidator workflowValidator;

    public void createWorkflow(CreateWorkflowRequest request) {
        Workflow workflow = new Workflow(
                UUID.randomUUID(),
                request.getMetadata(),
                request.getNodes(),
                request.getEdges()
        );
        validateWorkflow(workflow);
        workflows.add(workflow);
    }

    public List<Workflow> getWorkflows() {
        return workflows;
    }

    public Optional<Workflow> getWorkflow(UUID id) {
        return workflows.stream()
                .filter(workflow -> workflow.getId().equals(id))
                .findFirst();
    /* TODO: Raise a Exception Here */
    }

    private void validateWorkflow(Workflow workflow) {
        workflowValidator.validate(workflow);
    }
}
