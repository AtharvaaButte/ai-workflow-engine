package com.atharva.workflow.engine;

import com.atharva.workflow.engine.handler.NodeHandler;
import com.atharva.workflow.exception.NodeHandlerNotFoundException;
import org.springframework.stereotype.Component;

import java.util.Map;

/**
 * The central repository warehouse that manages all available NodeHandler strategies.
 * It uses Spring Boot to automatically map node type strings to their respective implementation classes.
 */

@Component
public class NodeHandlerRegistry {
    private final Map<String, NodeHandler> handlerMap;

    public NodeHandlerRegistry( Map<String, NodeHandler> handlerMap){
        this.handlerMap = handlerMap;
    }

    public NodeHandler getHandler(String nodeType){
        NodeHandler handler = handlerMap.get(nodeType);

        if (handler == null) {
            throw new NodeHandlerNotFoundException(
                    "No registered NodeHandler implementation found for node type: [" + nodeType + "]"
            );
        }
        return handler;
    }
}
