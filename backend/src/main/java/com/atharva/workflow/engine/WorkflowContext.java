package com.atharva.workflow.engine;

import lombok.Getter;
import lombok.Setter;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class WorkflowContext
{
    @Getter
    private final Map<String, Object> variables =  new ConcurrentHashMap<>();

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
}
