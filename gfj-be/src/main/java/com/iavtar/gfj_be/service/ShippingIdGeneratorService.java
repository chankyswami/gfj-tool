package com.iavtar.gfj_be.service;

import com.iavtar.gfj_be.entity.LedgerIdSequence;
import com.iavtar.gfj_be.entity.ShippingIdSequence;
import com.iavtar.gfj_be.repository.LedgerIdSequenceRepository;
import com.iavtar.gfj_be.repository.ShippingIdSequenceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.SimpleDateFormat;
import java.util.Date;

@Service
public class ShippingIdGeneratorService {

    private static final String PREFIX = "GFJ-SHP";
    private static final SimpleDateFormat TIMESTAMP_FORMAT = new SimpleDateFormat("yyyyMMdd");

    @Autowired
    private ShippingIdSequenceRepository idSequenceRepository;

    @Transactional
    public String generateId() {
        String timestampKey = TIMESTAMP_FORMAT.format(new Date());
        ShippingIdSequence idSequence = idSequenceRepository.findById(timestampKey)
                .orElse(new ShippingIdSequence(timestampKey, 0));
        int nextSequence = idSequence.getLastSequence() + 1;
        idSequence.setLastSequence(nextSequence);
        idSequenceRepository.save(idSequence);
        String formattedSeq = String.format("%03d", nextSequence);
        return PREFIX + "-" + timestampKey + "-" + formattedSeq;
    }

}
