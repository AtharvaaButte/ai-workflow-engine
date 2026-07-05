package com.atharva.workflow.validator;

import com.atharva.workflow.exception.WorkflowValidationException;
import com.atharva.workflow.model.Edge;
import com.atharva.workflow.model.Node;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
public class EdgeValidator {
    public void validatesEdges(List<Edge> edges, Map<String, Node> nodeMap){
        if (edges == null || edges.isEmpty() ){
            throw new WorkflowValidationException("No edges were found");
        }
        // 1. Check for duplicate connection paths upfront
        validateDuplicateEdges(edges);

        Map<String , Set<String>> conditionRoutingMap = new HashMap<>();

        for (Edge edge: edges ){
            // 2. Validate individual edge structural integrity and business rules
            validateSelfLoop(edge);
            validateNodeExistence(edge, nodeMap);
            validateConditionalRules(edge,nodeMap,conditionRoutingMap);
        }
    }

    private  void validateSelfLoop(Edge edge){
        // Prevent self-loops (a node connecting directly to itself)
        String fromId = edge.getFrom();
        String toId = edge.getTo();

        if (edge.getFrom().equals(edge.getTo())){
            throw new WorkflowValidationException("Node '" + edge.getFrom() + "' cannot link to itself (self-loop detected)");
        }
    }

    private void validateNodeExistence( Edge edge, Map<String, Node> nodeMap){
        // Verify that the source node exists
        if (!nodeMap.containsKey(edge.getFrom())){
            throw new WorkflowValidationException("Source node '" + edge.getFrom() + "' does not exist");
        }

        //  Verify that the target node exists
        if (!nodeMap.containsKey(edge.getTo())){
            throw new WorkflowValidationException("Target node '" + edge.getTo() + "' does not exist");
        }
    }

    private void validateConditionalRules(Edge edge, Map<String, Node> nodeMap, Map<String, Set<String>> conditionRoutingMap){

        // Validate conditional routing for "condition" nodes
        Node sourceNode = nodeMap.get(edge.getFrom());
        if("condition".equals(sourceNode.getType())){
            // Conditional edges must specify a match value
            if (edge.getCondition() == null || edge.getCondition().trim().isEmpty() ){
                throw new WorkflowValidationException(
                        "Edge from condition node '" + edge.getFrom() + "' to '" + edge.getTo() + "' must specify a routing value");
            }

            // Prevent duplicate routing values on the same condition node
            validateUniqueConditionBranches(conditionRoutingMap, edge);
        }
        else {
            // For any other node type, the condition parameter should be null
            if (edge.getCondition() != null) {
                throw new WorkflowValidationException(
                        "Node type '" + sourceNode.getType() + "' (ID: " + edge.getFrom() + ") cannot have conditional outgoing edges"
                );
            }
        }
    }

    private void validateDuplicateEdges(List<Edge> edges){
        Set<String> seenEdges = new HashSet<>();

        for (Edge edge: edges){
            String edgeSignature = edge.getFrom() + " -> " + edge.getTo();
            if (!seenEdges.add(edgeSignature)){
                throw new WorkflowValidationException(
                        "Invalid Workflow: Duplicate connection detected from [" +
                                edge.getFrom() + "] to [" + edge.getTo() + "]."
                );
            }
        }
    }

    private void validateUniqueConditionBranches (Map<String, Set<String>> conditionRoutingMap, Edge edge){
        Set<String> routes = conditionRoutingMap.computeIfAbsent(edge.getFrom(), k -> new HashSet<>());

        if (!routes.add(edge.getCondition())){
            throw new WorkflowValidationException("Duplicate routing path detected for node: " + edge.getFrom());
        }
    }

}
