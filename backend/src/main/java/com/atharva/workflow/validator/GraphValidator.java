package com.atharva.workflow.validator;

import com.atharva.workflow.exception.WorkflowValidationException;
import com.atharva.workflow.model.Edge;
import com.atharva.workflow.model.Node;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
public class GraphValidator {
    public void validateGraph(List<Node> nodes, List<Edge> edges){

        Map<String, Integer> nodeTypesCount = countNodeTypes(nodes);
        int triggerCount = nodeTypesCount.getOrDefault("http_trigger",0);
        int responseCount = nodeTypesCount.getOrDefault("response",0);

        Map<String, List<Edge>> incomingMap = buildIncomingMap(edges);
        Map<String, List<Edge>> outgoingMap = buildOutgoingMap(edges);


        validateTriggerRules(nodes, triggerCount, incomingMap);
        validateResponseRules(nodes, responseCount, outgoingMap);

        System.out.println("Http trigger node and response node validated");


    }

    private Map<String,Integer> countNodeTypes (List<Node> nodes){
        return nodes.stream()
                .filter(node -> "http_trigger".equals(node.getType()) || "response".equals(node.getType()))
                .collect(Collectors.groupingBy(
                        Node::getType,
                        Collectors.summingInt(node -> 1)
                        )
                );
    }

    private Map<String, List<Edge>> buildOutgoingMap(List<Edge> edges){
        return edges.stream().collect(Collectors.groupingBy(
                Edge::getFrom,
                Collectors.toList()
        ));
    }

    private Map<String,List<Edge>> buildIncomingMap(List<Edge> edges){
        return edges.stream().collect(Collectors.groupingBy(
                Edge::getTo,
                Collectors.toList()
        ));
    }

    private void validateTriggerRules(List<Node> nodes, int triggerCount, Map<String, List<Edge>> incomingMap) {
        // Rule 1: Must have exactly one starting entry point
        if (triggerCount != 1) {
            throw new WorkflowValidationException(
                    "Workflow must contain exactly 1 'http_trigger' entry point, but found: " + triggerCount
            );
        }

        String triggerId  = null;

        for (Node node : nodes){
            if ("http_trigger".equals(node.getType())){
                triggerId = node.getId();
                break;
            }
        }

        // 2. Rule 2: No incoming edges allowed to the trigger node
        if (incomingMap.containsKey(triggerId)){
            List<Edge> illegalEdges = incomingMap.get(triggerId);
            StringBuilder erroMsg = new StringBuilder();
            erroMsg.append("Invalid Workflow: The 'http_trigger' node (ID: ")
                    .append(triggerId)
                    .append(") cannot have incoming edges. Found illegal connections: ");

            for (Edge edge : illegalEdges ){
                erroMsg.append("[").append(edge.getFrom()).append(" -> ").append(edge.getTo()).append("]");
            }

            throw new WorkflowValidationException(erroMsg.toString());
        }
    }

    private void validateResponseRules(List<Node> nodes, int responseCount, Map<String, List<Edge>> outgoingMap) {

        // Rule 1: Must have at least one exit point
        if (responseCount == 0) {
            throw new WorkflowValidationException(
                    "Workflow must contain at least 1 'response' exit point, but found: " + responseCount
            );
        }

        List<String> responseIds  = new ArrayList<>();

        for (Node node : nodes){
            if ("response".equals(node.getType())){
                responseIds.add(node.getId());
            }
        }

        // 2. Rule 2: No outgoing edges allowed to the response node
        StringBuilder erroMsg = new StringBuilder();
        erroMsg.append("Invalid Workflow Matrix: The following terminal 'response' steps have illegal outgoing connections:");
        boolean hasError = false;

        for (String responseId : responseIds){

            if (outgoingMap.containsKey(responseId)){
                hasError = true;
                List<Edge> illegalEdges = outgoingMap.get(responseId);
                erroMsg.append("\n• Node ID [").append(responseId).append("]: Connected to -> ");

                for (int i = 0;i < illegalEdges.size();i++){
                   erroMsg.append("[").append(illegalEdges.get(i).getTo()).append("]");
                   if (i != illegalEdges.size()-1){
                       erroMsg.append(", ");
                   }
                }
            }
        }
        if (hasError){
            erroMsg.append("\nPlease remove all outgoing connections from terminal 'response' nodes.");
            throw new WorkflowValidationException(erroMsg.toString());
        }
    }
}