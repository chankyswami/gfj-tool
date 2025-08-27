package com.iavtar.gfj_be.calculator.model.descriptor;

import lombok.*;

@Builder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class DiamondAndCaratDescriptor {

    private String cutType;

    private String diamondQuantity;

    private String sizeX;

    private String sizeY;

}