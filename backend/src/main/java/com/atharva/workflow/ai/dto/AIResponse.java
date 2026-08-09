package com.atharva.workflow.ai.dto;

public record AIResponse (
        String outputText,
        String providerName,
        boolean success,
        String errorMessage
){
    public static AIResponse success(String outputText, String providerName){
        return new AIResponse(outputText,providerName,true,null);
    }

    public static AIResponse failure(String errorMessage, String providerName) {
        return new AIResponse(null, providerName, false, errorMessage);
    }
}