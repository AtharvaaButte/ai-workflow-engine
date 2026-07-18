package com.atharva.workflow.validator;

import com.atharva.workflow.exception.WorkflowValidationException;
import com.atharva.workflow.model.Edge;
import com.atharva.workflow.model.Node;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.stream.Collectors;

@Component
public class GraphValidator {
    public void validateGraph(List<Node> nodes, List<Edge> edges){

        Map<String, List<String>> nodeByTypes = groupNodeByTypes(nodes);
        List<String> triggerIds= nodeByTypes.getOrDefault("http_trigger", Collections.emptyList());
        List<String> responseIds= nodeByTypes.getOrDefault("response",Collections.emptyList());
        List<String> conditionIds= nodeByTypes.getOrDefault("condition",Collections.emptyList());
        List<String> remainingIds= new ArrayList<>();

        for (Map.Entry<String, List<String>> entry: nodeByTypes.entrySet()){
            String type = entry.getKey();
            if (!"http_trigger".equals(type) && !"response".equals(type) && !"condition".equals(type)){                remainingIds.addAll(entry.getValue());
            }
        }

        Map<String, List<Edge>> incomingMap = buildIncomingMap(edges);
        Map<String, List<Edge>> outgoingMap = buildOutgoingMap(edges);


        validateTriggerRules(nodes, triggerIds, incomingMap);
        validateResponseRules(nodes, responseIds, outgoingMap);

        System.out.println("Http trigger node and response node validated");

        detectCycleAndConnectivity(triggerIds.getFirst(),nodes,outgoingMap);
        validateBranchingRules(nodes,conditionIds, remainingIds, outgoingMap);
    }

    private Map<String,List<String>> groupNodeByTypes (List<Node> nodes){
        return nodes.stream()
                .collect(Collectors.groupingBy(
                        Node::getType,
                        Collectors.mapping(Node::getId, Collectors.toList())
                        )
                );
    }

    private Map<String, List<Edge>> buildOutgoingMap(List<Edge> edges){
        return edges.stream().collect(Collectors.groupingBy(
                Edge::getSource,
                Collectors.toList()
        ));
    }

    private Map<String,List<Edge>> buildIncomingMap(List<Edge> edges){
        return edges.stream().collect(Collectors.groupingBy(
                Edge::getTarget,
                Collectors.toList()
        ));
    }

    private void validateTriggerRules(List<Node> nodes, List<String> triggerIds, Map<String, List<Edge>> incomingMap) {
        // Rule 1: Must have exactly one starting entry point
        if (triggerIds.size() != 1) {
            throw new WorkflowValidationException(
                    "Workflow must contain exactly 1 'http_trigger' entry point, but found: " + triggerIds.size()
            );
        }

        String triggerId = triggerIds.getFirst();

        // 2. Rule 2: No incoming edges allowed to the trigger node
        if (incomingMap.containsKey(triggerId)){
            List<Edge> illegalEdges = incomingMap.get(triggerId);
            StringBuilder errorMsg = new StringBuilder();
            errorMsg.append("Invalid Workflow: The 'http_trigger' node (ID: ")
                    .append(triggerId)
                    .append(") cannot have incoming edges. Found illegal connections: ");

            for (Edge edge : illegalEdges ){
                errorMsg.append("[").append(edge.getSource()).append(" -> ").append(edge.getTarget()).append("]");
            }

            throw new WorkflowValidationException(errorMsg.toString());
        }
    }

