package com.atharva.workflow.ai.provider;

import com.atharva.workflow.ai.dto.AIRequest;
import com.atharva.workflow.ai.dto.AIResponse;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

@Component("openai")
public class OpenAIProvider implements AIProvider {

    private final RestClient restClient = RestClient.create("https://api.openai.com/v1");


    @Override
    public String getProviderName() {
        return "openai";
    }

    @Override
    public AIResponse generate(AIRequest request) {

        String apiKey = request.overrideApiKey();
        if (apiKey == null || apiKey.isBlank()) {
            return AIResponse.failure(
                    "Missing required API key in node configuration for provider: " + getProviderName(),
                    getProviderName()
            );
        }
        System.out.println("[OpenAIProvider] Calling OpenAI API with config key: " + maskKey(apiKey));

        try {
            return makeRealOpenAICall(request,apiKey);
        } catch (Exception e) {
            System.err.println("[OpenAIProvider] HTTP Call Failed: " + e.getMessage());
            return AIResponse.failure("OpenAI API Execution Failure: " + e.getMessage(), getProviderName());
        }
    }

    private AIResponse makeRealOpenAICall(AIRequest request, String apiKey){
        Map<String, Object> requestBody = Map.of(
                "model", "gpt-4o-mini",
                "temperature", request.temperature(),
                "messages", List.of(
                        Map.of("role", "system", "content", request.systemPrompt()),
                        Map.of("role", "user", "content", request.userPrompt())
                )
        );
        Map<?, ?> responseMap = restClient.post()
                .uri("/chat/completions")
                .contentType(MediaType.APPLICATION_JSON)
                .header("Authorization", "Bearer " + apiKey)
                .body(requestBody)
                .retrieve()
                .body(Map.class);

        if (responseMap == null || !responseMap.containsKey("choices")) {
            return AIResponse.failure("Empty or invalid response structure received from OpenAI.", getProviderName());
        }

        List<?> choices = (List<?>) responseMap.get("choices");
        if (choices.isEmpty()) {
            return AIResponse.failure("No choices returned in OpenAI response choices array.", getProviderName());
        }

        Map<?, ?> firstChoice = (Map<?, ?>) choices.getFirst();
        Map<?, ?> message = (Map<?, ?>) firstChoice.get("message");
        String outputText = ((String) message.get("content")).trim();

        return AIResponse.success(outputText,getProviderName());
    }

    private String maskKey(String key) {
        if (key == null || key.length() < 8) return "****";
        return key.substring(0, 4) + "..." + key.substring(key.length() - 4);
    }

}
