package com.whatisnew.service;

import com.whatisnew.dto.UsefulLinkDTO;
import java.util.List;

public interface UsefulLinkService {

    List<UsefulLinkDTO> getActiveLinks();

    List<UsefulLinkDTO> listAllLinks();

    UsefulLinkDTO createLink(UsefulLinkDTO dto);

    UsefulLinkDTO updateLink(Long id, UsefulLinkDTO dto);

    void deleteLink(Long id);
}
