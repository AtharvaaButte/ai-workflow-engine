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
                    // Fallback or setup configuration parameters if needed (e.g., path/method validation)
                    // Leaving it open if config can be empty, or you can add specific key requirements:
                    // require(node, "method");
                    break;

                case "ai_processor":
                    require(node, "provider");
                    require(node, "task");
                    require(node, "prompt");
                    break;

                case "condition":
                    // Matches the "field": "category" structural requirement from the JSON spec
                    require(node, "field");
                    break;

                case "send_email":
                    require(node, "to");
                    require(node, "subject");
                    break;

                case "response":
                    break;

                default:
                    // Defensive check just in case a type slips past the initial allowedTypes.contains() check
                    throw new WorkflowValidationException("Unhandled node type validation: " + node.getType());
            }
        }
    }

    private void require(Node node, String key) {
        if (node.getConfig() == null || !node.getConfig().containsKey(key)) {
            throw new WorkflowValidationException("'" + key + "' cannot be empty or null for node type '" + node.getType() + "'");
        }
    }
}
