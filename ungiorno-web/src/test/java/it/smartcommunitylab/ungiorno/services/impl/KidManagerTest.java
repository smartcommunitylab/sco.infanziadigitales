package it.smartcommunitylab.ungiorno.services.impl;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import org.hamcrest.Matchers;
import org.junit.Assert;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.support.AnnotationConfigContextLoader;

import it.smartcommunitylab.ungiorno.model.AuthPerson;
import it.smartcommunitylab.ungiorno.model.KidProfile;
import it.smartcommunitylab.ungiorno.model.Parent;
import it.smartcommunitylab.ungiorno.test_config.KidManagerTestConfig;

// @RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(classes = {KidManagerTestConfig.class},
        loader = AnnotationConfigContextLoader.class)
public class KidManagerTest {

    @Autowired
    private KidManager kidManager;


    // @Test
    public void kidProfileWithNullPersonsList() {
        final String appId = "app-1";
        final String schoolId = "school1-";

        KidProfile kid = new KidProfile();
        kid.setAppId(appId);
        kid.setSchoolId(schoolId);
        List<Parent> parents = kidManager.updateParents(kid);

        Assert.assertThat(parents, Matchers.nullValue());
    }

    // @Test
    public void kidProfileWithEmptyPersonsList() {
        final String appId = "app-1";
        final String schoolId = "school1-";
        KidProfile kid = new KidProfile();
        kid.setAppId(appId);
        kid.setSchoolId(schoolId);
        kid.setPersons(Collections.<AuthPerson>emptyList());
        List<Parent> parents = kidManager.updateParents(kid);
        Assert.assertThat(parents, Matchers.hasSize(0));
    }

    // @Test
    public void kidProfileWithOneParent() {
        final String appId = "app-1";
        final String schoolId = "school1-";
        KidProfile kid = new KidProfile();
        kid.setAppId(appId);
        kid.setSchoolId(schoolId);
        List<AuthPerson> persons = new ArrayList<>();
        AuthPerson person = new AuthPerson();
        person.setAdult(true);
        person.setParent(true);
        person.setFirstName("FNAME");
        person.setLastName("LNAME");
        person.setPersonId("CF-PERSON-1");
        persons.add(person);
        kid.setPersons(persons);

        Parent parent = new Parent();
        parent.setAppId(appId);
        parent.setFirstName("FNAME");
        parent.setLastName("LNAME");
        parent.setPersonId("CF-PERSON-1");
        parent.setUsername("USERNAME");

        List<Parent> parents = kidManager.updateParents(kid);
        Assert.assertThat(parents, Matchers.hasSize(1));
        Assert.assertThat(parents, Matchers.contains(parent));
    }



}

