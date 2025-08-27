package com.iavtar.gfj_be.calculator.service;

import com.iavtar.gfj_be.calculator.model.descriptor.DiamondAndCaratDescriptor;
import com.iavtar.gfj_be.calculator.model.enums.BaguetteStraightDiamondMeta;
import com.iavtar.gfj_be.calculator.model.enums.RoundDiamondMeta;
import com.iavtar.gfj_be.calculator.model.response.DiamondAndCaratDescriptorResponse;
import com.iavtar.gfj_be.calculator.model.response.DiamondAndCaratMetaDescriptorResponse;
import com.iavtar.gfj_be.calculator.model.response.DiamondCaratCalculationResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
public class DiamondCaratCalculationServiceImpl implements DiamondCaratCalculationService {

    public ResponseEntity<?> calculate(MultipartFile file) {
        if (file.isEmpty()) {
            return null;
        }
        try (BufferedReader br = new BufferedReader(new InputStreamReader(file.getInputStream()))) {
            List<DiamondAndCaratDescriptor> diamondAndCrateDescriptorList = new ArrayList<>();
            String line;
            while ((line = br.readLine()) != null) {
                if (line.isEmpty()) {
                    break;
                }
                String[] values = line.split(",");
                diamondAndCrateDescriptorList.add(
                        DiamondAndCaratDescriptor.builder()
                                .cutType(values[2])
                                .diamondQuantity(values[0])
                                .sizeX(values[4].substring(3))
                                .sizeY(values[5].substring(3))
                                .build()
                );
            }
            DiamondCaratCalculationResponse response = new DiamondCaratCalculationResponse();
            List<DiamondAndCaratDescriptor> roundsList = new ArrayList<>();
            List<DiamondAndCaratDescriptor> baguetteList = new ArrayList<>();
            List<DiamondAndCaratDescriptor> unusedList = new ArrayList<>();
            aggregateToList(roundsList, baguetteList, unusedList, diamondAndCrateDescriptorList);
            calculateRound(roundsList, response);
            calculateBaguette(baguetteList, response);
            response.setUnused(unusedList);
            response.setTotalWeight(Math.round(response.getTotalWeight() * 1000) / 1000.0);
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception exception) {
            log.error(exception.getMessage());
            throw new RuntimeException(exception.getMessage());
        }
    }

