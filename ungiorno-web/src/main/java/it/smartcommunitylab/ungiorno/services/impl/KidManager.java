package it.smartcommunitylab.ungiorno.services.impl;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import it.smartcommunitylab.ungiorno.model.AuthPerson;
import it.smartcommunitylab.ungiorno.model.KidProfile;
import it.smartcommunitylab.ungiorno.model.Parent;
import it.smartcommunitylab.ungiorno.model.SectionDef;
import it.smartcommunitylab.ungiorno.services.RepositoryService;
import it.smartcommunitylab.ungiorno.utils.Utils;

@Service
public class KidManager {

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



    private List<Parent> retrieveParents(String appId, List<AuthPerson> authorizedPersons) {
        List<Parent> parents = null;
        if (authorizedPersons != null) {
            parents = new ArrayList<>();
            for (AuthPerson authorizedPerson : authorizedPersons) {
                if (authorizedPerson.isParent()) {
                    Parent parent = Utils.toObject(authorizedPerson, Parent.class);
                    parent.setAppId(appId);
                    parents.add(parent);
                }
            }
        }

        return parents;
    }
}
