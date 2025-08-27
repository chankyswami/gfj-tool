package com.iavtar.gfj_be.calculator.model.response;

import lombok.*;

import java.util.List;

@Builder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class DiamondAndCaratDescriptorResponse {

    private int totalGems;

    private double totalWeight;

    List<DiamondAndCaratMetaDescriptorResponse> meta;

}
