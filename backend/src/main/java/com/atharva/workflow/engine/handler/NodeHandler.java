package com.atharva.workflow.engine.handler;

import com.atharva.workflow.engine.WorkflowContext;
import com.atharva.workflow.model.Node;

public interface NodeHandler {
    void execute(Node node, WorkflowContext context);
}
