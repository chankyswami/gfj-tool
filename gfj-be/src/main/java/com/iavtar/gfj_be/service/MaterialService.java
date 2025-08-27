package com.iavtar.gfj_be.service;

import com.iavtar.gfj_be.entity.Material;
import com.iavtar.gfj_be.repository.MaterialRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MaterialService {

    @Autowired
    private MaterialRepository materialRepository;

    public List<Material> getAllMaterials() {
        return materialRepository.findAll();
    }

    public void addMaterial(Material material) {

        materialRepository.save(material);
    }

    public void updateMaterial(Material updatedMaterial) {
        Material material = materialRepository.findById(updatedMaterial.getId()).orElseThrow(() -> new RuntimeException("Material not found"));
        material.setTitle(updatedMaterial.getTitle());
        material.setPrice(updatedMaterial.getPrice());
        materialRepository.save(material);
    }

    public void deleteMaterial(Long id) {
        materialRepository.deleteById(id);
    }
}

