package it.smartcommunitylab.ungiorno.services.impl;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import it.smartcommunitylab.ungiorno.model.AuthPerson;
import it.smartcommunitylab.ungiorno.model.KidProfile;
import it.smartcommunitylab.ungiorno.model.Parent;
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
