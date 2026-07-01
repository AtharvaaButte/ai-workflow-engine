package com.atharva.workflow.validator;

import com.atharva.workflow.exception.WorkflowValidationException;
import com.atharva.workflow.model.Edge;
import com.atharva.workflow.model.Node;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Component
public class EdgeValidator {
    public void validatesEdges(List<Edge> edges, Map<String, Node> nodeMap){
        if (edges == null || edges.isEmpty() ){
            throw new WorkflowValidationException("No edges were found");
        }
        for (Edge edge: edges ){
            String fromId = edge.getFrom();
            String toId = edge.getTo();
            // 2. Prevent self-loops (a node connecting directly to itself)
            if (fromId.equals(toId)){
                throw new WorkflowValidationException("Node '" + fromId + "' cannot link to itself (self-loop detected)");
            }

            // 3. Verify that the source node exists
            if (!nodeMap.containsKey(edge.getFrom())){
                throw new WorkflowValidationException("Source node '" + fromId + "' does not exist");
            }

            // 4. Verify that the target node exists
            if (!nodeMap.containsKey(edge.getTo())){
                throw new WorkflowValidationException("Target node '" + toId + "' does not exist");
            }

            // 5. Business Rule: Validate conditional routing for "condition" nodes
            Node sourceNode = nodeMap.get(fromId);
            if("condition".equals(sourceNode.getType())){
                // Conditional edges must specify a match value
                if (edge.getCondition() == null || edge.getCondition().trim().isEmpty() ){
                    throw new WorkflowValidationException(
                            "Edge from condition node '" + fromId + "' to '" + toId + "' must specify a routing value");
                }
            }
            else {
                // For any other node type, the condition parameter should be null
                if (edge.getCondition() != null) {
                    throw new WorkflowValidationException(
                            "Node type '" + sourceNode.getType() + "' (ID: " + fromId + ") cannot have conditional outgoing edges"
                    );
                }
            }
        }
    }
}
