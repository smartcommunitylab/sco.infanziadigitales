package it.smartcommunitylab.ungiorno.importer;

import java.util.Date;

import org.hamcrest.Matchers;
import org.joda.time.LocalDate;
import org.junit.Assert;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.test.context.web.AnnotationConfigWebContextLoader;
import org.springframework.test.context.web.WebAppConfiguration;

import it.smartcommunitylab.ungiorno.model.KidProfile;
import it.smartcommunitylab.ungiorno.services.RepositoryService;
import it.smartcommunitylab.ungiorno.test_config.TestAppConfig;

@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(classes = {TestAppConfig.class},
        loader = AnnotationConfigWebContextLoader.class)
@WebAppConfiguration
public class ImportDataIntegrationTest {


    @Autowired
    private RepositoryService repositoryManager;


    @Test
    public void storeKidProfile() {
        KidProfile kid = new KidProfile();
        String kidId = "KID";
        String schoolId = "SCHOOL";
        String appId = "APP";
        kid.setKidId(kidId);
        kid.setSchoolId(schoolId);
        kid.setAppId(appId);
        Date birth = LocalDate.parse("2012-02-12").toDate();
        kid.setBirthDate(birth);

        KidProfile saved = repositoryManager.saveKidProfile(kid);
        Assert.assertThat(saved.getBirthDate(), Matchers.is(birth));

        // load data from DB
        saved = repositoryManager.getKidProfile(appId, schoolId, kidId);
        Assert.assertThat(saved.getBirthDate(), Matchers.is(birth));

    }



}
