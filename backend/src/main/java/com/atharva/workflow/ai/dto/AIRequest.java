package com.atharva.workflow.ai.dto;

public record AIRequest (
    String systemPrompt,
    String userPrompt,
    Double temperature,
    String overrideApiKey
){
    public AIRequest(String systemPrompt, String userPrompt, String overrideApiKey) {
        this(systemPrompt, userPrompt, 0.2, overrideApiKey);
    }
}
