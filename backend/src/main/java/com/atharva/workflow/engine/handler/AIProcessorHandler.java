package com.atharva.workflow.engine.handler;

import com.atharva.workflow.engine.WorkflowContext;
import com.atharva.workflow.exception.NodeExecutionException;
import com.atharva.workflow.model.ExecutionStatus;
import com.atharva.workflow.model.Node;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component("ai_processor")
public class AIProcessorHandler implements NodeHandler{
    @Override
    public void execute(Node node, WorkflowContext context) {
        System.out.println("Executing AI Processor Node: " + node.getId());
        Map<String, Object> config =  node.getConfig();

        // 1. Validation Guardrail: Ensure configuration maps exist
        if (config == null || !config.containsKey("inputKey") || !config.containsKey("outputKey")) {
            throw new NodeExecutionException("AI Block [" + node.getId() + "] missing required mapping configurations!");
        }

        String inputKey = (String) config.get("inputKey");
        String outputKey = (String) config.get("outputKey");

        System.out.println(inputKey+ "  "+outputKey);
        String textToProcess = (String) context.getVariable(inputKey);
        if (textToProcess == null){
            throw new NodeExecutionException("Execution failed: Context variable '" + inputKey + "' was not found!");
        }
        String simulatedResult = "simulatedResult";
        String lowerCaseText = textToProcess.toLowerCase();

        if (lowerCaseText.contains("payment") || lowerCaseText.contains("charge") || lowerCaseText.contains("bill")) {
            simulatedResult = "billing";
        }

        context.setVariable(outputKey, simulatedResult);

        context.setVariable(node.getId()+ "_status", ExecutionStatus.COMPLETED.name());
        System.out.println("AI Processing finished: " + outputKey + " = " + simulatedResult);
    }
}
