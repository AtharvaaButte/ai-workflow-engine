package com.atharva.workflow.engine.handler;

import com.atharva.workflow.engine.WorkflowContext;
import com.atharva.workflow.model.Node;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Component("response")
public class ResponseHandler implements NodeHandler{
    @Override
    public void execute(Node node, WorkflowContext context) {
        Map<String, Object> finalOutput = new HashMap<>();
        Map<String, Object> config = node.getConfig();

        if (config != null && config.containsKey("responseKeys")){
            String[] keysToExtract = ((String)config.get("responseKeys")).split(",");

            for (String key : keysToExtract){
                String trimmedKey = key.trim();
                if (context.hasVariable(trimmedKey)){
                    finalOutput.put(trimmedKey, context.getVariable(trimmedKey));
                }
            }
        }
        if (finalOutput.isEmpty()){
            finalOutput.putAll(context.getVariables());
        }

        context.setVariable("FINAL_ENGINE_OUTPUT", finalOutput);
    }
}
