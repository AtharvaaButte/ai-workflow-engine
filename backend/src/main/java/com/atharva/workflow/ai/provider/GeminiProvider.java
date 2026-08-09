package com.atharva.workflow.ai.provider;

import com.atharva.workflow.ai.dto.AIRequest;
import com.atharva.workflow.ai.dto.AIResponse;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

@Component("gemini")
public class GeminiProvider implements AIProvider {

    private final RestClient restClient = RestClient.create("https://generativelanguage.googleapis.com/v1beta");

    @Override
    public String getProviderName() {
        return "gemini";
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

        System.out.println("[GeminiProvider] Calling Gemini API with config key: " + maskKey(apiKey));

        try {
            return makeRealGeminiCall(request, apiKey);
        } catch (Exception e) {
            System.err.println("[GeminiProvider] HTTP Call Failed: " + e.getMessage());
            return AIResponse.failure("Gemini API Execution Failure: " + e.getMessage(), getProviderName());
        }
    }

    private AIResponse makeRealGeminiCall(AIRequest request, String apiKey) {
        Map<String, Object> requestBody = Map.of(
                "systemInstruction", Map.of(
                        "parts", List.of(Map.of("text", request.systemPrompt()))
                        ),
                        "contents", List.of(
                                Map.of("parts", List.of(Map.of("text", request.userPrompt())))
                        ),
                        "generationConfig", Map.of(
                                "temperature", request.temperature()
                        )
        );

        Map<?, ?> responseMap = restClient.post()
                .uri("/models/gemini-1.5-flash:generateContent?key=" + apiKey)
                .contentType(MediaType.APPLICATION_JSON)
                .body(requestBody)
                .retrieve()
                .body(Map.class);

        if (responseMap == null || !responseMap.containsKey("candidates")) {
            return AIResponse.failure("Empty or invalid response structure received from Gemini.", getProviderName());
        }

        List<?> candidates = (List<?>) responseMap.get("candidates");
        if (candidates.isEmpty()) {
            return AIResponse.failure("No candidates returned in Gemini response.", getProviderName());
        }

        Map<?, ?> firstCandidate = (Map<?, ?>) candidates.getFirst();
        Map<?, ?> content = (Map<?, ?>) firstCandidate.get("content");
        if (content == null || !content.containsKey("parts")) {
            return AIResponse.failure("Candidate missing content parts in Gemini response.", getProviderName());
        }

        List<?> parts = (List<?>) content.get("parts");
        if (parts.isEmpty()) {
            return AIResponse.failure("Empty content parts in Gemini candidate response.", getProviderName());
        }

        Map<?, ?> firstPart = (Map<?, ?>) parts.getFirst();
        String outputText = ((String) firstPart.get("text")).trim();

        return AIResponse.success(outputText, getProviderName());
    }

    private String maskKey(String key) {
        if (key == null || key.length() < 8) return "****";
        return key.substring(0, 4) + "..." + key.substring(key.length() - 4);
    }
}
