    package com.atharva.workflow.validator;

    import com.atharva.workflow.model.Node;
    import com.atharva.workflow.model.Workflow;
    import lombok.AllArgsConstructor;
    import org.springframework.stereotype.Component;

    import java.util.Map;
    import java.util.stream.Collectors;

    @Component
    @AllArgsConstructor
    public class WorkflowValidator {
        private final NodeValidator nodeValidator;
        private final EdgeValidator edgeValidator;
        private final GraphValidator graphValidator;


        public void validate(Workflow workflow) {

            nodeValidator.validateNodes(workflow.getNodes());

            Map<String, Node> nodeMap = workflow.getNodes().stream()
                    .collect(Collectors.toMap(Node::getId ,node -> node));
            edgeValidator.validatesEdges(workflow.getEdges(),nodeMap);

            graphValidator.validateGraph(workflow.getNodes(), workflow.getEdges());

            System.out.println("Workflow validated successfully");

        }
    }
