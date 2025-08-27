package com.iavtar.gfj_be.entity;

import com.iavtar.gfj_be.entity.enums.DashboardTabs;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "dashboardTab")
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class DashboardTab {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Enumerated(EnumType.STRING)
    private DashboardTabs name;

    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (!(o instanceof DashboardTab))
            return false;
        DashboardTab that = (DashboardTab) o;
        return name == that.name;
    }

    @Override
    public int hashCode() {
        return name != null ? name.hashCode() : 0;
    }
}
