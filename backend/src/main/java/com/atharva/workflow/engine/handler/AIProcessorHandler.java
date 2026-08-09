package com.atharva.workflow.engine.handler;

import com.atharva.workflow.ai.AIService;
import com.atharva.workflow.ai.dto.AIResponse;
import com.atharva.workflow.engine.WorkflowContext;
import com.atharva.workflow.exception.NodeExecutionException;
import com.atharva.workflow.model.ExecutionStatus;
import com.atharva.workflow.model.Node;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component("ai_processor")
public class AIProcessorHandler implements NodeHandler{

    private final AIService aiService;

    public AIProcessorHandler(AIService aiService) {
        this.aiService = aiService;
    }

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

        String textToProcess = (String) context.getVariable(inputKey);

        if (textToProcess == null){
            throw new NodeExecutionException("Execution failed: Context variable '" + inputKey + "' was not found!");
        }

        String provider = (String) config.getOrDefault("provider", "openai");
        String systemPrompt = (String) config.getOrDefault("prompt", "Classify or process the input text.");
        String apiKey = (String) config.get("apiKey");

        AIResponse aiResponse = aiService.process(provider,systemPrompt,textToProcess,apiKey);

        context.setVariable(outputKey,aiResponse.outputText());

        context.setVariable(node.getId()+ "_status", ExecutionStatus.COMPLETED.name());
        System.out.println("AI Node [" + node.getId() + "] processed text via provider [" +
                aiResponse.providerName() + "] and mapped result '" +
                aiResponse.outputText() + "' to key '" + outputKey + "'");
    }
}
