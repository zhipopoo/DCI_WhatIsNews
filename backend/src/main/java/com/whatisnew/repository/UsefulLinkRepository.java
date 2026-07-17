package com.whatisnew.repository;

import com.whatisnew.entity.UsefulLink;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UsefulLinkRepository extends JpaRepository<UsefulLink, Long> {

    List<UsefulLink> findByIsActiveTrueOrderBySortOrderAsc();

    List<UsefulLink> findAllByOrderBySortOrderAsc();
}