    private void calculateRound(List<DiamondAndCaratDescriptor> roundsList,
                                DiamondCaratCalculationResponse response) {
        List<DiamondAndCaratMetaDescriptorResponse> mm_0_5_to_mm_2_3_List = new ArrayList<>();
        List<DiamondAndCaratMetaDescriptorResponse> mm_2_4_to_mm_2_75_List = new ArrayList<>();
        List<DiamondAndCaratMetaDescriptorResponse> mm_2_8_to_mm_3_3_List = new ArrayList<>();
        List<DiamondAndCaratMetaDescriptorResponse> mm_above_3_List = new ArrayList<>();
        int totalQuantity1 = 0;
        double totalWeight1 = 0;
        int totalQuantity2 = 0;
        double totalWeight2 = 0;
        int totalQuantity3 = 0;
        double totalWeight3 = 0;
        int totalQuantity4 = 0;
        double totalWeight4 = 0;
        for (DiamondAndCaratDescriptor data : roundsList) {
            response.setTotalGems(response.getTotalGems() + Integer.parseInt(data.getDiamondQuantity().trim()));
            if (Double.parseDouble(data.getSizeX()) >= RoundDiamondMeta.MM_0_5.getMmSize() &&
                    Double.parseDouble(data.getSizeX()) <= RoundDiamondMeta.MM_2_3.getMmSize()) {
                totalQuantity1 += Integer.parseInt(data.getDiamondQuantity().trim());
                Double caratWeight1 = RoundDiamondMeta.fromValue(data.getSizeX().trim());
                double res1 = Integer.parseInt(data.getDiamondQuantity().trim()) * caratWeight1;
                totalWeight1 += res1;
                mm_0_5_to_mm_2_3_List.add(
                        DiamondAndCaratMetaDescriptorResponse.builder()
                                .diamondQuantity(data.getDiamondQuantity())
                                .size(data.getSizeX())
                                .build()
                );
            } else if ((Double.parseDouble(data.getSizeX()) >= RoundDiamondMeta.MM_2_4.getMmSize() &&
                    Double.parseDouble(data.getSizeX()) <= RoundDiamondMeta.MM_2_75.getMmSize())) {
                totalQuantity2 += Integer.parseInt(data.getDiamondQuantity().trim());
                Double caratWeight2 = RoundDiamondMeta.fromValue(data.getSizeX().trim());
                double res2 = Integer.parseInt(data.getDiamondQuantity().trim()) * caratWeight2;
                totalWeight2 += res2;
                mm_2_4_to_mm_2_75_List.add(DiamondAndCaratMetaDescriptorResponse.builder()
                        .diamondQuantity(data.getDiamondQuantity())
                        .size(data.getSizeX())
                        .build());
            } else if ((Double.parseDouble(data.getSizeX()) >= RoundDiamondMeta.MM_2_8.getMmSize() &&
                    Double.parseDouble(data.getSizeX()) <= RoundDiamondMeta.MM_3_3.getMmSize())) {
                totalQuantity3 += Integer.parseInt(data.getDiamondQuantity().trim());
                Double caratWeight3 = RoundDiamondMeta.fromValue(data.getSizeX().trim());
                double res3 = Integer.parseInt(data.getDiamondQuantity().trim()) * caratWeight3;
                totalWeight3 += res3;
                mm_2_8_to_mm_3_3_List.add(DiamondAndCaratMetaDescriptorResponse.builder()
                        .diamondQuantity(data.getDiamondQuantity())
                        .size(data.getSizeX())
                        .build());
            } else {
                totalQuantity4 += Integer.parseInt(data.getDiamondQuantity().trim());
                Double caratWeight4 = RoundDiamondMeta.fromValue(data.getSizeX().trim());
                double res4 = Integer.parseInt(data.getDiamondQuantity().trim()) * caratWeight4;
                totalWeight4 += res4;
                mm_above_3_List.add(DiamondAndCaratMetaDescriptorResponse.builder()
                        .diamondQuantity(data.getDiamondQuantity())
                        .size(data.getSizeX())
                        .build());
            }
        }
        Map<String, Object> roundsDataMappings = new HashMap<>();
        roundsDataMappings.put(
                "0.50-2.30",
                DiamondAndCaratDescriptorResponse
                        .builder()
                        .totalWeight(Math.round(totalWeight1 * 1000) / 1000.0)
                        .totalGems(totalQuantity1)
                        .meta(mm_0_5_to_mm_2_3_List)
                        .build()
        );
        roundsDataMappings.put(
                "2.40-2.75",
                DiamondAndCaratDescriptorResponse
                        .builder()
                        .totalWeight(Math.round(totalWeight2 * 1000) / 1000.0)
                        .totalGems(totalQuantity2)
                        .meta(mm_2_4_to_mm_2_75_List)
                        .build()
        );
        roundsDataMappings.put(
                "2.80-3.30",
                DiamondAndCaratDescriptorResponse
                        .builder()
                        .totalWeight(Math.round(totalWeight3 * 1000) / 1000.0)
                        .totalGems(totalQuantity3)
                        .meta(mm_2_8_to_mm_3_3_List)
                        .build()
        );
        roundsDataMappings.put(
                "Above-3.30",
                DiamondAndCaratDescriptorResponse
                        .builder()
                        .totalWeight(Math.round(totalWeight4 * 1000) / 1000.0)
                        .totalGems(totalQuantity4)
                        .meta(mm_above_3_List)
                        .build()
        );
        response.setRounds(roundsDataMappings);
        response.setTotalWeight(response.getTotalWeight() + totalWeight1 + totalWeight2 + totalWeight3 + totalWeight4);
    }

