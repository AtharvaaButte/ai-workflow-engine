package com.atharva.workflow.engine;

import com.atharva.workflow.engine.handler.NodeHandler;
import com.atharva.workflow.exception.WorkflowExecutionException;
import com.atharva.workflow.model.Edge;
import com.atharva.workflow.model.Node;
import com.atharva.workflow.model.Workflow;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class WorkflowEngine {
    private final NodeHandlerRegistry registry;
    private final RoutingService routingService;


    public WorkflowEngine(NodeHandlerRegistry registry, RoutingService routingService) {
        this.registry = registry;
        this.routingService = routingService;
    }

    public void execute(Workflow workflow, WorkflowContext context){
        System.out.println("Starting workflow execution: " + workflow.getId());
        Map<String, List<Edge>> outgoingMap = buildOutgoingMap(workflow.getEdges());

        Node currentNode = findTriggerNode(workflow.getNodes());

        //  THE CORE EXECUTION LOOP

        while (currentNode != null){
            System.out.println("Processing loop current step pointer: " + currentNode.getId());

            try {
                NodeHandler handler = registry.getHandler(currentNode.getType());
                handler.execute(currentNode, context);

                String nextNodeId = routingService.resolveNextNodeId(currentNode, context, outgoingMap);

                if (nextNodeId == null){
                    currentNode = null;
                }
                else{
                    currentNode = findNodeById(workflow.getNodes(),nextNodeId);
                }

            } catch (Exception e) {
                System.err.println("Critical failure during workflow run at node [" + currentNode.getId() + "]");
                throw new WorkflowExecutionException("Workflow failed at node [" + currentNode.getId() + "]: " + e.getMessage(), e);            }
        }

    }

    private Map<String, List<Edge>> buildOutgoingMap(List<Edge> edges){
        return edges.stream().collect(Collectors.groupingBy(
                Edge::getFrom,
                Collectors.toList()
        ));
    }

    private Node findTriggerNode(List<Node> nodes) {
        if (nodes == null || nodes.isEmpty()) {
            throw new WorkflowExecutionException("Cannot run workflow: Graph contains no nodes!");
        }
        for (Node node : nodes) {
            if ("http_trigger".equalsIgnoreCase(node.getType())) {
                return node;
            }
        }
        throw new WorkflowExecutionException("Cannot run workflow: Missing an entry point 'http_trigger' node!");
    }

    private Node findNodeById(List<Node> nodes, String id) {
        return nodes.stream()
                .filter(node -> node.getId().equals(id))
                .findFirst()
                .orElseThrow(() -> new WorkflowExecutionException("Broken Link: Node pointer ID [" + id + "] not found in graph definition!"));
    }
}
