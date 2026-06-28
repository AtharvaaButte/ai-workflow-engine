package model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Workflow {
    private Metadata metadata;
    private List<Node> nodes;
    private List<Edge> edges;
}