    private void validateResponseRules(List<Node> nodes, List<String> responseIds, Map<String, List<Edge>> outgoingMap) {

        // Rule 1: Must have at least one exit point
        if (responseIds.isEmpty()) {
            throw new WorkflowValidationException(
                    "Workflow must contain at least 1 'response' exit point, but found: " + 0
            );
        }

        // 2. Rule 2: No outgoing edges allowed to the response node
        StringBuilder errorMsg = new StringBuilder();
        errorMsg.append("Invalid Workflow : The following terminal 'response' steps have illegal outgoing connections:");
        boolean hasError = false;

        for (String responseId : responseIds){

            if (outgoingMap.containsKey(responseId)){
                hasError = true;
                List<Edge> illegalEdges = outgoingMap.get(responseId);
                errorMsg.append("\n• Node ID [").append(responseId).append("]: Connected to -> ");

                for (int i = 0;i < illegalEdges.size();i++){
                   errorMsg.append("[").append(illegalEdges.get(i).getTarget()).append("]");
                   if (i != illegalEdges.size()-1){
                       errorMsg.append(", ");
                   }
                }
            }
        }
        if (hasError){
            errorMsg.append("\nPlease remove all outgoing connections from terminal 'response' nodes.");
            throw new WorkflowValidationException(errorMsg.toString());
        }
    }

    private void detectCycleAndConnectivity(String triggerId, List<Node> nodes,  Map<String, List<Edge>> outgoingMap){
        Set<String> visited = new HashSet<>();
        Set<String> recursionStack = new HashSet<>();

        if (dfsCycle(triggerId, outgoingMap, visited, recursionStack)){
            throw new WorkflowValidationException("Invalid Workflow: Infinite loop/cycle detected!");
        }

        if (visited.size() != nodes.size()) {
            List<String> unreachableNodes = new ArrayList<>();
            for (Node node : nodes) {
                 if (!visited.contains(node.getId())) {
                    unreachableNodes.add(node.getId());
                }
            }
            throw new WorkflowValidationException(
                    "Graph Connectivity Error: The following nodes are completely cut off from the trigger: " + unreachableNodes
            );
        }
    }

    private boolean dfsCycle(String currentNodeId, Map<String, List<Edge>> outgoingMap, Set<String> visited, Set<String> recursionStack){
        visited.add(currentNodeId);
        recursionStack.add(currentNodeId);

        List<Edge> outgoingEdges = outgoingMap.getOrDefault(currentNodeId, Collections.emptyList());

        for (Edge edge: outgoingEdges ){
            String nextNodeId = edge.getTarget();
            if (recursionStack.contains(nextNodeId)){
                return true;
            }
            if (!visited.contains(nextNodeId)){
                if (dfsCycle(nextNodeId,outgoingMap,visited,recursionStack)){
                    return true;
                }
            }
        }
        recursionStack.remove(currentNodeId);
        return false;
    }

    private void validateBranchingRules(List<Node> nodes, List<String> conditionIds,List<String> remainingIds, Map<String, List<Edge>> outgoingMap){

        StringBuilder errorMsg = new StringBuilder();
        errorMsg.append("Invalid Workflow: 'condition' nodes must split into at least 2 branching paths.");
        boolean hasError = false;

        for(String conditionId : conditionIds){
           if (outgoingMap.getOrDefault(conditionId , Collections.emptyList()).size() <= 1){
               hasError = true;
                errorMsg.append("\n• Node ID [").append(conditionId).append("]: Has ").append(outgoingMap.getOrDefault(conditionId, Collections.emptyList()).size()).append(" outgoing connection. (Needs at least 2)");
           }
        }

        if (hasError){
            errorMsg.append("\nPlease ensure all condition nodes have branches for both true/false or multi-choice outcomes.");
            throw new WorkflowValidationException(errorMsg.toString());
        }

        errorMsg = new StringBuilder();
        errorMsg.append("Invalid Workflow: Standard action nodes must have exactly 1 outgoing connection sequential path");
        hasError = false;

        for(String nodeId : remainingIds){
            if (outgoingMap.getOrDefault(nodeId,Collections.emptyList()).size() != 1){
                hasError = true;
                errorMsg.append("\n• Node ID [")
                        .append(nodeId).append("]: Has ")
                        .append(outgoingMap.getOrDefault(nodeId,Collections.emptyList()).size())
                        .append(" outgoing connection. (Needs exactly 1)");
            }
        }
        if (hasError){
            errorMsg.append("\nPlease ensure standard action steps only link forward to a single next step.");
            throw new WorkflowValidationException(errorMsg.toString());
        }
    }

}