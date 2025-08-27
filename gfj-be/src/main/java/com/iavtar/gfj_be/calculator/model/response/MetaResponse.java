package com.iavtar.gfj_be.calculator.model.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Builder
@Getter
@Setter
@AllArgsConstructor
public class MetaResponse {

    private int totalGems;

    private double totalWeight;

    private List<DiamondCaratCalculationResponse> used;

}
