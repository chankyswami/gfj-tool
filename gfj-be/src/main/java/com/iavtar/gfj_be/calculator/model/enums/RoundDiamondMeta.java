package com.iavtar.gfj_be.calculator.model.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum RoundDiamondMeta {

    //-------------1 section
    MM_0_5(0.50, 0.0018),
    MM_0_6(0.60, 0.002),
    MM_0_7(0.70, 0.0025),
    MM_0_8(0.80, 0.0025),
    MM_0_9(0.90, 0.004),
    MM_1(1.00, 0.005),
    MM_1_1(1.10, 0.0055),
    MM_1_15(1.15, 0.0067),
    MM_1_2(1.20, 0.0075),
    MM_1_25(1.25, 0.009),
    MM_1_3(1.30, 0.01),
    MM_1_35(1.35, 0.011),
    MM_1_4(1.40, 0.012),
    MM_1_45(1.45, 0.013),
    MM_1_5(1.50, 0.015),
    MM_1_55(1.55, 0.017),
    MM_1_6(1.60, 0.019),
    MM_1_7(1.70, 0.022),
    MM_1_75(1.75, 0.023),
    MM_1_8(1.80, 0.024),
    MM_1_9(1.90, 0.03),
    MM_2_0(2.00, 0.035),
    MM_2_1(2.10, 0.04),
    MM_2_2(2.20, 0.046),
    MM_2_25(2.25, 0.04),
    MM_2_3(2.30, 0.052),
    //-------------1 section

    //-------------2 section
    MM_2_4(2.40, 0.058),
    MM_2_5(2.50, 0.07),
    MM_2_6(2.60, 0.075),
    MM_2_75(2.75, 0.08),
    //-------------2 section

    //-------------3 section
    MM_2_8(2.80, 0.09),
    MM_2_9(2.90, 0.10),
    MM_3_0(3.00, 0.11),
    MM_3_1(3.10, 0.12),
    MM_3_2(3.20, 0.13),
    MM_3_3(3.30, 0.15),
    //-------------3 section

    MM_3_4(3.40, 0.16),
    MM_3_25(3.25, 0.14),
    MM_3_5(3.50, 0.17),
    MM_3_75(3.75, 0.21),
    MM_4_0(4.00, 0.25),
    MM_4_25(4.25, 0.28),
    MM_4_5(4.50, 0.36),
    MM_4_75(4.75, 0.44),
    MM_5_0(5.00, 0.5),
    MM_5_25(5.25, 0.56),
    MM_5_5(5.50, 0.66),
    MM_5_75(5.75, 0.75),
    MM_6_0(6.00, 0.84),
    MM_6_25(6.25, 0.93),
    MM_6_5(6.50, 1.0),
    MM_6_8(6.80, 1.25),
    MM_7_0(7.00, 1.3),
    MM_7_3(7.30, 1.5),
    MM_7_5(7.50, 1.67),
    MM_7_75(7.75, 1.75),
    MM_8_0(8.00, 2.0),
    MM_8_25(8.25, 2.11),
    MM_8_5(8.50, 2.43),
    MM_8_7(8.70, 2.5),
    MM_9_0(9.00, 2.75),
    MM_9_1(9.10, 3.0),
    MM_9_5(9.50, 3.35),
    MM_9_75(9.75, 3.61),
    MM_10_0(10.00, 3.87),
    MM_10_25(10.25, 4.16),
    MM_10_5(10.50, 4.41),
    MM_10_75(10.75, 4.57),
    MM_11_0(11.00, 4.91),
    MM_11_25(11.25, 5.49),
    MM_11_5(11.50, 5.85),
    MM_12_0(12.00, 6.84),
    MM_12_25(12.25, 7.26),
    MM_12_5(12.50, 7.36),
    MM_12_75(12.75, 7.52),
    MM_13_0(13.00, 8.51),
    MM_13_5(13.50, 9.53),
    MM_14_0(14.00, 10.49),
    MM_15_0(15.00, 12.89),
    MM_16_0(16.00, 16.06);

    private double mmSize;
    private double caratWeight;

    public static Double fromValue(String size) {
        for (RoundDiamondMeta meta : values()) {
            if (meta.getMmSize() == Double.parseDouble(size.trim())) {
                return meta.getCaratWeight();
            }
        }
        for (RoundDiamondMeta meta : values()) {
            if (meta.getMmSize() > Double.parseDouble(size.trim())) {
                return meta.getCaratWeight();
            }
        }
        throw new IllegalArgumentException("Unexpected value " + size);
    }

}

