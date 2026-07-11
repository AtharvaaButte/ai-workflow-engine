package com.atharva.workflow.engine;

import lombok.Getter;
import lombok.Setter;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Getter
public class WorkflowContext
{
    private final Map<String, Object> variables =  new ConcurrentHashMap<>();

    @Setter
    private boolean isTermianted = false;

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
