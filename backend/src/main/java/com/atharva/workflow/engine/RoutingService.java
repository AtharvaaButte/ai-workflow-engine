package com.atharva.workflow.engine;

import com.atharva.workflow.exception.WorkflowExecutionException;
import com.atharva.workflow.model.Edge;
import com.atharva.workflow.model.Node;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class RoutingService {

    public String resolveNextNodeId(Node currentNode, WorkflowContext context, Map<String, List<Edge>> outgoingMap) {
        List<Edge> edges = outgoingMap.get(currentNode.getId());

        if (edges == null || edges.isEmpty()) {
           return null;
        }

        // Logic Route A: Handling a standard action block
        if (!"condition".equalsIgnoreCase(currentNode.getType())){
            return edges.get(0).getTo();
        }

        // Logic Route B: Handling the Traffic Cop ("condition" block)
        return evaluateConditionRouting(currentNode,context, outgoingMap.get(currentNode.getId()));

    }

    private String evaluateConditionRouting(Node conditionNode, WorkflowContext context, List<Edge> edges) {
        Map<String, Object> config = conditionNode.getConfig();

        if (config == null || !config.containsKey("field")) {
            throw new WorkflowExecutionException("Condition Node [" + conditionNode.getId() + "] missing 'field' configuration!");
        }

        String field = (String) config.get("field");

        String runtimeValue = (String) context.getVariable(field);

        if (runtimeValue == null) {
            throw new WorkflowExecutionException("Routing failure: Context variable '" + runtimeValue + "' is missing at condition check!");
        }

        for (Edge edge: edges){
            if (runtimeValue.equalsIgnoreCase(edge.getCondition())){
                return edge.getTo();
            }
        }
        for (Edge edge : edges) {
            if ("else".equalsIgnoreCase(edge.getCondition()) || edge.getCondition() == null) {
                return edge.getTo();
            }
        }

        throw new WorkflowExecutionException("Routing deadlock: No matching path branch or fallback default found leaving condition node [" + conditionNode.getId() + "]");
    }
}