    private void calculateBaguette(List<DiamondAndCaratDescriptor> baguetteList,
                                   DiamondCaratCalculationResponse response) {
        List<DiamondAndCaratMetaDescriptorResponse> mm_1_5_to_mm_2_1_List = new ArrayList<>();
        List<DiamondAndCaratMetaDescriptorResponse> mm_2_2_to_mm_2_6_List = new ArrayList<>();
        List<DiamondAndCaratMetaDescriptorResponse> mm_2_7_to_mm_4_List = new ArrayList<>();
        List<DiamondAndCaratMetaDescriptorResponse> mm_above_4_List = new ArrayList<>();
        int totalQuantity1 = 0;
        double totalWeight1 = 0;
        int totalQuantity2 = 0;
        double totalWeight2 = 0;
        int totalQuantity3 = 0;
        double totalWeight3 = 0;
        int totalQuantity4 = 0;
        double totalWeight4 = 0;
        for(DiamondAndCaratDescriptor data : baguetteList) {
            response.setTotalGems(response.getTotalGems() + Integer.parseInt(data.getDiamondQuantity().trim()));
            double x = Math.max(Double.parseDouble(data.getSizeX()), Double.parseDouble(data.getSizeY()));
            if(x <= BaguetteStraightDiamondMeta.MM_9.getXFrom()) {
                totalQuantity1 += Integer.parseInt(data.getDiamondQuantity().trim());
                double caratWeight1 = BaguetteStraightDiamondMeta.fromValue(x, x == Double.parseDouble(
                        data.getSizeX()) ? Double.parseDouble(data.getSizeY()) : Double.parseDouble(data.getSizeX())
                );
                double res1 = Integer.parseInt(data.getDiamondQuantity().trim()) * caratWeight1;
                totalWeight1 += res1;
                mm_1_5_to_mm_2_1_List.add(
                        DiamondAndCaratMetaDescriptorResponse.builder()
                                .diamondQuantity(data.getDiamondQuantity())
                                .size(String.valueOf(x))
                                .build()
                );
            } else if (x >= BaguetteStraightDiamondMeta.MM_10.getXFrom() &&
                    x <= BaguetteStraightDiamondMeta.MM_20.getXFrom()) {
                totalQuantity2 += Integer.parseInt(data.getDiamondQuantity().trim());
                double caratWeight2 = BaguetteStraightDiamondMeta.fromValue(x, x == Double.parseDouble(
                        data.getSizeX()) ? Double.parseDouble(data.getSizeY()) : Double.parseDouble(data.getSizeX())
                );
                double res2 = Integer.parseInt(data.getDiamondQuantity().trim()) * caratWeight2;
                totalWeight2 += res2;
                mm_2_2_to_mm_2_6_List.add(
                        DiamondAndCaratMetaDescriptorResponse.builder()
                                .diamondQuantity(data.getDiamondQuantity())
                                .size(String.valueOf(x))
                                .build()
                );
            } else if (x >= BaguetteStraightDiamondMeta.MM_21.getXFrom() &&
                    x <= BaguetteStraightDiamondMeta.MM_46.getXFrom()) {
                totalQuantity3 += Integer.parseInt(data.getDiamondQuantity().trim());
                double caratWeight3 = BaguetteStraightDiamondMeta.fromValue(x, x == Double.parseDouble(
                        data.getSizeX()) ? Double.parseDouble(data.getSizeY()) : Double.parseDouble(data.getSizeX())
                );
                double res3 = Integer.parseInt(data.getDiamondQuantity().trim()) * caratWeight3;
                totalWeight3 += res3;
                mm_2_7_to_mm_4_List.add(
                        DiamondAndCaratMetaDescriptorResponse.builder()
                                .diamondQuantity(data.getDiamondQuantity())
                                .size(String.valueOf(x))
                                .build()
                );
            } else {
                totalQuantity4 += Integer.parseInt(data.getDiamondQuantity().trim());
                double caratWeight4 = BaguetteStraightDiamondMeta.fromValue(x, x == Double.parseDouble(
                        data.getSizeX()) ? Double.parseDouble(data.getSizeY()) : Double.parseDouble(data.getSizeX())
                );
                double res4 = Integer.parseInt(data.getDiamondQuantity().trim()) * caratWeight4;
                totalWeight4 += res4;
                mm_above_4_List.add(
                        DiamondAndCaratMetaDescriptorResponse.builder()
                                .diamondQuantity(data.getDiamondQuantity())
                                .size(String.valueOf(x))
                                .build()
                );
            }
        }
        Map<String, Object> bageatteDataMappings = new HashMap<>();
        bageatteDataMappings.put(
                "1.50-2.10",
                DiamondAndCaratDescriptorResponse
                        .builder()
                        .totalWeight(Math.round(totalWeight1 * 1000) / 1000.0)
                        .totalGems(totalQuantity1)
                        .meta(mm_1_5_to_mm_2_1_List)
                        .build()
        );
        bageatteDataMappings.put(
                "2.20-2.60",
                DiamondAndCaratDescriptorResponse
                        .builder()
                        .totalWeight(Math.round(totalWeight2 * 1000) / 1000.0)
                        .totalGems(totalQuantity2)
                        .meta(mm_2_2_to_mm_2_6_List)
                        .build()
        );
        bageatteDataMappings.put(
                "2.70-4.00",
                DiamondAndCaratDescriptorResponse
                        .builder()
                        .totalWeight(Math.round(totalWeight3 * 1000) / 1000.0)
                        .totalGems(totalQuantity3)
                        .meta(mm_2_7_to_mm_4_List)
                        .build()
        );
        bageatteDataMappings.put(
                "Above-4.00",
                DiamondAndCaratDescriptorResponse
                        .builder()
                        .totalWeight(Math.round(totalWeight4 * 1000) / 1000.0)
                        .totalGems(totalQuantity4)
                        .meta(mm_above_4_List)
                        .build()
        );
        response.setBaguettes(bageatteDataMappings);
        response.setTotalWeight(response.getTotalWeight() + totalWeight1 + totalWeight2 + totalWeight3 + totalWeight4);
    }

    private void aggregateToList(List<DiamondAndCaratDescriptor> roundsList,
                                 List<DiamondAndCaratDescriptor> baguetteList,
                                 List<DiamondAndCaratDescriptor> unusedList,
                                 List<DiamondAndCaratDescriptor> diamondAndCrateDescriptorList) {
        for (DiamondAndCaratDescriptor descriptor : diamondAndCrateDescriptorList) {
            switch (descriptor.getCutType().trim()) {
                case "Round":
                    roundsList.add(descriptor);
                    break;
                case "Baguette Straight":
                    baguetteList.add(descriptor);
                    break;
                default:
                    unusedList.add(descriptor);
            }
        }
    }

}
