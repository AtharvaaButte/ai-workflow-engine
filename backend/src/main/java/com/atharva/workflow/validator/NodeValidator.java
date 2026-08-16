package com.atharva.workflow.validator;

import com.atharva.workflow.exception.WorkflowValidationException;
import com.atharva.workflow.model.Node;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Component
public class NodeValidator {
    private final Set<String> allowedTypes = Set.of(
        "http_trigger",
        "ai_processor",
        "condition",
        "send_email",
        "response"
    );

    public void validateNodes(List<Node> nodes) {

    // 1. Ensure the workflow contains at least one node
        if (nodes == null || nodes.isEmpty()) {
             throw new WorkflowValidationException("No nodes were found");
        }

        Set<String> seenIds =  new HashSet<>();
        for (Node node : nodes) {
            // 2. Verify that the node type is supported by the engine
            if (!allowedTypes.contains(node.getType())) {
                throw new WorkflowValidationException(
                        "Invalid node type:  " + node.getType()
                );
            }

            // 3. Prevent duplicate node IDs within the same graph
            if (!seenIds.add(node.getId())) {
                throw new WorkflowValidationException("Duplicate node id: " + node.getId());
            }

            // 4. Validate configuration parameters based on the specific node type
            switch (node.getType()) {
                case "http_trigger":
                    break;

                case "ai_processor":
                    require(node, "inputKey");
                    require(node, "outputKey");
                    require(node, "provider");
                    require(node, "prompt");
                    require(node, "apiKey");
                    break;

                case "condition":
                    require(node, "field");
                    break;

                case "send_email":
                    require(node, "apiKey");
                    require(node, "subject");
                    require(node, "from");
                    break;

                case "response":
                    require(node, "responseKeys");
                    break;

                default:
                    throw new WorkflowValidationException("Unhandled node type validation: " + node.getType());
            }
        }
    }

    private void require(Node node, String key) {
        if (node.getConfig() == null || !node.getConfig().containsKey(key)) {
            throw new WorkflowValidationException(
                    "Missing required field '" + key + "' for node [" + node.getId() + "] of type '" + node.getType() + "'"
            );
        }

        Object value = node.getConfig().get(key);
        if (value == null || (value instanceof String str && str.trim().isEmpty())) {
            throw new WorkflowValidationException(
                    "Field '" + key + "' cannot be blank or null on node [" + node.getId() + "]"
            );
        }
    }
}
