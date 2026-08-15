package com.atharva.workflow.engine;

import com.atharva.workflow.entity.NodeExecutionLogEntity;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class WorkflowContext
{
    @Getter
    private final Map<String, Object> variables =  new ConcurrentHashMap<>();

    @Getter
    private final List<NodeExecutionLogEntity> executionLogs = new ArrayList<>();

    @Setter
    private boolean isTermianted = false;

    public boolean hasVariable(String key) {
        if (key == null) return false;
        return this.variables.containsKey(key);
    }

    public void setVariable(String key, Object value){
        if (key != null){
            this.variables.put(key, value);
        }
    }

    public Object getVariable(String key){
        return this.variables.get(key);
    }

    public void termiante(){
        isTermianted = true;
    }

    public void logNodeStep(String nodeId, String nodeType, NodeExecutionLogEntity.NodeStatus status, String errorMessage, long durationMs) {
        NodeExecutionLogEntity log = NodeExecutionLogEntity.builder()
                .nodeId(nodeId)
                .nodeType(nodeType)
                .status(status)
                .errorMessage(errorMessage)
                .durationMs(durationMs)
                .executedAt(LocalDateTime.now())
                .build();

        this.executionLogs.add(log);
    }
}
