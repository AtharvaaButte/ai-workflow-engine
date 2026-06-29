package com.atharva.workflow.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Workflow {
    private UUID id;
    private Metadata metadata;
    private List<Node> nodes;
    private List<Edge> edges;
}
