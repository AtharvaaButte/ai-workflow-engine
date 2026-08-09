package com.atharva.workflow.ai;

import com.atharva.workflow.ai.provider.AIProvider;
import com.atharva.workflow.exception.AIProviderNotFoundException;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class AIProviderRegistry {
    private final Map<String, AIProvider> providerMap;

    public AIProviderRegistry(Map<String, AIProvider> providerMap) {
        this.providerMap = providerMap;
    }
    public AIProvider getProvider(String providerName) {
        if (providerName == null || providerName.isBlank()) {
            providerName = "openai";
        }

        AIProvider provider = providerMap.get(providerName.toLowerCase());

        if (provider == null) {
            throw new AIProviderNotFoundException(
                    "No registered AIProvider implementation found for provider: [" + providerName + "]. Available providers: " + providerMap.keySet()
            );
        }

        return provider;
    }
}
