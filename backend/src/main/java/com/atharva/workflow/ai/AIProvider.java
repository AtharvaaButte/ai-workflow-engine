package com.atharva.workflow.ai;

import com.atharva.workflow.ai.dto.AIRequest;
import com.atharva.workflow.ai.dto.AIResponse;

public interface AIProvider {
    // Executes the AI generation request against the specific provider API.
    AIResponse generate(AIRequest request);

    String getProviderName();
}
