package com.atharva.workflow.ai.provider;

import com.atharva.workflow.ai.dto.AIRequest;
import com.atharva.workflow.ai.dto.AIResponse;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

@Component("gemini")
public class GeminiProvider implements AIProvider {

    private final ObjectMapper objectMapper = new ObjectMapper();
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
        } catch (HttpStatusCodeException e) {
            String cleanMessage = extractGeminiError(e.getResponseBodyAsString(), e.getStatusCode().value());
            System.err.println("[GeminiProvider] Clean API Error: " + cleanMessage);
            return AIResponse.failure(cleanMessage, getProviderName());
        } catch (Exception e){
            System.err.println("[GeminiProvider] Unexpected Failure: " + e.getMessage());
            return AIResponse.failure("Gemini invocation failed: " + e.getMessage(), getProviderName());
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
                .uri("/models/gemini-2.5-flash:generateContent")
                .header("x-goog-api-key", apiKey)
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

    private String extractGeminiError(String responseBody, int statusCode) {
        if (responseBody == null || responseBody.isBlank()) {
            return "Gemini API failed with HTTP " + statusCode;
        }

        try {
            JsonNode root = objectMapper.readTree(responseBody);
            if (root.has("error")) {
                JsonNode errorNode = root.get("error");
                if (errorNode.isObject() && errorNode.has("message")) {
                    return errorNode.get("message").asText();
                } else if (errorNode.isTextual()) {
                    return errorNode.asText();
                }
            }
        } catch (Exception ignored) {
            // Fallback if the body isn't JSON
        }

        return responseBody.replace("<EOL>", " ").trim();
    }

    private String maskKey(String key) {
        if (key == null || key.length() < 8) return "****";
        return key.substring(0, 4) + "..." + key.substring(key.length() - 4);
    }
}
