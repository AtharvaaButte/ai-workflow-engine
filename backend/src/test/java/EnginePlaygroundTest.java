import com.atharva.workflow.engine.NodeHandlerRegistry;
import com.atharva.workflow.engine.RoutingService;
import com.atharva.workflow.engine.WorkflowContext;
import com.atharva.workflow.engine.WorkflowEngine;
import com.atharva.workflow.engine.handler.AIProcessorHandler;
import com.atharva.workflow.engine.handler.HttpTriggerHandler;
import com.atharva.workflow.engine.handler.NodeHandler;
import com.atharva.workflow.engine.handler.ResponseHandler; // 🌟 1. Import your new handler
import com.atharva.workflow.model.Edge;
import com.atharva.workflow.model.Node;
import com.atharva.workflow.model.Workflow;

import java.util.*;

public class EnginePlaygroundTest {

    public static void main(String[] args) {
        System.out.println("=== SETTING UP PLAYGROUND TEST ===");

        // 1. Manually create the building blocks (Strategies)
        HttpTriggerHandler triggerHandler = new HttpTriggerHandler();
        AIProcessorHandler aiHandler = new AIProcessorHandler();
        ResponseHandler responseHandler = new ResponseHandler(); // 🌟 2. Instantiate new handler

        // 2. Manually register them into our clipboard warehouse map
        Map<String, NodeHandler> manualMap = new HashMap<>();
        manualMap.put("http_trigger", triggerHandler);
        manualMap.put("ai_processor", aiHandler);
        manualMap.put("response", responseHandler); // 🌟 3. Register your response handler

        NodeHandlerRegistry registry = new NodeHandlerRegistry(manualMap);
        RoutingService routingService = new RoutingService();

        // 3. Assemble our Orchestrator Engine using Constructor Injection
        WorkflowEngine engine = new WorkflowEngine(registry, routingService);

        // 4. Build a dummy Workflow Graph Blueprint
        Workflow dummyWorkflow = new Workflow();
        dummyWorkflow.setId(UUID.randomUUID());

        List<Node> nodes = new ArrayList<>();
        List<Edge> edges = new ArrayList<>();

        // Block A: The Entry Trigger
        Node triggerNode = new Node();
        triggerNode.setId("node_trigger");
        triggerNode.setType("http_trigger");
        nodes.add(triggerNode);

        // Block B: The AI Processor (Configured to map input -> output)
        Node aiNode = new Node();
        aiNode.setId("node_ai");
        aiNode.setType("ai_processor");

        Map<String, Object> aiConfig = new HashMap<>();
        aiConfig.put("inputKey", "raw_message");
        aiConfig.put("outputKey", "derived_category");
        aiNode.setConfig(aiConfig);
        nodes.add(aiNode);

        // 🌟 4. Block C: The New Response Block
        Node responseNode = new Node();
        responseNode.setId("node_response");
        responseNode.setType("response");

        Map<String, Object> responseConfig = new HashMap<>();
        // Configure it to extract exactly what we want in our final API payload
        responseConfig.put("responseKeys", "derived_category, node_ai_status");
        responseNode.setConfig(responseConfig);
        nodes.add(responseNode);

        // Connect Block A -> Block B
        Edge edge1 = new Edge();
        edge1.setSource("node_trigger");
        edge1.setTarget("node_ai");
        edges.add(edge1);

        // 🌟 5. Connect Block B -> Block C
        Edge edge2 = new Edge();
        edge2.setSource("node_ai");
        edge2.setTarget("node_response");
        edges.add(edge2);

        dummyWorkflow.setNodes(nodes);
        dummyWorkflow.setEdges(edges);

        // 5. Create a fresh backpack context and simulate an incoming request body payload
        WorkflowContext context = new WorkflowContext();
        context.setVariable("raw_message", "Help! My credit card payment failed yesterday!");

        // 6. RUN THE ENGINE ENGINE!
        System.out.println("\n=== LAUNCHING WORKFLOW ENGINE LOOP ===");
        try {
            engine.execute(dummyWorkflow, context);

            System.out.println("\n=== VERIFYING RESULTS IN BACKPACK ===");
            System.out.println("Result for 'derived_category': " + context.getVariable("derived_category"));
            System.out.println("Status of AI Node: " + context.getVariable("node_ai_status"));

            // 🌟 6. Verify that the response handler successfully extracted the target keys into the output payload
            System.out.println("\n=== VERIFYING FINAL OUTPUT ENGINE PACKET ===");
            if (context.hasVariable("FINAL_ENGINE_OUTPUT")) {
                System.out.println("FINAL_ENGINE_OUTPUT: " + context.getVariable("FINAL_ENGINE_OUTPUT"));
            } else {
                System.out.println(" Error: FINAL_ENGINE_OUTPUT key missing inside context mapping tracker.");
            }

        } catch (Exception e) {
            System.err.println("Test Failed: " + e.getMessage());
            e.printStackTrace();
        }
    }
}