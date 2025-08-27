package com.iavtar.gfj_be.service;

import com.iavtar.gfj_be.entity.QuotationIdSequence;
import com.iavtar.gfj_be.repository.QuotationIdSequenceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.SimpleDateFormat;
import java.util.Date;

@Service
public class QuotationIdGeneratorService {

    private static final String PREFIX = "GFJ-QT";
    private static final SimpleDateFormat TIMESTAMP_FORMAT = new SimpleDateFormat("yyyyMMdd");

    @Autowired
    private QuotationIdSequenceRepository idSequenceRepository;

    @Transactional
    public String generateId() {
        String timestampKey = TIMESTAMP_FORMAT.format(new Date());
        QuotationIdSequence idSequence = idSequenceRepository.findById(timestampKey)
                .orElse(new QuotationIdSequence(timestampKey, 0));
        int nextSequence = idSequence.getLastSequence() + 1;
        idSequence.setLastSequence(nextSequence);
        idSequenceRepository.save(idSequence);
        String formattedSeq = String.format("%03d", nextSequence);
        return PREFIX + "-" + timestampKey + "-" + formattedSeq;
    }

}
