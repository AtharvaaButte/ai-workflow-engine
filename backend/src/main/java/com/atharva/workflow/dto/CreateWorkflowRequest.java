package com.atharva.workflow.dto;

import com.atharva.workflow.model.Edge;
import com.atharva.workflow.model.Metadata;
import com.atharva.workflow.model.Node;
import lombok.Data;

import java.util.List;

@Data
public class CreateWorkflowRequest {
    private Metadata metadata;
    private List<Node> nodes;
    private List<Edge> edges;
}
