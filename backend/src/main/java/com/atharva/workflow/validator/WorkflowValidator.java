package com.atharva.workflow.validator;

import com.atharva.workflow.model.Workflow;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@AllArgsConstructor
public class WorkflowValidator {
    private final NodeValidator nodeValidator;

    public void validate(Workflow workflow) {
        nodeValidator.validateNodes(workflow.getNodes());
    }
}
