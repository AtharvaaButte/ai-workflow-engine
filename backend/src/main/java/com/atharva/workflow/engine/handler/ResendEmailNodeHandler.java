package com.atharva.workflow.engine.handler;

import com.atharva.workflow.engine.WorkflowContext;
import com.atharva.workflow.exception.NodeExecutionException;
import com.atharva.workflow.model.Node;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

@Component("send_email")
public class ResendEmailNodeHandler implements NodeHandler{

    private final RestClient restClient = RestClient.create("https://api.resend.com");
    @Override
    public void execute(Node node, WorkflowContext context) {
        Map<String, Object> config = node.getConfig();
        if (config == null) {
            throw new NodeExecutionException("Email Node [" + node.getId() + "] is missing config block.");
        }

        String apiKey = (String) config.get("apiKey");
        if (apiKey == null || apiKey.isBlank()) {
            throw new NodeExecutionException("Email Node [" + node.getId() + "] requires an 'apiKey' in its config.");
        }

        //  Resolve Recipient (Static string vs Dynamic key from WorkflowContext)
        String recipient = (String) config.get("recipient");
        String recipientKey = (String) config.get("recipientKey");

        String finalRecipient = recipient;
        if ((finalRecipient == null || finalRecipient.isBlank()) && recipientKey != null) {
            Object dynamicRecipient = context.getVariable(recipientKey);
            if (dynamicRecipient != null) {
                finalRecipient = dynamicRecipient.toString();
            }
        }

        if (finalRecipient == null || finalRecipient.isBlank()) {
            throw new NodeExecutionException("Email Node [" + node.getId() + "] has no valid recipient specified.");
        }

        String rawBody = (String) config.get("body");
        String bodyKey = (String) config.get("bodyKey");

        String finalBody = rawBody;
        if (bodyKey != null) {
            Object dynamicContent = context.getVariable(bodyKey);
            if (dynamicContent != null) {
                finalBody = dynamicContent.toString();
            }
        }

        if (finalBody == null || finalBody.isBlank()) {
            finalBody = "Automated notification from workflow engine.";
        }

        String subject = (String) config.getOrDefault("subject", "Workflow Automated Notification");

        String fromAddress = (String) config.getOrDefault("from",
                config.getOrDefault("fromAddress", "onboarding@resend.dev"));

        Map<String, Object> requestBody = Map.of(
                "from", fromAddress,
                "to", List.of(finalRecipient),
                "subject", subject,
                "text", finalBody
        );
        // Execute REST POST Call
        try{
            System.out.println("[ResendEmailNodeHandler] Dispatching email to: " + finalRecipient + " via Resend API");
                restClient.post()
                    .uri("/emails")
                    .header("Authorization", "Bearer " + apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(requestBody)
                    .retrieve()
                    .toBodilessEntity();

                System.out.println("Email Node [" + node.getId() + "] successfully delivered email to: " + finalRecipient);
                context.setVariable("node_email_status", "SENT");
                context.setVariable("delivered_to", finalRecipient);
        } catch (Exception e) {
            System.err.println("Resend API Failure in Node [" + node.getId() + "]: " + e.getMessage());
            throw new NodeExecutionException("Failed to deliver email via Resend in Node [" + node.getId() + "]: " + e.getMessage());
        }
    }
}
