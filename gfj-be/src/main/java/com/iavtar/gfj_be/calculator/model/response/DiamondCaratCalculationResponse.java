package com.iavtar.gfj_be.calculator.model.response;


import lombok.*;

import java.util.Map;

@Builder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class DiamondCaratCalculationResponse {

    private int totalGems;

    private double totalWeight;

    private Object unused;

    private Map<String, Object> rounds;

    private Map<String, Object> baguettes;

}
