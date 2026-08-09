package com.atharva.workflow.ai;

import com.atharva.workflow.ai.dto.AIRequest;
import com.atharva.workflow.ai.dto.AIResponse;
import com.atharva.workflow.ai.provider.AIProvider;
import com.atharva.workflow.exception.NodeExecutionException;
import org.springframework.stereotype.Service;

@Service
public class AIService {
    private final AIProviderRegistry providerRegistry;

    public AIService(AIProviderRegistry providerRegistry) {
        this.providerRegistry = providerRegistry;
    }

    public AIResponse process(String providerName, String systemPrompt, String userPrompt, String apiKey) {
        AIProvider provider = providerRegistry.getProvider(providerName);
        AIRequest request = new AIRequest(systemPrompt, userPrompt, apiKey);

        try {
            System.out.println("[AIService] Routing request to provider bean: " + provider.getProviderName());
            AIResponse response = provider.generate(request);

            if (response == null) {
                throw new NodeExecutionException("Provider [" + provider.getProviderName() + "] returned a null response object.");
            }
            return response;
        } catch (NodeExecutionException e) {
            throw e;
        } catch (Exception e) {
            throw new NodeExecutionException(
                    "Unexpected failure during AI execution on provider [" + provider.getProviderName() + "]: " + e.getMessage()
            );
        }
    }
}
