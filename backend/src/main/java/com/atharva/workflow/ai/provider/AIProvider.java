package com.atharva.workflow.ai.provider;

import com.atharva.workflow.ai.dto.AIRequest;
import com.atharva.workflow.ai.dto.AIResponse;
import org.springframework.stereotype.Component;

@Component
public interface AIProvider {
    // Executes the AI generation request against the specific provider API.
    AIResponse generate(AIRequest request);

    String getProviderName();
}
