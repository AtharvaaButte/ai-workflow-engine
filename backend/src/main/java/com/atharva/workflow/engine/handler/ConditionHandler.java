package com.atharva.workflow.engine.handler;

import com.atharva.workflow.engine.WorkflowContext;
import com.atharva.workflow.model.Node;
import org.springframework.stereotype.Component;

@Component("condition")
public class ConditionHandler implements NodeHandler{
    @Override
    public void execute(Node node, WorkflowContext context) {

    }
}
