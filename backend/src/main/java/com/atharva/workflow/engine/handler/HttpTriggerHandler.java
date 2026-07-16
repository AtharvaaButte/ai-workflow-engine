package com.atharva.workflow.engine.handler;

import com.atharva.workflow.engine.WorkflowContext;
import com.atharva.workflow.exception.WorkflowExecutionException;
import com.atharva.workflow.model.ExecutionStatus;
import com.atharva.workflow.model.Node;

public class HttpTriggerHandler implements NodeHandler{
    @Override
    public void execute(Node node, WorkflowContext context) {
        System.out.println("Executing Trigger Node: " + node.getId());
        Object payload = context.getVariable("request_payload");
/*
        if (payload == null){
            throw new WorkflowExecutionException(
               "Execution Error at node [" + node.getId() + "]: Incoming request payload is empty!"
            );
        }
*/
        context.setVariable(node.getId()+"_status", ExecutionStatus.FIRED.name());
    }
}
