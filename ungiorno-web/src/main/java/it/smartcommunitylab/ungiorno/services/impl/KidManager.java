package it.smartcommunitylab.ungiorno.services.impl;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;

import javax.imageio.ImageIO;

import org.apache.commons.collections4.CollectionUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import it.smartcommunitylab.ungiorno.model.AuthPerson;
import it.smartcommunitylab.ungiorno.model.KidProfile;
import it.smartcommunitylab.ungiorno.model.Parent;
import it.smartcommunitylab.ungiorno.model.SectionDef;
import it.smartcommunitylab.ungiorno.services.RepositoryService;
import it.smartcommunitylab.ungiorno.utils.ImageUtils;
import it.smartcommunitylab.ungiorno.utils.Utils;

@Service
public class KidManager {

    private static final Logger logger = LoggerFactory.getLogger(KidManager.class);

    @Autowired
    @Value("${image.download.dir}")
    private String imageDownloadDir;

    private static final String PLACEHOLDER_KID_PICTURE = "placeholder_child.png";

    @Autowired
    private RepositoryService repoManager;


    public List<Parent> updateParents(KidProfile kid) {
        List<Parent> parents = retrieveParents(kid.getAppId(), kid.getPersons());
        repoManager.updateParents(kid.getAppId(), kid.getSchoolId(), parents);
        return parents;
    }

    public KidProfile updateKid(KidProfile kid) {
        return repoManager.updateKid(kid);
    }


    public KidProfile getKidProfile(String appId, String schoolId, String kidId) {
        return repoManager.getKidProfile(appId, schoolId, kidId);
    }

    public String getDefaultKidPicturePath() {
        return imageDownloadDir + "/" + PLACEHOLDER_KID_PICTURE;
    }

    public String getKidPicturePath(String appId, String schoolId, String kidId, boolean checkParticipation) {
        KidProfile kid = getKidProfile(appId, schoolId, kidId);
        if (kid != null && kid.getImage() != null && (!checkParticipation || kid.isPartecipateToSperimentation())) {
            return imageDownloadDir + "/" + kid.getImage();
        } else {
            return getDefaultKidPicturePath();
        }
    }

    public KidProfile addToGroup(String appId, String schoolId, String kidId, SectionDef group) {
        if (group == null) {
            throw new IllegalArgumentException("invalid null group");
        }
        if (!group.isGroup()) {
            throw new IllegalArgumentException(
                    String.format("%s is a section", group.getSectionId()));
        }
        KidProfile kid = repoManager.getKidProfile(appId, schoolId, kidId);
        if (kid != null) {
            List<SectionDef> groups = kid.getGroups();
            if (!groups.contains(group)) {
                groups.add(group);
                repoManager.updateKid(kid);
            }
        }
        return kid;
    }

    public KidProfile removeFromGroup(String appId, String schoolId, String kidId, String groupId) {
        KidProfile kid = repoManager.getKidProfile(appId, schoolId, kidId);
        if (kid != null) {
            List<SectionDef> groups = kid.getGroups();
            SectionDef groupToRemove = new SectionDef();
            groupToRemove.setSectionId(groupId);
            groups.remove(groupToRemove);
            repoManager.updateKid(kid);
        }
        return kid;
    }

    public KidProfile removeFromSection(String appId, String schoolId, String kidId,
            String sectionId) {
        KidProfile kid = repoManager.getKidProfile(appId, schoolId, kidId);
        if (kid != null) {
            kid.removeFromSection();
            repoManager.updateKid(kid);
        }
        return kid;
    }


    public KidProfile putInSection(String appId, String schoolId, String kidId,
            SectionDef section) {
        if (section == null) {
            throw new IllegalArgumentException("invalid null section");
        }
        if (section.isGroup()) {
            throw new IllegalArgumentException(
                    String.format("%s is a group", section.getSectionId()));
        }
        KidProfile kid = repoManager.getKidProfile(appId, schoolId, kidId);
        if (kid != null) {
            kid.setSection(section);
            repoManager.updateKid(kid);
        }
        return kid;
    }

    public KidProfile deleteKidPicture(String appId, String schoolId, String kidId) {
        KidProfile kid = getKidProfile(appId, schoolId, kidId);
        if (kid != null) {
            String pictureFileName = kid.getImage();
            if (pictureFileName != null) {
                File pictureFile = new File(imageDownloadDir + "/" + pictureFileName);
                boolean deleted = pictureFile.delete();
                if (deleted) {
                    logger.info("Removed picture for kid {}", kidId);
                    kid.setImage(null);
                    updateKid(kid);
                }
            }
        }
        return kid;

    }

    public String saveKidPicture(String kidId, MultipartFile pictureFile) throws IOException {

        InputStream is = pictureFile.getInputStream();

        String ext = pictureFile.getOriginalFilename()
                .substring(pictureFile.getOriginalFilename().lastIndexOf("."));
        String name = kidId + ext;
        String pathPicture = imageDownloadDir + "/" + name;

        ImageUtils.compressImage(ImageIO.read(is), pathPicture);
        //ImageUtils.store(is, new FileOutputStream(pathPicture));

        return name;
    }


    /**
     * Retrieve parents from {@link AuthPerson} and convert it in {@link Person}
     * 
     * NOTE: use first email setted as username for the Parent
     * 
     * @param appId
     * @param authorizedPersons
     * @return
     */
    private List<Parent> retrieveParents(String appId, List<AuthPerson> authorizedPersons) {
        List<Parent> parents = null;
        if (authorizedPersons != null) {
            parents = new ArrayList<>();
            for (AuthPerson authorizedPerson : authorizedPersons) {
                if (authorizedPerson.isParent()) {
                    Parent parent = Utils.toObject(authorizedPerson, Parent.class);
                    parent.setAppId(appId);
                    if (CollectionUtils.isNotEmpty(parent.getEmail())) {
                        parent.setUsername(parent.getEmail().get(0).toLowerCase());
                    }
                    parents.add(parent);
                }
            }
        }

        return parents;
    }

}
